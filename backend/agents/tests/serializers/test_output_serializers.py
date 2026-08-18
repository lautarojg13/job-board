from agents.serializers.output_serializers import (
    JobParamsResponseSerializer,
    ResumeAnalysisResultSerializer,
)

from jobs.choices import EmploymentTypes, WorkModeChoices



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


class TestResumeAnalysisResultSerializer:
    def test_valid_complete_data(self):
        serializer = ResumeAnalysisResultSerializer(
            data={
                "match_percentage": 80,
                "matching_skills": ["Python", "Django"],
                "missing_skills": ["AWS"],
                "summary": "Good match for the role",
            }
        )

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["match_percentage"] == 80

    def test_defaults_when_fields_missing(self):
        serializer = ResumeAnalysisResultSerializer(data={})

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["match_percentage"] == 0
        assert serializer.validated_data["matching_skills"] == []
        assert serializer.validated_data["missing_skills"] == []
        assert serializer.validated_data["summary"] == ""

    def test_nullable_match_percentage_defaults_to_zero(self):
        serializer = ResumeAnalysisResultSerializer(
            data={"match_percentage": None}
        )

        assert serializer.is_valid(), serializer.errors
        assert serializer.validated_data["match_percentage"] == 0

    def test_match_percentage_above_100_is_invalid(self):
        serializer = ResumeAnalysisResultSerializer(
            data={"match_percentage": 101}
        )

        assert not serializer.is_valid()
        assert "match_percentage" in serializer.errors

    def test_match_percentage_negative_is_invalid(self):
        serializer = ResumeAnalysisResultSerializer(
            data={"match_percentage": -5}
        )

        assert not serializer.is_valid()
        assert "match_percentage" in serializer.errors

    def test_blank_summary_is_valid(self):
        serializer = ResumeAnalysisResultSerializer(
            data={"summary": ""}
        )

        assert serializer.is_valid(), serializer.errors