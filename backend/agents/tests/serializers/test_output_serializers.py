import pytest

from agents.serializers.input_serializers import ResumeAnalysisSerializer, JobSearchInputSerializer
from agents.serializers.output_serializers import JobParamsResponseSerializer

from jobs.choices import EmploymentTypes, WorkModeChoices

from django.core.files.uploadedfile import SimpleUploadedFile

class TestResumeAnalysisSerializer:
    def test_valid_file(self):
        file = SimpleUploadedFile(
            "resume.pdf",
            b"dummy content",
            content_type="application/pdf",
        )

        serializer = ResumeAnalysisSerializer(
            data={"resume": file}
        )

        assert serializer.is_valid(), serializer.errors


class TestJobSearchInputSerializer:
    def test_valid_prompt(self):
        serializer = JobSearchInputSerializer(
            data={"user_prompt": "Python backend developer"}
        )

        assert serializer.is_valid(), serializer.errors

    @pytest.mark.parametrize(
        "prompt",
        ["","abc","1234"],
    )
    def test_prompt_too_short(self, prompt):
        serializer = JobSearchInputSerializer(
            data={"user_prompt": prompt}
        )

        assert not serializer.is_valid()
        assert "user_prompt" in serializer.errors

    def test_prompt_is_required(self):
        serializer = JobSearchInputSerializer(data={})

        assert not serializer.is_valid()
        assert "user_prompt" in serializer.errors


class TestJobParamsResponseSerializer:
    def test_valid_complete_data(self):
        serializer = JobParamsResponseSerializer(
            data={
                "technologies": ["Python", "Django"],
                "location": "Buenos Aires",
                "employment_type": EmploymentTypes.FULL_TIME,
                "min_salary": 2000,
                "work_mode": WorkModeChoices.REMOTE,
            }
        )

        assert serializer.is_valid(), serializer.errors

    def test_defaults(self):
        serializer = JobParamsResponseSerializer(data={})

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["technologies"] == []

    def test_negative_salary_is_invalid(self):
        serializer = JobParamsResponseSerializer(
            data={"min_salary": -1}
        )

        assert not serializer.is_valid()
        assert "min_salary" in serializer.errors

    def test_invalid_employment_type(self):
        serializer = JobParamsResponseSerializer(
            data={"employment_type": "INVALID"}
        )

        assert not serializer.is_valid()
        assert "employment_type" in serializer.errors

    def test_invalid_work_mode(self):
        serializer = JobParamsResponseSerializer(
            data={"work_mode": "INVALID"}
        )

        assert not serializer.is_valid()
        assert "work_mode" in serializer.errors

    def test_optional_fields_can_be_null(self):
        serializer = JobParamsResponseSerializer(
            data={
                "location": None,
                "employment_type": None,
                "min_salary": None,
                "work_mode": None,
            }
        )

        assert serializer.is_valid(), serializer.errors

    def test_location_can_be_blank(self):
        serializer = JobParamsResponseSerializer(
            data={"location": ""}
        )

        assert serializer.is_valid(), serializer.errors

    def test_empty_technologies_is_valid(self):
        serializer = JobParamsResponseSerializer(
            data={"technologies": []}
        )

        assert serializer.is_valid(), serializer.errors