from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalaryRecordViewSet

router = DefaultRouter()
router.register(r'', SalaryRecordViewSet, basename='salary')

urlpatterns = [path('', include(router.urls))]
