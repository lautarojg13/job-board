from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import APIView

from agents.serializers.input_serializers import ResumeAnalysisSerializer, JobSearchInputSerializer

from jobs.serializers import JobPostCreateSerializer, JobPostSerializer, JobPostListSerializer
from jobs.permissions import IsJobOwner
from jobs.filters import JobPostFilter
from jobs.choices import JobPostStatus
from jobs.models import JobPost
from jobs.tasks import process_ai_search_task, analyze_resume_task

from celery.result import AsyncResult

# Create your views here.

class JobPostListView(generics.ListAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostListSerializer
    permission_classes = [AllowAny]
    filterset_class = JobPostFilter
    ordering_fields = ["posted_at", "salary"]

    ordering = ["-posted_at"]
    
class JobPostCreateView(generics.CreateAPIView):
    queryset = JobPost.objects.all()
    serializer_class = JobPostCreateSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        serializer.save(
            posted_by=self.request.user
        )

class ResumeAnalysisView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ResumeAnalysisSerializer

    async def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_file = serializer.validated_data['resume']
        job_id = self.kwargs.get("job_id")

        task = analyze_resume_task.delay(job_id, resume_file)

        return Response({"task_id": task.id, "message": "Análisis de CV iniciado"}, status=status.HTTP_202_ACCEPTED)

class GetJobsByAgentView(generics.GenericAPIView):
    serializer_class = JobSearchInputSerializer
    
    async def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_prompt = serializer.validated_data["user_prompt"]
        
        task = process_ai_search_task.delay(user_prompt)
        
        return Response({"task_id": task.id, "message": "Searching for jobs..."}, status=status.HTTP_202_ACCEPTED)

class GetOwnerJobPostListView(generics.ListAPIView):
    serializer_class = JobPostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return JobPost.objects.filter(posted_by=self.request.user)

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

    def get(self, request, task_id, *args, **kwargs):
        task_result = AsyncResult(task_id)
        
        return Response({
            "task_id": task_id,
            "status": task_result.status,
            "result": task_result.result if task_result.ready() else None
        })