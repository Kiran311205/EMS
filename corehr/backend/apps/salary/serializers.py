from rest_framework import serializers
from .models import SalaryRecord


class SalaryRecordSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department.name', read_only=True)
    month_display = serializers.CharField(source='get_month_display', read_only=True)

    class Meta:
        model = SalaryRecord
        fields = '__all__'
