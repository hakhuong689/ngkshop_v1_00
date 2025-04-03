from django.db import models
from django.contrib.auth.models import User
import uuid

class cod_orders(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)    # ID duy nhất dạng UUID
    order_id            = models.UUIDField(default=uuid.uuid4, editable=True)                       # ID đơn landing
    cod_date		    = models.DateTimeField(null=True, blank=True)                               # ngày tạo COD                       
    cod_code		    = models.CharField(max_length=20, default='')                               # mã vận đơn
    cod_amount		    = models.DecimalField(max_digits=10, decimal_places=2, default=0)           # Tiền COD
    cod_fee		        = models.DecimalField(max_digits=10, decimal_places=2, default=0)           # phí vận chuyển
    product_code		= models.CharField(max_length=50)                                           # Mã sản phẩm
    price_number		= models.IntegerField(default=0)                                            # Mã Combo
    product_quantity	= models.IntegerField(default=0)                                            # Số lượng
    cost_product		= models.CharField(max_length=50, default='')                               # Mã hộp carton
    cost_product_qty	= models.IntegerField(default=0)                                            # Số lượng hộp carton
    cod_get_amount		= models.DecimalField(max_digits=10, decimal_places=2,default=0)            # Tiền đối soát
    cod_transfer_date   = models.DateField(null=True, blank=True)                                   # Ngày đối soát
    cod_status		    = models.CharField(max_length=50, default='')                               # Trạng thái đơn hàng 
    
    def save(self, *args, **kwargs):
        # Chuyển cod_code thành chữ in hoa, nếu có giá trị
        if self.cod_code:
            self.cod_code = self.cod_code.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.cod_code} - {self.cod_status}"                               # Hiển thị mã đơn hàng khi in object
    
    class Meta:
        db_table = 'cod_orders'
