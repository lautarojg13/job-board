from rest_framework import serializers

from jobs.choices import EmploymentTypes, WorkModeChoices

class JobParamsResponseSerializer(serializers.Serializer):
    technologies = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True,default=[])
    location = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    employment_type = serializers.ChoiceField(choices=EmploymentTypes.choices, required=False, allow_null=True)
    min_salary = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    work_mode = serializers.ChoiceField(choices=WorkModeChoices.choices, required=False, allow_null=True)