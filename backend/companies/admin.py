from django.contrib import admin
from .models import Company, CompanyMember

# Register your models here.

class CompanyMemberInline(admin.TabularInline):
    model = CompanyMember
    extra = 0
    fields = ['user', 'company_role']


class CompanyAdmin(admin.ModelAdmin):
    inlines = [CompanyMemberInline]
    fields = ['name', 'description', 'website', 'logo', 'created_at', 'followers']
    readonly_fields = ['created_at']


admin.site.register(Company, CompanyAdmin)
admin.site.register(CompanyMember)