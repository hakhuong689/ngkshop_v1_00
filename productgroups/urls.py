from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import productgroupsViewSet

router = DefaultRouter()
router.register(r'productgroups', productgroupsViewSet, basename='productgroup') # API endpoint: /api/master/productgroups
urlpatterns = router.urls  # Chỉ chứa các route API
