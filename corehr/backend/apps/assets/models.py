from django.db import models
from apps.employees.models import Employee


class Asset(models.Model):
    ASSET_TYPE = [
        ('laptop', 'Laptop'),
        ('desktop', 'Desktop'),
        ('id_card', 'ID Card'),
        ('key_card', 'Key Card'),
        ('sim_card', 'SIM Card'),
        ('kit', 'Joining Kit'),
        ('mouse', 'Mouse'),
        ('keyboard', 'Keyboard'),
        ('headset', 'Headset'),
        ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('received', 'Received'),
        ('not_received', 'Not Received'),
        ('pending', 'Pending'),
        ('returned', 'Returned'),
        ('damaged', 'Damaged'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assets')
    asset_type = models.CharField(max_length=20, choices=ASSET_TYPE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_received')
    serial_number = models.CharField(max_length=100, blank=True)
    model_name = models.CharField(max_length=100, blank=True)
    issued_date = models.DateField(null=True, blank=True)
    returned_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['asset_type']

    def __str__(self):
        return f"{self.employee.full_name} - {self.get_asset_type_display()} ({self.get_status_display()})"
