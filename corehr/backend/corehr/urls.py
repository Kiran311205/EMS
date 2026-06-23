from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/employees/', include('apps.employees.urls')),
    path('api/assets/', include('apps.assets.urls')),
    path('api/bank/', include('apps.bank.urls')),
    path('api/salary/', include('apps.salary.urls')),
    path('api/attendance/', include('apps.attendance.urls')),
    path('api/leaves/', include('apps.leaves.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/audit/', include('apps.audit.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
