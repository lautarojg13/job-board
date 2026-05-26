from rest_framework import serializers

from .models import Application, ApplicationResponse, ApplicationStatus
from .services import apply_to_job_service

class _ApplicationBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = [
            "id",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
        
class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["cover_letter", "resume"]

    def validate(self, attrs):
        request = self.context.get("request")
        job = self.context.get("job")

        if not (request or job):
            raise serializers.ValidationError(
                {"context": "Request and job are required."}
            )

        if not request:
            raise serializers.ValidationError(
                {"request": "Request context is required."}
            )

        if not job:
            raise serializers.ValidationError(
                {"job": "Job context is required."}
            )

        return attrs

    def create(self, validated_data):
        return apply_to_job_service(
            user=self.context["request"].user,
            job=self.context["job"],
            **validated_data
        )

class ApplicationListSerializer(_ApplicationBaseSerializer):
    job_id = serializers.IntegerField(source="job.id", read_only=True)
    
    class Meta(_ApplicationBaseSerializer.Meta):
        fields = _ApplicationBaseSerializer.Meta.fields + [
            "job_id",
        ]
        
class ApplicationDetailSerializer(_ApplicationBaseSerializer):
    class Meta(_ApplicationBaseSerializer.Meta):
        fields = _ApplicationBaseSerializer.Meta.fields + [
            "applicant_id",
            "job_id",
            "cover_letter",
            "resume",
        ]
        
class ApplicationResponseSerializer(serializers.ModelSerializer):
    application_status  = serializers.CharField(source="application.status", read_only=True)
    
    class Meta:
        model = ApplicationResponse
        fields = ["application_id", "responder_id", "message", "created_at", "application_status"]

class ApplicationStatusUpdateSerializer(serializers.Serializer):
    
    ALLOWED_STATUSES = [
        ApplicationStatus.REVIEWED,
        ApplicationStatus.WITHDRAWN,
        ApplicationStatus.ACCEPTED,
        ApplicationStatus.REJECTED,
    ]
    
    application_status = serializers.ChoiceField(choices=ALLOWED_STATUSES)
    message = serializers.CharField(required=False, allow_blank=True)