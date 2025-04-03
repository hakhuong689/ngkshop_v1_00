from rest_framework import serializers
from .models import cod_orders

class CodOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = cod_orders
        fields = '__all__'         # Bao gồm tất cả các field
        read_only_fields = ['id']  # Đặt id là read-only, không cho phép cập nhật

    def update(self, instance, validated_data):
        # Loại bỏ id khỏi validated_data nếu có (để chắc chắn không cập nhật id)
        validated_data.pop('id', None)
        return super().update(instance, validated_data)