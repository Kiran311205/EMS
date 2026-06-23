from django.contrib import admin
from .models import LeaveRequest

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'from_date', 'to_date', 'days', 'status']
    list_filter = ['status', 'leave_type']
    search_fields = ['employee__full_name']
