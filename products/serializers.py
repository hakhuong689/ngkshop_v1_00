from rest_framework import serializers
from .models import Product, PrdUrl, PrdPrice

class PrdUrlSerializer(serializers.ModelSerializer):
    url_number = serializers.IntegerField(read_only=True)  # Không yêu cầu từ client

    class Meta:
        model = PrdUrl
        fields = ['id','url_name', 'landing_url', 'url_number']

class PrdPriceSerializer(serializers.ModelSerializer):
    price_number = serializers.IntegerField(read_only=True)  # Không yêu cầu từ client
    class Meta:
        model = PrdPrice
        fields = ['id','price_number','price_name', 'prd_quantity', 'prd_amount', 'landing_qty_amt','cost_product','cost_product_qty']

class ProductSerializer(serializers.ModelSerializer):
    urls = PrdUrlSerializer(many=True, required=False)
    prices = PrdPriceSerializer(many=True, required=False)

    class Meta:
        model = Product
        fields = ['id', 'product_code', 'product_name', 'bill_name','product_unit','group_code' ,'urls', 'prices']

    def create(self, validated_data):
        urls_data = validated_data.pop('urls', [])
        prices_data = validated_data.pop('prices', [])
        product = Product.objects.create(**validated_data)

        # Tự sinh url_number
        for index, url_data in enumerate(urls_data, start=1):
            PrdUrl.objects.create(product=product, url_number=index, **url_data)

        # Tự sinh price_number
        for index, price_data in enumerate(prices_data, start=1):
            PrdPrice.objects.create(product=product, price_number=index, **price_data)

        return product

    def update(self, instance, validated_data):
        urls_data = validated_data.pop('urls', [])
        prices_data = validated_data.pop('prices', [])

        instance.product_code   = validated_data.get('product_code', instance.product_code)
        instance.product_name   = validated_data.get('product_name', instance.product_name)
        instance.bill_name      = validated_data.get('bill_name', instance.bill_name)
        instance.product_unit   = validated_data.get('product_unit', instance.product_unit)
        instance.group_code     = validated_data.get('group_code', instance.group_code)
        instance.save()

        # Xóa và tạo lại urls với url_number mới
        instance.urls.all().delete()
        for index, url_data in enumerate(urls_data, start=1):
            PrdUrl.objects.create(product=instance, url_number=index, **url_data)

        # Xóa và tạo lại prices với price_number mới
        instance.prices.all().delete()
        for index, price_data in enumerate(prices_data, start=1):
            PrdPrice.objects.create(product=instance, price_number=index, **price_data)

        return instance