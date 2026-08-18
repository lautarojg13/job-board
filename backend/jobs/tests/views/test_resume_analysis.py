import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch

from jobs.views import RESUME_ANALYSIS_STARTED_MESSAGE

EXPECTED_RESUME_TEXT = "Resume content here for testing"

MINIMAL_RESUME_PDF = f"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 61 >>
stream
BT
/F1 12 Tf
72 720 Td
({EXPECTED_RESUME_TEXT}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
trailer
<< /Root 1 0 R /Size 6 >>
%%EOF
""".encode()


def build_resume_file(content=MINIMAL_RESUME_PDF, name="resume.pdf"):
    return SimpleUploadedFile(name, content, content_type="application/pdf")


class TestResumeAnalysis:

    @pytest.mark.django_db
    @patch("jobs.views.analyze_resume_task")
    @patch("jobs.views.extract_text_from_pdf")
    def test_202_with_task_id_when_text_is_extracted(
        self, mock_extract_text, mock_task, user, job
    ):
        client = APIClient()
        client.force_authenticate(user=user)

        mock_extract_text.return_value = "Resume content"
        task_id = "task-abc-123"
        mock_task.delay.return_value.id = task_id

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(url, {"resume": build_resume_file()}, format="multipart")

        assert response.status_code == 202
        assert response.data["task_id"] == task_id
        assert response.data["message"] == RESUME_ANALYSIS_STARTED_MESSAGE
        mock_task.delay.assert_called_once_with(job.id, "Resume content")

    @pytest.mark.django_db
    @patch("jobs.views.analyze_resume_task")
    def test_202_end_to_end_with_real_pdf(self, mock_task, user, job):
        client = APIClient()
        client.force_authenticate(user=user)

        task_id = "task-pdf-456"
        mock_task.delay.return_value.id = task_id

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(url, {"resume": build_resume_file()}, format="multipart")

        assert response.status_code == 202
        assert response.data["task_id"] == task_id
        mock_task.delay.assert_called_once_with(job.id, EXPECTED_RESUME_TEXT)

    @pytest.mark.django_db
    @patch("jobs.views.analyze_resume_task")
    @patch("jobs.views.extract_text_from_pdf")
    def test_400_when_no_text_can_be_extracted(
        self, mock_extract_text, mock_task, user, job
    ):
        client = APIClient()
        client.force_authenticate(user=user)

        mock_extract_text.return_value = ""

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(url, {"resume": build_resume_file()}, format="multipart")

        assert response.status_code == 400
        mock_task.delay.assert_not_called()

    @pytest.mark.django_db
    @patch("jobs.views.analyze_resume_task")
    @patch("jobs.views.extract_text_from_pdf")
    def test_400_when_extraction_returns_error(
        self, mock_extract_text, mock_task, user, job
    ):
        client = APIClient()
        client.force_authenticate(user=user)

        mock_extract_text.return_value = "Error: broken pdf"

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(url, {"resume": build_resume_file()}, format="multipart")

        assert response.status_code == 400
        mock_task.delay.assert_not_called()

    @pytest.mark.django_db
    @patch("jobs.views.analyze_resume_task")
    @patch("jobs.views.extract_text_from_pdf")
    def test_400_when_file_is_not_pdf(
        self, mock_extract_text, mock_task, user, job
    ):
        client = APIClient()
        client.force_authenticate(user=user)

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(
            url,
            {"resume": build_resume_file(name="resume.docx")},
            format="multipart",
        )

        assert response.status_code == 400
        mock_extract_text.assert_not_called()
        mock_task.delay.assert_not_called()

    @pytest.mark.django_db
    def test_unauthenticated_user_cannot_analyze(self, job):
        client = APIClient()

        url = reverse("get_resume_analysis", kwargs={"job_id": job.id})
        response = client.post(url, {"resume": build_resume_file()}, format="multipart")

        assert response.status_code == 401