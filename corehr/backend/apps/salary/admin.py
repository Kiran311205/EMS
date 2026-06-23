from django.contrib import admin
from .models import SalaryRecord

@admin.register(SalaryRecord)
class SalaryRecordAdmin(admin.ModelAdmin):
    list_display = ['employee', 'month', 'year', 'net_salary', 'status', 'paid_date']
    list_filter = ['status', 'month', 'year']
    search_fields = ['employee__full_name']
