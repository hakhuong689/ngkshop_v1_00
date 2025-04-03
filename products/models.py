from django.db import models

class Product(models.Model):
    product_code    = models.CharField(max_length=50, unique=True)
    product_name    = models.CharField(max_length=255, null=False)
    bill_name       = models.CharField(max_length=255)
    product_unit    = models.CharField(max_length=30, null=True)
    group_code      = models.CharField(max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return self.product_name
    class Meta:
        db_table = 'products'

class PrdUrl(models.Model):
    product     = models.ForeignKey(Product, related_name='urls', on_delete=models.CASCADE)
    url_name    = models.CharField(max_length=100)
    landing_url = models.URLField(max_length=500)
    url_number  = models.IntegerField()

    class Meta:
        db_table = 'products_urls'
        unique_together = ('product', 'url_number')

class PrdPrice(models.Model):
    product             = models.ForeignKey(Product, related_name='prices', on_delete=models.CASCADE)
    price_number        = models.IntegerField()
    price_name          = models.CharField(max_length=100)
    prd_quantity        = models.IntegerField()
    prd_amount          = models.DecimalField(max_digits=10, decimal_places=2)
    landing_qty_amt     = models.CharField(max_length=255, blank=True, null=True)
    cost_product        = models.CharField(max_length=50, default='')
    cost_product_qty    = models.IntegerField(default=0)

    class Meta:
        db_table = 'products_prices'
        unique_together = ('product', 'price_number')