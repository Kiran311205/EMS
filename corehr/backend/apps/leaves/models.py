from django.db import models
from apps.employees.models import Employee


class LeaveRequest(models.Model):
    LEAVE_TYPE = [
        ('sick', 'Sick Leave'),
        ('casual', 'Casual Leave'),
        ('earned', 'Earned Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE)
    from_date = models.DateField()
    to_date = models.DateField()
    days = models.PositiveIntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.CharField(max_length=100, blank=True)
    review_note = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_leave_type_display()} ({self.status})"
