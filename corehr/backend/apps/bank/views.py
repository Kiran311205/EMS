from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

from .models import BankDetail
from .serializers import BankDetailSerializer
from apps.accounts.permissions import IsHR


class BankDetailViewSet(viewsets.ModelViewSet):
    """Bank details are HR-only — never exposed to non-HR roles."""
    queryset = BankDetail.objects.select_related('employee').order_by('-created_at')
    serializer_class = BankDetailSerializer
    permission_classes = [IsAuthenticated, IsHR]
    filterset_fields = ['employee']

    def get_queryset(self):
        qs = super().get_queryset()
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            qs = qs.filter(employee_id=employee_id)
        return qs
