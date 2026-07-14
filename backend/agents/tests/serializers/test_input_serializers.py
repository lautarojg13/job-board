

import pytest

from agents.serializers.input_serializers import ResumeAnalysisSerializer, JobSearchInputSerializer

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

