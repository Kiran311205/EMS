from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'endpoint', 'method', 'ip_address', 'timestamp']
    list_filter = ['action', 'method']
    readonly_fields = ['user', 'action', 'endpoint', 'method', 'ip_address', 'timestamp']
