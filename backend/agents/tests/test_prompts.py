from agents.prompts import (
    format_prompt,
    get_jobs_search_prompt,
    get_resume_analyzer_prompt,
)
from jobs.choices import EmploymentTypes, WorkModeChoices


class TestFormatPrompt:
    def test_replaces_placeholders(self):
        result = format_prompt(
            "Hello {language}",
            language="Spanish",
        )

        assert result == "Hello Spanish"


class TestResumeAnalyzerPrompt:
    def test_contains_language(self):
        prompt = get_resume_analyzer_prompt("Spanish")

        assert "Spanish" in prompt
        assert "Senior Technical Recruiter" in prompt


class TestJobSearchPrompt:
    def test_contains_language(self):
        prompt = get_jobs_search_prompt("Spanish")

        assert "respond in Spanish" in prompt

    def test_contains_all_employment_values(self):
        prompt = get_jobs_search_prompt("English")

        for value, _ in EmploymentTypes.choices:
            assert f'"value": "{value}"' in prompt

    def test_contains_all_work_mode_values(self):
        prompt = get_jobs_search_prompt("English")

        for value, _ in WorkModeChoices.choices:
            assert f'"value": "{value}"' in prompt
        
    def test_has_no_unformatted_placeholders(self):
        prompt = get_jobs_search_prompt("English")

        assert "{language}" not in prompt
        assert "{employment_choices}" not in prompt
        assert "{work_mode_choices}" not in prompt