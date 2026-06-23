from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BankDetailViewSet

router = DefaultRouter()
router.register(r'', BankDetailViewSet, basename='bank')

urlpatterns = [path('', include(router.urls))]
