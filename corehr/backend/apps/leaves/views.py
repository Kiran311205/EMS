from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
import datetime

from .models import LeaveRequest
from .serializers import LeaveRequestSerializer
from apps.accounts.permissions import IsHR


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee').order_by('-created_at')
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated, IsHR]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'status', 'leave_type']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'approved'
        leave.reviewed_by = request.user.get_full_name()
        leave.review_note = request.data.get('note', '')
        leave.reviewed_at = datetime.datetime.now()
        leave.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        leave.status = 'rejected'
        leave.reviewed_by = request.user.get_full_name()
        leave.review_note = request.data.get('note', '')
        leave.reviewed_at = datetime.datetime.now()
        leave.save()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': LeaveRequest.objects.count(),
            'pending': LeaveRequest.objects.filter(status='pending').count(),
            'approved': LeaveRequest.objects.filter(status='approved').count(),
            'rejected': LeaveRequest.objects.filter(status='rejected').count(),
        })
