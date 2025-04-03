from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import render, redirect
from .models import Product, PrdUrl, PrdPrice
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()
        logger.info(f"Product created: {serializer.data['product_code']}")

    def perform_update(self, serializer):
        serializer.save()
        logger.info(f"Product updated: {serializer.data['product_code']}")

    def perform_destroy(self, instance):
        product_code = instance.product_code
        instance.delete()
        logger.info(f"Product deleted: {product_code}")

    def destroy_url(self, request, pk=None, url_id=None):
        product = self.get_object()
        url = product.urls.get(id=url_id)
        url.delete()
        # Đánh số lại url_number
        for index, url in enumerate(product.urls.all().order_by('url_number'), start=1):
            url.url_number = index
            url.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy_price(self, request, pk=None, price_id=None):
        product = self.get_object()
        price = product.prices.get(id=price_id)
        price.delete()
        # Đánh số lại price_number
        for index, price in enumerate(product.prices.all().order_by('price_number'), start=1):
            price.price_number = index
            price.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

def products_page(request):
    if 'auth_token' in request.COOKIES:
        return render(request, 'pages/products.html')
    return redirect('login')