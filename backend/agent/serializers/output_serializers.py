from rest_framework import serializers

class JobParamsResponseSerializer(serializers.Serializer):
    keywords = serializers.CharField(read_only=True)
    location = serializers.CharField(read_only=True)
    remote =  serializers.BooleanField()
    min_salary = serializers.IntegerField(min_value=0)
    job_type = serializers.CharField(read_only=True)