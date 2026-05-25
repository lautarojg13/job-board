from rest_framework import serializers

class JobParamsResponseSerializer(serializers.Serializer):
    keywords = serializers.CharField(read_only=True, allow_null=True)
    location = serializers.CharField(read_only=True, allow_null=True)
    employment_type =  serializers.BooleanField(allow_null=True)
    min_salary = serializers.IntegerField(min_value=0, allow_null=True)