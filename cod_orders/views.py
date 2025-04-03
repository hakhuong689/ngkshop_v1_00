# cod_orders/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import cod_orders
from .serializers import CodOrderSerializer
from django.shortcuts import render, redirect
from products.models import Product, PrdPrice  # Import từ app products
from datetime import datetime
from django.utils import timezone
from django.db import connection

class CodOrderViewSet(viewsets.ModelViewSet):
    queryset = cod_orders.objects.all()
    serializer_class = CodOrderSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):            
        # Lấy dữ liệu từ request
        data = request.data.copy()  # Tạo bản sao để chỉnh sửa
        
        # Lấy product_code và price_number từ dữ liệu gửi về
        product_code = data.get('product_code')
        price_number = data.get('price_number')
        
        # Kiểm tra xem product_code và price_number có tồn tại không
        if product_code and price_number is not None:
            try:
                # Tìm Product dựa trên product_code
                product = Product.objects.get(product_code=product_code)

                # Tìm PrdPrice dựa trên product và price_number
                prd_price = PrdPrice.objects.get(product=product, price_number=price_number)

                # Cập nhật các field dựa trên PrdPrice
                data['cod_amount']          = prd_price.prd_amount                                      # Số lượng sản phẩm
                data['product_quantity']    = prd_price.prd_quantity                                    # Số lượng sản phẩm
                data['cost_product']        = prd_price.cost_product if prd_price.cost_product else ''  # Mã hộp carton
                data['cost_product_qty']    = prd_price.cost_product_qty                                # Số lượng hộp carton

            except Product.DoesNotExist:
                return Response(
                    {"error": f"Không tìm thấy Product với product_code: {product_code}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except PrdPrice.DoesNotExist:
                return Response(
                    {"error": f"Không tìm thấy PrdPrice với price_number: {price_number} cho Product: {product_code}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Tiếp tục xử lý lưu dữ liệu
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def _parse_datetime(self, date_str, is_end_of_day=False):
        """Hàm hỗ trợ chuyển đổi chuỗi ngày thành datetime với múi giờ UTC."""
        if not date_str:
            return None
        try:
            dt = datetime.strptime(date_str, '%Y-%m-%d')
            if is_end_of_day:
                dt = dt.replace(hour=23, minute=59, second=59, microsecond=0)
            else:
                dt = dt.replace(hour=0, minute=0, second=0, microsecond=0)
            return (dt)
        except ValueError:
            raise ValueError("Định dạng ngày tháng không hợp lệ. Sử dụng định dạng: YYYY-MM-DD")
        
    def list(self, request, *args, **kwargs):
        # Lấy các tham số từ query params
        cod_date_from       = request.query_params.get('cod_date_from', None)
        cod_date_to         = request.query_params.get('cod_date_to', None)
        cod_code            = request.query_params.get('cod_code', None)
        order_date_from     = request.query_params.get('order_date_from', None)
        order_date_to       = request.query_params.get('order_date_to', None)
        product_code        = request.query_params.get('product_code', None)
        order_phone         = request.query_params.get('order_phone', None)

        # Xử lý các tham số datetime
        try:
            cod_date_from   = self._parse_datetime(cod_date_from)
            cod_date_to     = self._parse_datetime(cod_date_to, is_end_of_day=True)
            
            order_date_from = self._parse_datetime(order_date_from)
            order_date_to   = self._parse_datetime(order_date_to, is_end_of_day=True)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        # Gọi Stored Procedure
        with connection.cursor() as cursor:
            cursor.execute(""" CALL GetCodOrdersWithDetails(%s, %s, %s, %s, %s, %s, %s) """, [
                cod_date_from, cod_date_to, cod_code,
                order_date_from, order_date_to,
                product_code, order_phone
            ])
            results = cursor.fetchall()
            print(results)
            # Lấy tên cột từ cursor
            columns = [col[0] for col in cursor.description]
            # Chuyển đổi kết quả thành danh sách dict
            data = [dict(zip(columns, row)) for row in results]

        return Response(data)
def cod_orders(request):
    if 'auth_token' in request.COOKIES:
        return render(request, 'pages/cod-orders.html')
    return redirect('login')