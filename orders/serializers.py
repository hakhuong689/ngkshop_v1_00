from rest_framework import serializers
from .models import Order, OrderLog

class OrderSerializer(serializers.ModelSerializer):
    order_datetime = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S', input_formats=['%Y-%m-%d %H:%M:%S'])
    class Meta:
        model = Order
        fields = '__all__'  # Bao gồm tất cả các trường trong model
        # read_only_fields = ('id')  # Các trường chỉ đọc

class OrderLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLog
        fields = '__all__'  # Bao gồm tất cả các trường trong model OrderLog