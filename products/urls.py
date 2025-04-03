from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='products')

urlpatterns = router.urls + [
    path('products/<int:pk>/urls/<int:url_id>/', ProductViewSet.as_view({'delete': 'destroy_url'}), name='destroy_url'),
    path('products/<int:pk>/prices/<int:price_id>/', ProductViewSet.as_view({'delete': 'destroy_price'}), name='destroy_price'),
]