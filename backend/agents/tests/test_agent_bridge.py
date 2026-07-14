import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from agents.agent_bridge import Agent


class DummyAgent(Agent):
    pass


class TestAgentInitialization:
    def test_uses_default_settings(self, settings):
        settings.OLLAMA_API_URL = "http://localhost:11434/api/generate"
        settings.OLLAMA_MODEL_NAME = "llama3"

        agent = DummyAgent()

        assert agent.url == "http://localhost:11434/api/generate"
        assert agent.model == "llama3"
        assert agent.language == "English"

    def test_custom_language(self):
        agent = DummyAgent(language="Spanish")

        assert agent.language == "Spanish"


class TestCallModel:
    @pytest.mark.asyncio
    async def test_successful_response(self):
        agent = DummyAgent()

        fake_response = MagicMock()
        fake_response.json.return_value = {
            "response": json.dumps({"result": "ok"})
        }
        fake_response.raise_for_status.return_value = None

        with patch("agents.agent_bridge.httpx.AsyncClient") as client:
            client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=fake_response
            )

            result = await agent.call_model(
                system_prompt="system",
                user_prompt="user",
            )

        assert result == {"result": "ok"}

    @pytest.mark.asyncio
    async def test_http_error_returns_error_dict(self):
        agent = DummyAgent()

        with patch("agents.agent_bridge.httpx.AsyncClient") as client:
            client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.HTTPError("Connection failed")
            )

            result = await agent.call_model(
                system_prompt="system",
                user_prompt="user",
            )

        assert result["error"] == "AI service error."
        assert "Connection failed" in result["details"]

    @pytest.mark.asyncio
    async def test_invalid_json_returns_error_dict(self):
        agent = DummyAgent()

        fake_response = MagicMock()
        fake_response.raise_for_status.return_value = None
        fake_response.json.return_value = {
            "response": "invalid json"
        }

        with patch("agents.agent_bridge.httpx.AsyncClient") as client:
            client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=fake_response
            )

            result = await agent.call_model(
                system_prompt="system",
                user_prompt="user",
            )

        assert result["error"] == "AI service error."