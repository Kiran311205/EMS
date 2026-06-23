from django.db import models
from apps.employees.models import Employee


class SalaryRecord(models.Model):
    STATUS_CHOICES = [
        ('paid', 'Paid'),
        ('unpaid', 'Unpaid'),
        ('on_hold', 'On Hold'),
        ('partial', 'Partial'),
    ]
    MONTH_CHOICES = [
        (1,'January'),(2,'February'),(3,'March'),(4,'April'),
        (5,'May'),(6,'June'),(7,'July'),(8,'August'),
        (9,'September'),(10,'October'),(11,'November'),(12,'December'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salary_records')
    month = models.PositiveSmallIntegerField(choices=MONTH_CHOICES)
    year = models.PositiveIntegerField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pf_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='unpaid')
    paid_date = models.DateField(null=True, blank=True)
    payment_mode = models.CharField(max_length=50, blank=True)
    transaction_id = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_month_display()} {self.year} ({self.status})"
