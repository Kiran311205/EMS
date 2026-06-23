from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Designation(models.Model):
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='designations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.department}"


class Employee(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('resigned', 'Resigned'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated'),
        ('probation', 'Probation'),
    ]
    EMPLOYMENT_TYPE = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    BLOOD_GROUP = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]

    # Identity
    employee_id = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    alternate_phone = models.CharField(max_length=15, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP, blank=True)
    photo = models.ImageField(upload_to='employees/', blank=True, null=True)

    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=50, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    # Employment
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name='employees')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE, default='full_time')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    date_joined = models.DateField()
    date_resigned = models.DateField(null=True, blank=True)
    reporting_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reportees')

    # Emergency
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    emergency_contact_relation = models.CharField(max_length=50, blank=True)

    # Documents
    aadhar_number = models.CharField(max_length=12, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    pf_number = models.CharField(max_length=30, blank=True)
    uan_number = models.CharField(max_length=20, blank=True)
    esi_number = models.CharField(max_length=20, blank=True)

    # Salary info (base)
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"
