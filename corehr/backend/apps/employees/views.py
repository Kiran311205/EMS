from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Employee, Department, Designation
from .serializers import (EmployeeSerializer, EmployeeListSerializer,
                          DepartmentSerializer, DesignationSerializer)
from apps.accounts.permissions import IsHR, IsAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all().order_by('name')
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.select_related('department').order_by('title')
    serializer_class = DesignationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['department']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department', 'designation').order_by('-created_at')
    permission_classes = [IsAuthenticated, IsHR]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'employment_type', 'gender']
    search_fields = ['full_name', 'email', 'employee_id', 'phone']
    ordering_fields = ['full_name', 'date_joined', 'created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return EmployeeListSerializer
        return EmployeeSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Employee.objects
        return Response({
            'total': qs.count(),
            'active': qs.filter(status='active').count(),
            'resigned': qs.filter(status='resigned').count(),
            'on_leave': qs.filter(status='on_leave').count(),
            'probation': qs.filter(status='probation').count(),
            'terminated': qs.filter(status='terminated').count(),
            'this_month_joined': qs.filter(
                date_joined__month=__import__('datetime').date.today().month,
                date_joined__year=__import__('datetime').date.today().year
            ).count(),
        })

    @action(detail=False, methods=['get'])
    def dropdown(self, request):
        employees = Employee.objects.filter(status='active').values('id', 'full_name', 'employee_id')
        return Response(list(employees))
