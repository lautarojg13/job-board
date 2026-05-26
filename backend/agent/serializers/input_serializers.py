from rest_framework import serializers

class ResumeAnalysisSerializer(serializers.Serializer):
    resume = serializers.FileField(required=True)
        
class JobSearchInputSerializer(serializers.Serializer):
    user_prompt = serializers.CharField(min_length=5)