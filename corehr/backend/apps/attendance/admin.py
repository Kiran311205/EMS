from django.contrib import admin
from .models import AttendanceRecord

@admin.register(AttendanceRecord)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'status', 'check_in', 'check_out']
    list_filter = ['status', 'date']
    search_fields = ['employee__full_name']
