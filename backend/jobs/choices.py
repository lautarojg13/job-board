from django.db import models

class JobPostStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    CLOSED = 'closed', 'Closed'
    PAUSED = 'paused', 'Paused'
    ARCHIVED = 'archived', 'Archived'
    
class EmploymentTypes(models.TextChoices):
    FULL_TIME = 'FT', 'Full-Time'
    PART_TIME = 'PT', 'Part-Time'
    CONTRACT = 'CT', 'Contract'
    
class WorkModeChoices(models.TextChoices):
    HYBRID = 'hybrid', 'Hybrid'
    ONSITE = 'onsite', 'Onsite'
    REMOTE = 'remote', 'Remote'