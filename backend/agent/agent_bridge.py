import requests
import json
from django.conf import settings

from .prompts import get_resume_analyzer_prompt, get_jobs_search_prompt

class Agent:
    def __init__(self, language="English"):
        self.url = getattr(settings, "OLLAMA_API_URL", "http://localhost:11434/api/generate")
        self.model = getattr(settings, "OLLAMA_MODEL_NAME", "llama3:8b-instruct-q4_K_M")
        self.language = language
        
    def analyze_resume_compatibility(self, resume_content, job_post_info):
        system_prompt = get_resume_analyzer_prompt(self.language)
        
        user_prompt = f"Resume Content: {resume_content}\n\nJob Description: {job_post_info}"
        
        return self.call_model(system_prompt=system_prompt, user_prompt=user_prompt)
    
    def search_job_params(self, user_prompt, errors=None):
        system_prompt = get_jobs_search_prompt(self.language)
        
        if errors:
            error_feedback = f"\n\nPrevious validation errors: {errors}. Please fix them."
            user_prompt = f"User input: {user_prompt}{error_feedback}"
            
        return self.call_model(system_prompt, user_prompt)
        
    
    def call_model(self, system_prompt, user_prompt, format="json", temperature=0.0):
        system_prompt += f"\n You must respond in {self.language}"
        data = {
            "model": self.model,
            "prompt": f"{system_prompt}\n\n{user_prompt}",
            "format": format,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        
        try:
            response = requests.post(self.url, json=data)
            response.raise_for_status()
            result = response.json().get("response", "{}")
            return json.loads(result)
        except (requests.RequestException, json.JSONDecodeError) as e:
            return {"error":"AI service error.", "details": str(e)}