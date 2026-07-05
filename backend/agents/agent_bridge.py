import httpx
import json
from django.conf import settings

from abc import ABC, abstractmethod

class Agent(ABC):
    """
    Agent class for interacting with the Ollama API to generate responses 
    using large language models.
    
    This class handles communication with the local LLM API endpoint and 
    provides methods to call the model with specific system and user prompts.
    """
    
    def __init__(self, language="English"):
        """
        Initialize the Agent with API configuration.
        
        Args:
            language (str): The language to be used for responses, defaults to "English"
        """
        # Retrieve the Ollama API URL from Django settings, with a default fallback
        self.url = getattr(settings, "OLLAMA_API_URL", "http://localhost:11434/api/generate")
        # Retrieve the model name from Django settings, with a default fallback
        self.model = getattr(settings, "OLLAMA_MODEL_NAME", "llama3:8b-instruct-q4_K_M")
        self.language = language
    
    @abstractmethod
    async def call_model(self, system_prompt, user_prompt, format="json", temperature=0.0):
        """
        Call the language model with specified prompts and return the response.
        
        This method constructs a request to the Ollama API with the given system and 
        user prompts, and handles the response processing including error handling.
        
        Args:
            system_prompt (str): The system prompt to guide the model's behavior
            user_prompt (str): The user's input prompt for the model
            format (str): Response format, defaults to "json"
            temperature (float): Controls randomness in responses, defaults to 0.0
            
        Returns:
            dict: The model's response parsed as a JSON object, or error information
        """
        # Append language instruction to the system prompt
        system_prompt += f"\n You must respond in {self.language}"
        
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
                return json.loads(result)
        except (httpx.HTTPError, json.JSONDecodeError) as e:
            # Return error information if the API call fails
            return {"error":"AI service error.", "details": str(e)}