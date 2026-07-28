from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, generics

from jobs.models import JobPost

from applications.models import Application
from applications.serializers import ApplicationDetailSerializer, ApplicationListSerializer, ApplicationStatusUpdateSerializer, ApplicationResponseSerializer, ApplicationCreateSerializer
from applications.services import apply_to_job_service, respond_to_application_service, withdraw_application_service
from applications.permissions import IsJobOwner, CanAccessApplication
from applications.filters import ApplicationFilter


# Create your views here.

class ApplyToJobView(generics.CreateAPIView):
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_job(self):
        job_id = self.kwargs.get("job_id")
        return get_object_or_404(JobPost, id=job_id)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["user"] = self.request.user
        context["job"] = self.get_job()
        return context

    def perform_create(self, serializer):
        apply_to_job_service(
            user=self.request.user,
            job=self.get_job(),
            **serializer.validated_data
        )


class ApplicationDetailView(generics.RetrieveAPIView):
    serializer_class = ApplicationDetailSerializer
    permission_classes = [IsAuthenticated, CanAccessApplication]

    queryset = Application.objects.all()
    lookup_field = "id"
    lookup_url_kwarg = "application_id"

class RespondToApplicationView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated, IsJobOwner]
    http_method_names = ["patch"]
    serializer_class = ApplicationStatusUpdateSerializer

    def get_object(self):
        return get_object_or_404(
            Application,
            id=self.kwargs["application_id"]
        )

    def update(self, request, *args, **kwargs):
        
        application = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        response = respond_to_application_service(
            application=application,
            responder=request.user,
            status=serializer.validated_data["application_status"],
            message=serializer.validated_data.get("message"),
        )
        
        return Response(
            ApplicationResponseSerializer(response).data,
            status=status.HTTP_200_OK
        )
    
class WithdrawApplicationView(generics.UpdateAPIView):
    queryset = Application.objects.all()
    permission_classes = [IsAuthenticated, CanAccessApplication]
    lookup_url_kwarg = "application_id"
    lookup_field = "id"
    http_method_names = ["patch"]

    def update(self, request, *args, **kwargs):
        application = self.get_object()

        updated_application = withdraw_application_service(
            user=request.user,
            application=application
        )

        return Response({
            "status": updated_application.status,
        })

class UserApplicationsListView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = ApplicationFilter

    def get_queryset(self):
        
        if getattr(self, "swagger_fake_view", False):
            return Application.objects.none()
    
    
        return Application.objects.filter(applicant=self.request.user)

class JobApplicationsListView(generics.ListAPIView):
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated, IsJobOwner]
    filterset_class = ApplicationFilter

    def get_queryset(self):
        
        if getattr(self, "swagger_fake_view", False):
            return Application.objects.none()
        
        job_id = self.kwargs["job_id"]
        return Application.objects.filter(job_id=job_id)