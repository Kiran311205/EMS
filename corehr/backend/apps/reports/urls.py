from django.urls import path
from .views import EmployeeReportView, SalaryReportView, AssetReportView, DashboardStatsView

urlpatterns = [
    path('employees/', EmployeeReportView.as_view(), name='report-employees'),
    path('salary/', SalaryReportView.as_view(), name='report-salary'),
    path('assets/', AssetReportView.as_view(), name='report-assets'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
