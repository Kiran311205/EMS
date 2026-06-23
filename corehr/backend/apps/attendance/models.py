from django.db import models
from apps.employees.models import Employee


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('half_day', 'Half Day'),
        ('work_from_home', 'Work From Home'),
        ('holiday', 'Holiday'),
        ('weekend', 'Weekend'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    remarks = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['employee', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"
