from rest_framework.exceptions import ValidationError

from jobs.utils.asyncronous.querysets import build_jobs_queryset

from asgiref.sync import sync_to_async

from agents.assistants import JobAssistantAgent
from agents.serializers.output_serializers import JobParamsResponseSerializer


async def get_jobs_by_agent_service(user_prompt):
    agent = JobAssistantAgent()
    last_errors = None
    attempt = 0
    params = None
    
    while attempt < 3:
        params = await agent.search_job_params(user_prompt, errors=last_errors)
        if params.get("error"):
            last_errors = None
            attempt += 1
            continue
        serializer = JobParamsResponseSerializer(data=params)
        
        if serializer.is_valid():
            break
        
        last_errors = serializer.errors
        attempt += 1
    
    if params and params.get("error"):
        raise ValidationError("There was an error while processing the data")

    serializer = JobParamsResponseSerializer(data=params or {})
    if not serializer.is_valid():
        raise ValidationError("There was an error while processing the data")
    
    valid_data = serializer.validated_data

    queryset = await sync_to_async(list)(build_jobs_queryset(valid_data))

    return queryset