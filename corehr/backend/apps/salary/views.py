from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
import datetime

from .models import SalaryRecord
from .serializers import SalaryRecordSerializer
from apps.accounts.permissions import IsAdmin, IsHR


class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.select_related('employee', 'employee__department').order_by('-year', '-month')
    serializer_class = SalaryRecordSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'month', 'year', 'status']

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'create', 'destroy', 'bulk_update_status']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated(), IsHR()]

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = datetime.date.today()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        qs = SalaryRecord.objects.filter(month=month, year=year)
        return Response({
            'month': month,
            'year': year,
            'total': qs.count(),
            'paid': qs.filter(status='paid').count(),
            'unpaid': qs.filter(status='unpaid').count(),
            'on_hold': qs.filter(status='on_hold').count(),
            'partial': qs.filter(status='partial').count(),
            'total_paid_amount': sum(r.net_salary for r in qs.filter(status='paid')),
            'total_unpaid_amount': sum(r.net_salary for r in qs.filter(status='unpaid')),
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def bulk_update_status(self, request):
        ids = request.data.get('ids', [])
        new_status = request.data.get('status')
        paid_date = request.data.get('paid_date')
        if not ids or not new_status:
            return Response({'error': 'ids and status required'}, status=status.HTTP_400_BAD_REQUEST)
        update_data = {'status': new_status}
        if paid_date:
            update_data['paid_date'] = paid_date
        updated = SalaryRecord.objects.filter(id__in=ids).update(**update_data)
        return Response({'updated': updated})
