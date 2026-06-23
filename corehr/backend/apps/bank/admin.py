from django.contrib import admin
from .models import BankDetail

@admin.register(BankDetail)
class BankDetailAdmin(admin.ModelAdmin):
    list_display = ['employee', 'bank_name', 'account_type', 'ifsc_code']
    search_fields = ['employee__full_name', 'bank_name', 'account_number']
