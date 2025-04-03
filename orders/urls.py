from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)  # API endpoint: /api/orders/

urlpatterns = router.urls  # Chỉ chứa các route API