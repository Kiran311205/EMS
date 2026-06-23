from django.db import models
from apps.employees.models import Employee


class BankDetail(models.Model):
    ACCOUNT_TYPE = [
        ('savings', 'Savings'),
        ('current', 'Current'),
        ('salary', 'Salary'),
    ]

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='bank_detail')
    account_holder_name = models.CharField(max_length=150)
    account_number = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=100)
    branch_name = models.CharField(max_length=100, blank=True)
    ifsc_code = models.CharField(max_length=11)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE, default='savings')
    micr_code = models.CharField(max_length=9, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.employee.full_name} - {self.bank_name}"
