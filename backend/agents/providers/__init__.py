from django.conf import settings

from agents.agent_bridge import Agent, OllamaAgent
from agents.providers.openai_compat import OpenAICompatAgent

# Registry of available providers. Multiple identifiers may share an adapter
# (e.g. openai/deepseek/gemini all use the OpenAI-compatible chat endpoint).
# New providers: implement `Agent.call_model` and register it here.
PROVIDERS = {
    "ollama": OllamaAgent,
    "openai": OpenAICompatAgent,
    "deepseek": OpenAICompatAgent,
    "gemini": OpenAICompatAgent,
}


def get_agent(language="English"):
    """
    Return the LLM provider selected by the ``AI_PROVIDER`` setting.

    Defaults to ``ollama``; unknown provider names fall back to Ollama.

    Args:
        language (str): The language to be used for responses, defaults to "English"

    Returns:
        Agent: an instantiated provider adapter
    """
    provider_name = getattr(settings, "AI_PROVIDER", "ollama").lower()
    agent_cls = PROVIDERS.get(provider_name, OllamaAgent)
    return agent_cls(language=language, provider=provider_name)