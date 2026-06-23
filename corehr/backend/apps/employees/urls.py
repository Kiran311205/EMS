from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet, DesignationViewSet

router = DefaultRouter()
router.register(r'', EmployeeViewSet, basename='employee')
router.register(r'departments/list', DepartmentViewSet, basename='department')
router.register(r'designations/list', DesignationViewSet, basename='designation')

urlpatterns = [path('', include(router.urls))]
