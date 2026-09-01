from drf_spectacular.utils import extend_schema, inline_serializer

from rest_framework import serializers
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import APIView
from rest_framework.exceptions import ValidationError

from agents.serializers.input_serializers import ResumeAnalysisSerializer, JobSearchInputSerializer

from jobs.serializers import JobPostCreateSerializer, JobPostSerializer, JobPostListSerializer
from jobs.permissions import IsJobOwner
from jobs.filters import JobPostFilter
from jobs.choices import JobPostStatus
from jobs.models import JobPost
from jobs.tasks import process_ai_search_task, analyze_resume_task
from jobs.utils.pdf_handler import extract_text_from_pdf
from jobs.pagination import JobPostPagination

from celery.result import AsyncResult

import logging

jobs_logger = logging.getLogger("jobs")

RESUME_ANALYSIS_STARTED_MESSAGE = "Resume analize Started"
JOB_SEARCH_STARTED_MESSAGE = "Searching for jobs..."

# Create your views here.

class JobPostListView(generics.ListAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostListSerializer
    permission_classes = [AllowAny]
    filterset_class = JobPostFilter
    ordering_fields = ["posted_at", "salary"]
    pagination_class = JobPostPagination

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.query_params.get("ordering"):
            return qs.order_by("?")
        return qs

class JobPostCreateView(generics.CreateAPIView):
    serializer_class = JobPostCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(
            posted_by=self.request.user
        )

class ResumeAnalysisView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeAnalysisSerializer

    @extend_schema(
        responses=inline_serializer(
            name="ResumeAnalysisStart",
            fields={
                "task_id": serializers.CharField(),
                "message": serializers.CharField(),
            },
        )
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_file = serializer.validated_data['resume']
        job_id = self.kwargs.get("job_id")

        if not resume_file.name.endswith(".pdf"):
            raise ValidationError("Only PDF files are supported.")

        resume_content = extract_text_from_pdf(resume_file)
        if not resume_content or resume_content.startswith("Error:"):
            raise ValidationError("Could not extract text from the PDF.")

        task = analyze_resume_task.delay(job_id, resume_content)

        return Response({"task_id": task.id, "message": RESUME_ANALYSIS_STARTED_MESSAGE}, status=status.HTTP_202_ACCEPTED)

class GetJobsByAgentView(generics.GenericAPIView):
    serializer_class = JobSearchInputSerializer

    @extend_schema(
        responses=inline_serializer(
            name="JobSearchStart",
            fields={
                "task_id": serializers.CharField(),
                "message": serializers.CharField(),
            },
        )
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_prompt = serializer.validated_data["user_prompt"]
        
        jobs_logger.info(f"User sent their prompt: {user_prompt}")
        
        task = process_ai_search_task.delay(user_prompt)
        
        jobs_logger.debug(f"Generated a new task: task_id={task.id}")
        
        return Response({"task_id": task.id, "message": JOB_SEARCH_STARTED_MESSAGE}, status=status.HTTP_202_ACCEPTED)

class GetOwnerJobPostListView(generics.ListAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        
        if getattr(self, "swagger_fake_view", False):
                    return JobPost.objects.none()
        
        return JobPost.objects.filter(posted_by=self.request.user).exclude(status=JobPostStatus.ARCHIVED)

class JobPostRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated, IsJobOwner]

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
    
    def perform_destroy(self, instance):
        instance.status = JobPostStatus.ARCHIVED
        instance.save()

class JobPostRetrieveView(generics.RetrieveAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostSerializer
    lookup_field = "id"
    lookup_url_kwarg = "job_id"

    def get_queryset(self):
        return JobPost.objects.filter(
            id=self.kwargs["job_id"]
        )

class TaskStatusView(APIView):

    @extend_schema(
        responses=inline_serializer(
            name="TaskStatusResponse",
            fields={
                "task_id": serializers.CharField(),
                "status": serializers.CharField(),
                "result": serializers.JSONField(allow_null=True),
                "error": serializers.CharField(allow_null=True, required=False),
            },
        )
    )
    def get(self, request, task_id, *args, **kwargs):
        task_result = AsyncResult(task_id)

        data = {
            "task_id": task_id,
            "status": task_result.status,
            "result": None,
        }

        if task_result.ready():
            if task_result.status in ("FAILURE", "REVOKED", "RETRY"):
                data["error"] = (
                    str(task_result.result)
                    if task_result.result
                    else f"Task ended with status: {task_result.status}"
                )
            else:
                data["result"] = task_result.result

        jobs_logger.debug(
            "Task status for %s -> STATUS:%s READY:%s RESULT:%s",
            task_id,
            task_result.status,
            task_result.ready(),
            task_result.result if task_result.ready() else None,
        )

        return Response(data)