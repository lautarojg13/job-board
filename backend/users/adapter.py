from allauth.account.adapter import DefaultAccountAdapter

from django.template.loader import render_to_string

from core.emails import send_email_task

from users.choices import UserRoleChoices

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        
        subject = render_to_string(f"{template_prefix}_subject.txt", context)

        subject = "".join(subject.splitlines())
        
        message = render_to_string(f"{template_prefix}_message.txt", context)
        
        send_email_task.delay(
            subject=subject,
            message=message,
            recipient_list=[email]
        )
        
    def save_user(self, request, user, form, commit = True):
        user = super().save_user(request, user, form, commit)
        
        user.role = UserRoleChoices.USER
        
        if commit:
            user.save()
        
        return user