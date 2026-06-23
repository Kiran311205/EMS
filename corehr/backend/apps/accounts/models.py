from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hr', 'HR Manager'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='hr')
    phone = models.CharField(max_length=15, blank=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    @property
    def is_admin(self):
        return self.role == 'admin'

    @property
    def is_hr(self):
        return self.role == 'hr'
