from django.contrib import admin
from .models import Asset

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['employee', 'asset_type', 'status', 'serial_number', 'issued_date']
    list_filter = ['asset_type', 'status']
    search_fields = ['employee__full_name', 'serial_number']
