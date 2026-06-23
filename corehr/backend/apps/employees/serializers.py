from rest_framework import serializers
from .models import Employee, Department, Designation


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = '__all__'

    def get_employee_count(self, obj):
        return obj.employees.filter(status='active').count()


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Designation
        fields = '__all__'


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)

    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'phone',
                  'department_name', 'designation_title', 'status',
                  'employment_type', 'date_joined', 'photo']


class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_title = serializers.CharField(source='designation.title', read_only=True)
    reporting_to_name = serializers.CharField(source='reporting_to.full_name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'

    def validate_employee_id(self, value):
        qs = Employee.objects.filter(employee_id=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Employee ID already exists.")
        return value
