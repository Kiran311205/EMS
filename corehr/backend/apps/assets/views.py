from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Asset
from .serializers import AssetSerializer
from apps.accounts.permissions import IsHR


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('employee').order_by('-created_at')
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated, IsHR]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'asset_type', 'status']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return Response({
            'total': Asset.objects.count(),
            'received': Asset.objects.filter(status='received').count(),
            'not_received': Asset.objects.filter(status='not_received').count(),
            'pending': Asset.objects.filter(status='pending').count(),
            'by_type': {
                t[0]: {
                    'received': Asset.objects.filter(asset_type=t[0], status='received').count(),
                    'not_received': Asset.objects.filter(asset_type=t[0], status='not_received').count(),
                    'pending': Asset.objects.filter(asset_type=t[0], status='pending').count(),
                }
                for t in Asset.ASSET_TYPE
            }
        })

    @action(detail=False, methods=['get'])
    def not_received(self, request):
        qs = Asset.objects.filter(status__in=['not_received', 'pending']).select_related('employee')
        return Response(AssetSerializer(qs, many=True).data)
