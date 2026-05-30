import pytest

from applications.serializers import ApplicationCreateSerializer, ApplicationDetailSerializer, ApplicationListSerializer, ApplicationResponseSerializer, ApplicationStatusUpdateSerializer
from applications.choices import ApplicationStatus

from applications.factories import ApplicationFactory, ApplicationResponseFactory

class TestApplicationCreateSerializer:
    
    @pytest.mark.parametrize(
        'cover_letter_content', [
            'I am very interested in this position and believe my skills are a great match.',
            'Please find my application for the job opening. I look forward to hearing from you.',
            'I have attached my resume and cover letter for your review. Thank you for considering my application.',
            '',
            None
        ]
    )
    @pytest.mark.django_db
    def test_serializer_valid_data(self, cover_letter_content, valid_pdf, application_context):
        data = {
            'cover_letter': cover_letter_content,
            'resume': valid_pdf
        }
        
        serializer = ApplicationCreateSerializer(data=data, context=application_context)
        
        assert serializer.is_valid(), serializer.errors
        
    @pytest.mark.django_db
    @pytest.mark.parametrize(
        "invalid_pdf_fixture",
        [
            "oversized_pdf",
            "invalid_extension_file",
            "fake_mime_pdf",
            "invalid_signature_pdf",
            "corrupted_integrity_pdf",
        ]
    )
    def test_invalid_application_serializer(
        self,
        request,
        application_context,
        invalid_pdf_fixture
    ):
        invalid_pdf = request.getfixturevalue(invalid_pdf_fixture)

        data = {
            "cover_letter": "This is a valid cover letter.",
            "resume": invalid_pdf,
        }

        serializer = ApplicationCreateSerializer(
            data=data,
            context=application_context
        )

        assert not serializer.is_valid()
        assert "resume" in serializer.errors
        
    @pytest.mark.django_db
    def test_serializer_missing_resume(self, application_context):
        data = {
            'cover_letter': 'I am very interested in this position and believe my skills are a great match.',
        }
        
        serializer = ApplicationCreateSerializer(data=data, context=application_context)
        
        assert not serializer.is_valid(), "Expected serializer to be invalid when resume is missing"
        assert 'resume' in serializer.errors, "Expected 'resume' field to have validation errors"
        
    @pytest.mark.django_db
    def test_missing_context(self, valid_pdf):
        data = {
            'cover_letter': 'I am very interested in this position and believe my skills are a great match.',
            'resume': valid_pdf
        }
        
        serializer = ApplicationCreateSerializer(data=data, context={})
        
        assert not serializer.is_valid(), "Expected serializer to be invalid when context is missing"
        assert 'context' in serializer.errors, "Expected 'context' field to have validation errors"
        
    @pytest.mark.parametrize(
        'missing_context_data', [
            'request',
            'job'
        ]
    )
    @pytest.mark.django_db
    def test_invalid_context(self, valid_pdf, application_context, missing_context_data):
        application_context_copy = application_context.copy()
        
        application_context_copy.pop(missing_context_data, None)
        
        data = {
            'cover_letter': 'I am very interested in this position and believe my skills are a great match.',
            'resume': valid_pdf
        }

        serializer = ApplicationCreateSerializer(data=data, context=application_context_copy)

        assert not serializer.is_valid(), f"Expected serializer to be invalid when {missing_context_data} is missing from context"
        assert missing_context_data in serializer.errors, "Expected 'context' field to have validation errors"

class TestApplicationListSerializer:
    
    @pytest.mark.django_db
    def test_application_list_serializer_fields(self):
        application = ApplicationFactory()
        
        serializer = ApplicationListSerializer(application)

        expected_fields = {
            "id",
            "status",
            "created_at",
            "updated_at",
            "job_id",
        }

        assert set(serializer.data.keys()) == expected_fields
        
    @pytest.mark.django_db
    def test_application_list_serializer_returns_job_id(self):
        application = ApplicationFactory()
        serializer = ApplicationListSerializer(application)

        assert serializer.data["job_id"] == application.job.id
        
    @pytest.mark.django_db
    def test_application_list_serializer_fields_are_read_only(self):
        serializer = ApplicationListSerializer()

        for field_name in serializer.fields:
            assert serializer.fields[field_name].read_only

class TestApplicationDetailSerializer:
    
    @pytest.mark.django_db
    def test_application_detail_serializer_fields(self):
        application = ApplicationFactory()
        serializer = ApplicationDetailSerializer(application)

        expected_fields = {
            "id",
            "status",
            "created_at",
            "updated_at",
            "applicant_id",
            "job_id",
            "cover_letter",
            "resume",
        }

        assert set(serializer.data.keys()) == expected_fields

    @pytest.mark.parametrize(
        ["model_field_name", "serializer_field_name"],[
            ("job","job_id"),
            ("applicant", "applicant_id"),
        ]
    )
    @pytest.mark.django_db
    def test_application_detail_serializer_related_ids(self, model_field_name, serializer_field_name):
        application = ApplicationFactory()
        
        serializer = ApplicationDetailSerializer(application)
        
        assert serializer.data[serializer_field_name] == getattr(application, model_field_name).id
    
    @pytest.mark.django_db
    def test_application_detail_serializer_returns_resume(self):
        application = ApplicationFactory()
        
        serializer = ApplicationDetailSerializer(application)

        assert serializer.data["resume"] is not None

class TestApplicationResponseSerializer:
    
    @pytest.mark.django_db
    def test_application_response_serializer_returns_application_status(self):
        response = ApplicationResponseFactory()

        serializer = ApplicationResponseSerializer(response)

        assert serializer.data["application_status"] == response.application.status
        assert serializer.data["application_status"] in ApplicationStatus.values

    @pytest.mark.django_db
    def test_application_response_serializer_fields(self):
        response = ApplicationResponseFactory()

        serializer = ApplicationResponseSerializer(response)

        expected_fields = {
            "application_id",
            "responder_id",
            "message",
            "created_at",
            "application_status",
        }

        assert set(serializer.data.keys()) == expected_fields
        
    @pytest.mark.django_db
    def test_application_response_serializer_status_is_read_only(self):
        serializer = ApplicationResponseSerializer()

        assert serializer.fields["application_status"].read_only
        
    @pytest.mark.parametrize(
        ["serializer_field", "model_field"],
        [
            ("application_id", "application"),
            ("responder_id", "responder"),
        ]
    )
    @pytest.mark.django_db
    def test_application_response_serializer_serializes_related_ids(self,
        serializer_field, model_field
    ):
        response = ApplicationResponseFactory()

        serializer = ApplicationResponseSerializer(response)
        
        assert serializer.data[serializer_field] == getattr(response, model_field).id

class TestApplicationStatusUpdateSerializer:
    
    @pytest.mark.parametrize(
        ['status', 'message'],
        [
            (ApplicationStatus.ACCEPTED, 'Application submitted successfully.'),
            (ApplicationStatus.ACCEPTED, 'Application approved.'),
            (ApplicationStatus.REJECTED, 'Application rejected.'),
            (ApplicationStatus.WITHDRAWN, ''),
            (ApplicationStatus.REVIEWED, ''),
            (ApplicationStatus.ACCEPTED, ''),
        ]
    )
    def test_serializer_valid_updates(self, status, message):
        data = {
            'application_status': status,
            'message': message
        }
        
        serializer = ApplicationStatusUpdateSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
        
    @pytest.mark.parametrize(
        ['status', 'message'],
        [
            (ApplicationStatus.PENDING, 'Application pending.'),
        ]
    )
    def test_serializer_invalid_updates(self, status, message):
        data = {
            'application_status': status,
            'message': message
        }

        serializer = ApplicationStatusUpdateSerializer(data=data)
        assert not serializer.is_valid(), "Expected serializer to be invalid"
        assert 'application_status' in serializer.errors, "Expected 'application_status' field to have validation errors"