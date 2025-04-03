from rest_framework import serializers
from .models import productgroups

class productgroupsSerializer(serializers.ModelSerializer):    
    class Meta:
        model = productgroups
        fields = ['id', 'group_code', 'group_name', 'note','is_making_sale']

    def create(self, validated_data):
        # Tạo một productgroups mới với dữ liệu đã xác thực
        instance = productgroups.objects.create(**validated_data)
        return instance

    def update(self, instance, validated_data):
        # Cập nhật các trường của instance theo validated_data
        validated_data.pop('group_code', None)
        return super().update(instance, validated_data)
    
        # instance.group_code = validated_data.get('group_code', instance.group_code)
        # instance.group_name = validated_data.get('group_name', instance.group_name)
        # instance.note = validated_data.get('note', instance.note)
        # instance.save()
        # return instance
