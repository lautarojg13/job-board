import json
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from agents.providers import PROVIDERS
from agents.providers.openai_compat import OpenAICompatAgent


class TestOpenAICompatAgentInitialization:
    def test_uses_provider_defaults(self):
        agent = OpenAICompatAgent(provider="deepseek")

        assert agent.provider == "deepseek"
        assert agent.base_url == "https://api.deepseek.com/v1"
        assert agent.model == "deepseek-chat"
        assert agent.language == "English"

    def test_unknown_provider_falls_back_to_openai_defaults(self):
        agent = OpenAICompatAgent(provider="unknown")

        assert agent.base_url == "https://api.openai.com/v1"
        assert agent.model == "gpt-4o-mini"

    def test_settings_override_defaults(self, settings):
        settings.AI_BASE_URL = "https://custom.example/v1"
        settings.AI_MODEL = "custom-model"
        settings.AI_API_KEY = "secret-key"

        agent = OpenAICompatAgent(provider="openai")

        assert agent.base_url == "https://custom.example/v1"
        assert agent.model == "custom-model"
        assert agent.api_key == "secret-key"


class TestCallModel:
    @pytest.mark.asyncio
    async def test_successful_response(self):
        agent = OpenAICompatAgent(provider="openai")

        fake_response = MagicMock()
        fake_response.json.return_value = {
            "choices": [{"message": {"content": json.dumps({"result": "ok"})}}]
        }
        fake_response.raise_for_status.return_value = None

        with patch("agents.providers.openai_compat.httpx.AsyncClient") as client:
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
        agent = OpenAICompatAgent(provider="openai")

        with patch("agents.providers.openai_compat.httpx.AsyncClient") as client:
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
        agent = OpenAICompatAgent(provider="openai")

        fake_response = MagicMock()
        fake_response.raise_for_status.return_value = None
        fake_response.json.return_value = {
            "choices": [{"message": {"content": "not json"}}]
        }

        with patch("agents.providers.openai_compat.httpx.AsyncClient") as client:
            client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=fake_response
            )

            result = await agent.call_model(
                system_prompt="system",
                user_prompt="user",
            )

        assert result["error"] == "AI service error."

    @pytest.mark.asyncio
    async def test_missing_choices_returns_error_dict(self):
        agent = OpenAICompatAgent(provider="openai")

        fake_response = MagicMock()
        fake_response.raise_for_status.return_value = None
        fake_response.json.return_value = {"unexpected": "shape"}

        with patch("agents.providers.openai_compat.httpx.AsyncClient") as client:
            client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=fake_response
            )

            result = await agent.call_model(
                system_prompt="system",
                user_prompt="user",
            )

        assert result["error"] == "AI service error."


class TestProvidersRegistry:
    def test_registry_keys(self):
        assert set(PROVIDERS.keys()) == {"ollama", "openai", "deepseek", "gemini"}

    def test_cloud_providers_share_openai_compat_adapter(self):
        assert (
            PROVIDERS["openai"] is OpenAICompatAgent
            and PROVIDERS["deepseek"] is OpenAICompatAgent
            and PROVIDERS["gemini"] is OpenAICompatAgent
        )