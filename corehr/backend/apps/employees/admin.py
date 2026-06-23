from django.contrib import admin
from django.utils.html import format_html
from .models import Employee, Department, Designation


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ['title', 'department']
    list_filter = ['department']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['photo_thumbnail', 'employee_id', 'full_name', 'department', 'designation', 'status', 'date_joined']
    list_filter = ['status', 'department', 'employment_type']
    search_fields = ['full_name', 'email', 'employee_id']
    readonly_fields = ['photo_preview']

    fieldsets = [
        ('Profile Photo', {
            'fields': ('photo_preview', 'photo'),
        }),
        ('Personal Information', {
            'fields': (
                'employee_id', 'full_name', 'email', 'phone', 'alternate_phone',
                'gender', 'date_of_birth', 'blood_group',
            ),
        }),
        ('Employment', {
            'fields': (
                'department', 'designation', 'employment_type', 'status',
                'date_joined', 'date_resigned', 'reporting_to', 'basic_salary',
            ),
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'pincode'),
            'classes': ('collapse',),
        }),
        ('Documents', {
            'fields': ('aadhar_number', 'pan_number', 'pf_number', 'uan_number', 'esi_number'),
            'classes': ('collapse',),
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relation'),
            'classes': ('collapse',),
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',),
        }),
    ]

    def photo_thumbnail(self, obj):
        """Small circular thumbnail shown in the list view."""
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;border:1px solid #ddd;" />',
                obj.photo.url,
            )
        return format_html(
            '<div style="width:40px;height:40px;border-radius:50%;background:#e0e7ff;display:flex;'
            'align-items:center;justify-content:center;font-weight:bold;color:#4f46e5;font-size:16px;">{}</div>',
            obj.full_name[0].upper() if obj.full_name else '?',
        )
    photo_thumbnail.short_description = 'Photo'

    def photo_preview(self, obj):
        """Larger preview shown at the top of the employee edit form."""
        if obj.photo:
            return format_html(
                '<img src="{}" style="width:120px;height:120px;border-radius:12px;object-fit:cover;'
                'border:2px solid #e5e7eb;margin-bottom:8px;" />'
                '<p style="color:#6b7280;font-size:12px;margin:0;">Current photo — upload a new file below to replace it.</p>',
                obj.photo.url,
            )
        return format_html('<p style="color:#9ca3af;font-size:13px;">No photo uploaded yet.</p>')
    photo_preview.short_description = 'Current Photo'
