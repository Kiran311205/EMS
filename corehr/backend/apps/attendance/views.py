from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
import datetime

from .models import AttendanceRecord
from .serializers import AttendanceSerializer
from apps.accounts.permissions import IsHR


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = AttendanceRecord.objects.select_related('employee').order_by('-date')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsHR]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'status', 'date']

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = datetime.date.today()
        records = AttendanceRecord.objects.filter(date=today).select_related('employee')
        return Response({
            'date': str(today),
            'present': records.filter(status='present').count(),
            'absent': records.filter(status='absent').count(),
            'wfh': records.filter(status='work_from_home').count(),
            'half_day': records.filter(status='half_day').count(),
        })
