from django.db import models
from django.contrib.auth.models import User
import uuid

class Order(models.Model):
    id = models.UUIDField(primary_key=True, editable=True)                          # ID duy nhất dạng UUID
    order_datetime   = models.DateTimeField()                                       # Thời gian đặt hàng
    order_fullname   = models.CharField(max_length=100)                             # Tên đầy đủ khách hàng
    order_phone      = models.CharField(max_length=20)                              # Số điện thoại
    order_address    = models.TextField(blank=True, null=True)                      # Địa chỉ giao hàng
    order_qty_amt    = models.TextField(blank=True, null=True)                      # Thông tin số lượng/tổng tiền dạng chuỗi
    order_note       = models.TextField(blank=True, null=True)                      # Ghi chú (có thể để trống)
    order_url        = models.URLField(max_length=500, blank=True, null=True)       # URL liên quan đến đơn hàng
    order_status     = models.CharField(max_length=20, blank=True, null=True)       # Trạng thái đơn hàng
    ads_utm_campaign = models.CharField(max_length=100, blank=True, null=True)      # Thông tin UTM campaign
    ads_utm_content  = models.CharField(max_length=100, blank=True, null=True)      # Thông tin UTM content
    ads_utm_medium   = models.CharField(max_length=100, blank=True, null=True)      # Thông tin UTM medium
    ads_utm_source   = models.CharField(max_length=100, blank=True, null=True)      # Thông tin UTM source
    ads_adsid        = models.CharField(max_length=100, blank=True, null=True)      # ID quảng cáo
    # Order_confirmation với các lựa chọn (OK, NG, KNM, hoặc blank)
    order_confirmation = models.CharField(
        max_length=4,
        choices=[('OK', 'OK'), ('NG', 'NG'), ('KNM', 'KNM')],
        blank=True,
        default=''
    ) 
    updated_user    = models.CharField(max_length=150, blank=True, null=True)       # Lưu username thay vì ID
    assign_user     = models.CharField(max_length=150, blank=True, null=True)       # Đơn hàng được assign cho user nào
    def __str__(self):
        return self.order_id                                                        # Hiển thị mã đơn hàng khi in object
    class Meta:
        db_table = 'orders'

class OrderLog(models.Model):
    order           = models.ForeignKey(Order, on_delete=models.CASCADE)            # Liên kết với đơn hàng
    updated_user    = models.CharField(max_length=150, blank=True, null=True)       # Lưu username thay vì ID
    field_changed   = models.CharField(max_length=50)                               # Tên trường bị thay đổi
    old_value       = models.TextField(blank=True, null=True)                       # Giá trị cũ trước khi thay đổi
    new_value       = models.TextField(blank=True, null=True)                       # Giá trị mới sau khi thay đổi
    changed_at      = models.DateTimeField(auto_now_add=True)                       # Thời gian thay đổi

    def __str__(self):
        return f"{self.order.order_id} - {self.field_changed}"                      # Hiển thị mã đơn hàng và trường thay đổi
    class Meta:
        db_table = 'order_logs'