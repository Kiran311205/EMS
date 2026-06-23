from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer, ChangePasswordSerializer, RegisterSerializer
from .permissions import IsAdmin


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'Account created successfully',
                    'detail': 'Your account is pending admin approval. You will be able to log in once an administrator activates your account.',
                    'username': user.username,
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_permissions(self):
        if self.action in ['me', 'change_password']:
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsAdmin()]

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.data['old_password']):
            return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully'})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdmin])
    def activate(self, request, pk=None):
        """Activate/approve a user account"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': f'User {user.username} activated successfully'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated, IsAdmin])
    def pending_approval(self, request):
        """Get list of users pending approval"""
        pending_users = User.objects.filter(is_active=False)
        serializer = self.get_serializer(pending_users, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_admins': User.objects.filter(role='admin').count(),
            'total_hr': User.objects.filter(role='hr').count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'pending_approval': User.objects.filter(is_active=False).count(),
        })
