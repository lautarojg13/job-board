import json

import httpx
import pytest

from agents.agent_bridge import Agent


class TestAgent:
    @pytest.fixture
    def agent(self):
        return Agent()

    @pytest.mark.asyncio
    async def test_call_model_returns_json_response(self, monkeypatch, agent):
        expected = {"score": 95}

        class MockResponse:
            def raise_for_status(self):
                pass

            def json(self):
                return {
                    "response": json.dumps(expected)
                }

        class MockClient:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def post(self, url, json):
                return MockResponse()

        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: MockClient())

        result = await agent.call_model(
            system_prompt="system",
            user_prompt="user"
        )

        assert result == expected

    @pytest.mark.asyncio
    async def test_call_model_adds_language_to_system_prompt(self, monkeypatch):
        agent = Agent(language="Spanish")

        captured_payload = {}

        class MockResponse:
            def raise_for_status(self):
                pass

            def json(self):
                return {
                    "response": "{}"
                }

        class MockClient:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def post(self, url, json):
                captured_payload.update(json)
                return MockResponse()

        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: MockClient())

        await agent.call_model(
            system_prompt="System prompt",
            user_prompt="User prompt"
        )

        assert "You must respond in Spanish" in captured_payload["prompt"]

    @pytest.mark.asyncio
    async def test_call_model_returns_error_when_http_fails(self, monkeypatch, agent):
        class MockClient:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def post(self, *args, **kwargs):
                raise httpx.HTTPError("Connection error")

        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: MockClient())

        result = await agent.call_model(
            system_prompt="system",
            user_prompt="user"
        )

        assert result["error"] == "AI service error."
        assert "Connection error" in result["details"]

    @pytest.mark.asyncio
    async def test_call_model_returns_error_when_json_is_invalid(self, monkeypatch, agent):
        class MockResponse:
            def raise_for_status(self):
                pass

            def json(self):
                return {
                    "response": "not json"
                }

        class MockClient:
            async def __aenter__(self):
                return self

            async def __aexit__(self, *args):
                pass

            async def post(self, *args, **kwargs):
                return MockResponse()

        monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: MockClient())

        result = await agent.call_model(
            system_prompt="system",
            user_prompt="user"
        )

        assert result["error"] == "AI service error."