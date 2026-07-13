import pytest
from unittest.mock import patch

from core.emails import send_email_task


class TestSendEmailTask:

    @patch("core.emails.send_mail")
    def test_send_email_task_calls_send_mail_with_default_from_email(self, mock_send_mail):
        send_email_task(
            subject="Application Confirmation",
            message="You have successfully applied to: Software Engineer",
            recipient_list=["candidate@example.com"],
        )

        mock_send_mail.assert_called_once_with(
            subject="Application Confirmation",
            message="You have successfully applied to: Software Engineer",
            from_email="noreply@jobboard.com",
            recipient_list=["candidate@example.com"],
        )

    @patch("core.emails.send_mail")
    def test_send_email_task_propagates_infrastructure_error(self, mock_send_mail):
        mock_send_mail.side_effect = RuntimeError("smtp failure")

        with pytest.raises(RuntimeError, match="smtp failure"):
            send_email_task(
                subject="Application Confirmation",
                message="You have successfully applied to: Software Engineer",
                recipient_list=["candidate@example.com"],
            )