from .models import AuditLog


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


class AuditLogMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if (request.user.is_authenticated and
                request.path.startswith('/api/') and
                request.method in ('POST', 'PUT', 'PATCH', 'DELETE')):
            try:
                method_action_map = {
                    'POST': 'CREATE',
                    'PUT': 'UPDATE',
                    'PATCH': 'UPDATE',
                    'DELETE': 'DELETE',
                }
                AuditLog.objects.create(
                    user=request.user,
                    action=method_action_map.get(request.method, 'VIEW'),
                    endpoint=request.path,
                    method=request.method,
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:300],
                )
            except Exception:
                pass
        return response
