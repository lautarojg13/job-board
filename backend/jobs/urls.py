from django.urls import path
from . import views

urlpatterns = [
    path("get-jobs-list/", views.JobPostListView.as_view(), name="get_jobs_list"),
    
    path("get-owner-jobs-list/", views.GetOwnerJobPostListView.as_view(), name="get_own_jobs_list"),
    
    path("post-job/", views.JobPostCreateView.as_view(), name="post_job"),
    path("edit-job-post/<int:pk>/", views.JobPostRetrieveUpdateDestroyView.as_view(), name="edit_job_post"),
    path("delete-job-post/<int:pk>/", views.JobPostRetrieveUpdateDestroyView.as_view(), name="delete_job_post"),
    path("get-job-details/<int:job_id>/", views.JobPostRetrieveView.as_view(), name="get_job_details"),

    path("get_resume_analysis/<int:job_id>/", views.ResumeAnalysisView.as_view(), name="get_resume_analysis"),
    path("get_jobs_by_agent/", views.GetJobsByAgentView.as_view(), name="get_jobs_by_agent")
]