from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, redirect
from .models import productgroups
from .serializers import productgroupsSerializer
import logging

logger = logging.getLogger(__name__)

class productgroupsViewSet(viewsets.ModelViewSet):
    # API endpoint cho các nhóm sản phẩm: thêm, sửa, xóa, lấy danh sách   
    queryset = productgroups.objects.all()
    serializer_class = productgroupsSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save()
        #logger.info(f"productgroups created: {instance.group_code}")

    def perform_update(self, serializer):
        instance = serializer.save()
        #logger.info(f"productgroups updated: {instance.group_code}")

    def perform_destroy(self, instance):
        group_code = instance.group_code
        instance.delete()
        #logger.info(f"productgroups deleted: {group_code}")

def product_groups_page(request):
    # View render trang hiển thị danh sách các nhóm sản phẩm (nếu cần).
    # Nếu cookie 'auth_token' tồn tại sẽ render trang, ngược lại chuyển hướng đến trang đăng nhập.    
    if 'auth_token' in request.COOKIES:
        return render(request, 'pages/productgroups.html')
    return redirect('login')
