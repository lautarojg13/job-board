import pytest
from django.http import Http404

from jobs.utils.info import get_job_post_info


@pytest.mark.django_db
class TestGetJobPostInfo:

    def test_returns_job_post_description(self, user, company, job):
        result = get_job_post_info(job.id)

        assert result == job.description

    def test_raises_404_when_job_does_not_exist(self):
        with pytest.raises(Http404):
            get_job_post_info(999999)