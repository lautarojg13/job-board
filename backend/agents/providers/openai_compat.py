import httpx
from django.conf import settings

from agents.agent_bridge import Agent

# Per-provider defaults. AI_BASE_URL / AI_MODEL from settings override these.
PROVIDER_DEFAULTS = {
    "openai": {
        "base_url": "https://api.openai.com/v1",
        "model": "gpt-4o-mini",
    },
    "deepseek": {
        "base_url": "https://api.deepseek.com/v1",
        "model": "deepseek-chat",
    },
    "gemini": {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai",
        "model": "gemini-2.0-flash",
    },
}


class OpenAICompatAgent(Agent):
    """
    Generic OpenAI-compatible chat-completions provider.

    Works with OpenAI, DeepSeek, Gemini (OpenAI-compat endpoint) and any
    other service exposing ``/chat/completions``. This class doubles as the
    reference template for implementing new providers.
    """

    def __init__(self, language="English", provider="openai"):
        """
        Initialize the Agent with API configuration.

        Args:
            language (str): The language to be used for responses, defaults to "English"
            provider (str): Provider identifier ("openai", "deepseek", "gemini", ...)
        """
        super().__init__(language=language, provider=provider)

        defaults = PROVIDER_DEFAULTS.get(provider, PROVIDER_DEFAULTS["openai"])

        self.base_url = getattr(settings, "AI_BASE_URL", "").strip() or defaults["base_url"]
        self.model = getattr(settings, "AI_MODEL", "").strip() or defaults["model"]
        self.api_key = getattr(settings, "AI_API_KEY", "").strip()

    async def call_model(self, system_prompt, user_prompt, temperature=0.0):
        """
        Call the chat-completions API with the given prompts and return the response.

        Args:
            system_prompt (str): The system prompt to guide the model's behavior
            user_prompt (str): The user's input prompt for the model
            temperature (float): Controls randomness in responses, defaults to 0.0

        Returns:
            dict: The model's response parsed as a JSON object, or error information
        """
        system_prompt = self._build_system_prompt(system_prompt)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "response_format": {"type": "json_object"},
        }

        # Configure connection limits for the HTTP client
        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)

        try:
            # Create an asynchronous HTTP client with timeout and connection limits
            async with httpx.AsyncClient(timeout=60.0, limits=limits) as client:
                # Make the POST request to the chat-completions API
                response = await client.post(
                    f"{self.base_url.rstrip('/')}/chat/completions",
                    headers=headers,
                    json=data,
                )
                response.raise_for_status()  # Raise an exception for bad status codes

                # Extract and parse the response
                content = response.json()["choices"][0]["message"]["content"]
                return self._safe_json(content)
        except (httpx.HTTPError, KeyError, IndexError) as e:
            # Return error information if the API call fails
            return self._error(e)