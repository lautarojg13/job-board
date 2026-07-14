import pytest
from unittest.mock import patch

from applications.exceptions import ApplicationAlreadyExists, TryingToApplyToOwnJob
from applications.models import Application
from applications.services import apply_to_job_service


class TestApplyToJobService:

	@patch("applications.services.send_email_task.delay")
	@pytest.mark.django_db
	def test_apply_to_job_service_success_creates_application_and_sends_email(self, mock_send_email_delay, user_2, job, valid_pdf):
		application = apply_to_job_service(
			user=user_2,
			job=job,
			cover_letter="I am very interested in this position.",
			resume=valid_pdf,
		)

		assert Application.objects.filter(applicant=user_2, job=job).exists()
		assert application.applicant == user_2
		assert application.job == job
		mock_send_email_delay.assert_called_once_with(
			subject="Application Confirmation",
			message=f"You have successfully applied to: {job.title}",
			recipient_list=[user_2.email],
		)

	@patch("applications.services.send_email_task.delay")
	@pytest.mark.django_db
	def test_apply_to_job_service_raises_when_application_already_exists(self, mock_send_email_delay, user_2, job, valid_pdf):
		Application.objects.create(
			applicant=user_2,
			job=job,
			cover_letter="Existing application.",
			resume=valid_pdf,
		)

		with pytest.raises(ApplicationAlreadyExists, match="You already applied this job"):
			apply_to_job_service(
				user=user_2,
				job=job,
				cover_letter="I am very interested in this position.",
				resume=valid_pdf,
			)

		mock_send_email_delay.assert_not_called()

	@patch("applications.services.send_email_task.delay")
	@pytest.mark.django_db
	def test_apply_to_job_service_raises_when_user_applies_to_own_job(self, mock_send_email_delay, user, job, valid_pdf):
		with pytest.raises(TryingToApplyToOwnJob, match="You cannot apply your own job"):
			apply_to_job_service(
				user=user,
				job=job,
				cover_letter="Applying to my own job.",
				resume=valid_pdf,
			)

		mock_send_email_delay.assert_not_called()
