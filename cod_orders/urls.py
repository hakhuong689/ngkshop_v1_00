from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CodOrderViewSet

router = DefaultRouter()
router.register(r'cod-orders', CodOrderViewSet)  # API endpoint: /api/cod-orders/

urlpatterns = router.urls  # Chỉ chứa các route API