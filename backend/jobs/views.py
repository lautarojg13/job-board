from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status, generics

from agent.serializers.input_serializers import ResumeAnalysisSerializer, JobSearchInputSerializer


from .serializers import JobPostCreateSerializer, JobPostSerializer, JobPostListSerializer
from .permissions import IsJobOwner
from .filters import JobPostFilter
from .choices import JobPostStatus
from .models import JobPost
from .services import analyze_resume_service, get_jobs_by_agent_service

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

        analysis = await analyze_resume_service(resume_file, job_id)

        return Response(analysis, status=status.HTTP_200_OK)

class GetJobsByAgentView(generics.GenericAPIView):
    serializer_class = JobSearchInputSerializer
    
    async def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_prompt = serializer.validated_data["user_prompt"]
        
        task = process_ai_search.delay(user_prompt)
        
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