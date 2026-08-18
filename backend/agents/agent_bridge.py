import json
from abc import ABC, abstractmethod

import httpx
from django.conf import settings

class Agent(ABC):
    """
    Base class for LLM providers.

    Subclasses implement the provider-specific transport and response
    parsing in ``call_model``. The rest of the app only relies on this
    contract, so swapping providers is a matter of configuration.
    """

    def __init__(self, language="English", provider=None):
        """
        Args:
            language (str): The language to be used for responses, defaults to "English"
            provider (str): Provider identifier, e.g. "ollama", "openai"
        """
        self.language = language
        self.provider = provider

    @abstractmethod
    async def call_model(self, system_prompt, user_prompt, temperature=0.0):
        """
        Send system + user prompts to the model and return the parsed JSON
        payload (dict), or an error dict in the shape
        ``{"error": "...", "details": "..."}`` on failure.
        """
        raise NotImplementedError

    def _build_system_prompt(self, system_prompt):
        """Append the response-language instruction to the system prompt."""
        return f"{system_prompt}\n You must respond in {self.language}"

    def _safe_json(self, text):
        """Parse a JSON string into a dict, returning an error dict on failure."""
        try:
            return json.loads(text)
        except (json.JSONDecodeError, TypeError) as e:
            return self._error(e)

    def _error(self, details):
        return {"error": "AI service error.", "details": str(details)}


class OllamaAgent(Agent):
    """
    Local Ollama provider (``POST /api/generate``).

    Configured via ``OLLAMA_API_URL`` and ``OLLAMA_MODEL_NAME``.
    """

    def __init__(self, language="English", provider="ollama"):
        """
        Initialize the Agent with API configuration.

        Args:
            language (str): The language to be used for responses, defaults to "English"
            provider (str): Provider identifier, defaults to "ollama"
        """
        super().__init__(language=language, provider=provider)
        # Retrieve the Ollama API URL from Django settings, with a default fallback
        self.url = getattr(settings, "OLLAMA_API_URL", "http://localhost:11434/api/generate")
        # Retrieve the model name from Django settings, with a default fallback
        self.model = getattr(settings, "OLLAMA_MODEL_NAME", "llama3:8b-instruct-q4_K_M")

    async def call_model(self, system_prompt, user_prompt, format="json", temperature=0.0):
        """
        Call the Ollama API with the given prompts and return the response.

        Args:
            system_prompt (str): The system prompt to guide the model's behavior
            user_prompt (str): The user's input prompt for the model
            format (str): Response format, defaults to "json"
            temperature (float): Controls randomness in responses, defaults to 0.0

        Returns:
            dict: The model's response parsed as a JSON object, or error information
        """
        system_prompt = self._build_system_prompt(system_prompt)

        # Prepare the request data for the API call
        data = {
            "model": self.model,
            "prompt": f"{system_prompt}\n\n{user_prompt}",
            "format": format,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }

        # Configure connection limits for the HTTP client
        limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)

        try:
            # Create an asynchronous HTTP client with timeout and connection limits
            async with httpx.AsyncClient(timeout=60.0, limits=limits) as client:
                # Make the POST request to the Ollama API
                response = await client.post(self.url, json=data)
                response.raise_for_status()  # Raise an exception for bad status codes

                # Extract and parse the response
                result = response.json().get("response", "{}")
                return self._safe_json(result)
        except httpx.HTTPError as e:
            # Return error information if the API call fails
            return self._error(e)