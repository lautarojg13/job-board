import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from agent.assistants import JobAssistantAgent
from agent.prompts import get_resume_analyzer_prompt, get_jobs_search_prompt

from agent.serializers.input_serializers import JobSearchInputSerializer, ResumeAnalysisSerializer
from agent.serializers.output_serializers import JobParamsResponseSerializer

class TestJobAssistantAgent:
    @pytest.fixture
    def agent(self):
        return JobAssistantAgent(language="English")

    @pytest.mark.asyncio
    async def test_analyze_resume_compatibility_success(self, agent):
        # Mock the call_model method
        mock_response = {
            "match_percentage": 85,
            "matching_skills": ["Python", "Django"],
            "missing_skills": ["React", "AWS"],
            "summary": "Good match with some missing skills"
        }
        
        agent.call_model = AsyncMock(return_value=mock_response)
        
        result = await agent.analyze_resume_compatibility(
            resume_content="Experience with Python and Django",
            job_post_info="Looking for Python developer with Django experience"
        )
        
        assert result == mock_response
        agent.call_model.assert_called_once()

    @pytest.mark.asyncio
    async def test_analyze_resume_compatibility_error_handling(self, agent):
        # Mock the call_model method to raise an exception
        agent.call_model = AsyncMock(side_effect=Exception("Network error"))
        
        result = await agent.analyze_resume_compatibility(
            resume_content="Experience with Python",
            job_post_info="Looking for Python developer"
        )
        
        assert "error" in result
        assert "AI service error" in result["error"]

    @pytest.mark.asyncio
    async def test_search_job_params_success(self, agent):
        # Mock the call_model method
        mock_response = {
            "technologies": ["Python", "Django"],
            "location": "London",
            "min_salary": 50000,
            "employment_type": "FULL_TIME",
            "work_mode": "REMOTE"
        }
        
        agent.call_model = AsyncMock(return_value=mock_response)
        
        result = await agent.search_job_params(
            user_prompt="Python Django developer in London with 50k salary"
        )
        
        assert result == mock_response
        agent.call_model.assert_called_once()

    @pytest.mark.asyncio
    async def test_search_job_params_with_errors(self, agent):
        # Mock the call_model method
        mock_response = {
            "technologies": ["JavaScript"],
            "location": None,
            "min_salary": 0,
            "employment_type": None,
            "work_mode": None
        }
        
        agent.call_model = AsyncMock(return_value=mock_response)
        
        result = await agent.search_job_params(
            user_prompt="JavaScript jobs",
            errors=["Invalid location format"]
        )
        
        assert result == mock_response
        agent.call_model.assert_called_once()


class TestPrompts:
    def test_get_resume_analyzer_prompt(self):
        prompt = get_resume_analyzer_prompt("English")
        assert "Senior Technical Recruiter" in prompt
        assert "English" in prompt

    def test_get_jobs_search_prompt(self):
        prompt = get_jobs_search_prompt("Spanish")
        assert "Senior Backend Specialist" in prompt
        assert "Spanish" in prompt
        # Check that employment choices are included
        assert "employment_choices" in prompt
        # Check that work mode choices are included
        assert "work_mode" in prompt


class TestAgentBridge:
    @pytest.fixture
    def agent_bridge(self):
        return JobAssistantAgent(language="English")

    @pytest.mark.asyncio
    async def test_call_model_success(self, agent_bridge):
        # Mock httpx client
        mock_response = MagicMock()
        mock_response.json.return_value = {"response": '{"test": "value"}'}
        mock_response.raise_for_status.return_value = None
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client_instance = MagicMock()
            mock_client_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            result = await agent_bridge.call_model(
                system_prompt="System prompt",
                user_prompt="User prompt"
            )
            
            assert result == {"test": "value"}
            mock_client_instance.post.assert_called_once()

    @pytest.mark.asyncio
    async def test_call_model_http_error(self, agent_bridge):
        with patch('httpx.AsyncClient') as mock_client:
            mock_client_instance = MagicMock()
            mock_client_instance.post.side_effect = Exception("HTTP Error")
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            result = await agent_bridge.call_model(
                system_prompt="System prompt",
                user_prompt="User prompt"
            )
            
            assert "error" in result
            assert "AI service error" in result["error"]

    @pytest.mark.asyncio
    async def test_call_model_json_decode_error(self, agent_bridge):
        mock_response = MagicMock()
        mock_response.json.return_value = {"response": "invalid json"}
        mock_response.raise_for_status.return_value = None
        
        with patch('httpx.AsyncClient') as mock_client:
            mock_client_instance = MagicMock()
            mock_client_instance.post.return_value = mock_response
            mock_client.return_value.__aenter__.return_value = mock_client_instance
            
            result = await agent_bridge.call_model(
                system_prompt="System prompt",
                user_prompt="User prompt"
            )
            
            assert "error" in result
            assert "AI service error" in result["error"]


class TestInputSerializers:
    def test_resume_analysis_serializer_valid(self):
        
        serializer = ResumeAnalysisSerializer(data={"resume": "test_file.pdf"})
        assert serializer.is_valid() is True

    def test_resume_analysis_serializer_invalid(self):
        
        serializer = ResumeAnalysisSerializer(data={})
        assert serializer.is_valid() is False
        assert "resume" in serializer.errors

    def test_job_search_input_serializer_valid(self):
        
        serializer = JobSearchInputSerializer(data={"user_prompt": "Python jobs in London"})
        assert serializer.is_valid() is True

    def test_job_search_input_serializer_invalid(self):
        
        serializer = JobSearchInputSerializer(data={"user_prompt": "Hi"})
        assert serializer.is_valid() is False
        assert "user_prompt" in serializer.errors


class TestOutputSerializers:
    def test_job_params_response_serializer_valid(self):
        
        data = {
            "technologies": ["Python", "Django"],
            "location": "London",
            "employment_type": "FULL_TIME",
            "min_salary": 50000,
            "work_mode": "REMOTE"
        }
        
        serializer = JobParamsResponseSerializer(data=data)
        assert serializer.is_valid() is True

    def test_job_params_response_serializer_partial(self):
        
        data = {
            "technologies": [],
            "location": None,
            "employment_type": None,
            "min_salary": 0,
            "work_mode": None
        }
        
        serializer = JobParamsResponseSerializer(data=data)
        assert serializer.is_valid() is True

    def test_job_params_response_serializer_invalid_employment_type(self):
        
        data = {
            "technologies": [],
            "location": None,
            "employment_type": "INVALID_TYPE",
            "min_salary": 0,
            "work_mode": None
        }
        
        serializer = JobParamsResponseSerializer(data=data)
        assert serializer.is_valid() is False
        assert "employment_type" in serializer.errors

    def test_job_params_response_serializer_invalid_work_mode(self):
        
        data = {
            "technologies": [],
            "location": None,
            "employment_type": None,
            "min_salary": 0,
            "work_mode": "INVALID_MODE"
        }
        
        serializer = JobParamsResponseSerializer(data=data)
        assert serializer.is_valid() is False
        assert "work_mode" in serializer.errors

    def test_job_params_response_serializer_invalid_salary(self):
        
        data = {
            "technologies": [],
            "location": None,
            "employment_type": None,
            "min_salary": -1,
            "work_mode": None
        }
        
        serializer = JobParamsResponseSerializer(data=data)
        assert serializer.is_valid() is False
        assert "min_salary" in serializer.errors