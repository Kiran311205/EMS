from rest_framework import serializers
from .models import AttendanceRecord


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
