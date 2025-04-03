"""
URL configuration for ngkshop_v1_00 project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponseRedirect
from rest_framework.authtoken.views import obtain_auth_token
from orders.views import index,login, orders                            # Import index,login,orders trực tiếp
from cod_orders.views import cod_orders                                 # Import cod-orders trực tiếp
from products.views import products_page                                # Import từ master Products data
from productgroups.views import product_groups_page                     # Import từ Master Product group data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('orders.urls')),                                                # Chỉ dành cho API orders 
    path('api/', include('cod_orders.urls')),                                            # Chỉ dành cho API cod orders 
    path('app/', index, name='index'),                                                   # Trang chủ
    path('app/login/', login, name='login'),                                             # Trang đăng nhập

    path('app/orders/', orders, name='orders'),                                          # Trang đơn đặt hàng
    path('app/cod-orders/', orders, name='cod-orders'),                                  # Trang đơn COD   
    path('api/master/', include('products.urls')),                                       # API cho Products: '/api/master/'
    path('api/master/', include('productgroups.urls')),                                  # API cho Product Groups: '/api/master/'

    path('app/master/products/', products_page, name='products_page'),                   # HTML cho Products Master
    path('app/master/productgroups/', product_groups_page, name='product_groups_page'),  # HTML cho Product Group Master

    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),                   # Lấy token
    path('', lambda request: HttpResponseRedirect('/app/')),                             # Redirect / sang /app/
]