from rest_framework import serializers
from .models import Asset


class AssetSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
        extra_kwargs = {
            'employee': {'required': True},
            'asset_type': {'required': True},
        }
