from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Check if user exists but is inactive
        from django.contrib.auth import authenticate
        username = attrs.get('username')
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        if user is None:
            # Try to find the user to give a specific error message
            try:
                user_obj = User.objects.get(username=username)
                if not user_obj.check_password(password):
                    raise serializers.ValidationError('Invalid username or password')
                if not user_obj.is_active:
                    raise serializers.ValidationError('Your account is pending admin approval. Please wait for approval before logging in.')
            except User.DoesNotExist:
                raise serializers.ValidationError('Invalid username or password')
        
        if user and not user.is_active:
            raise serializers.ValidationError('Your account is pending admin approval. Please wait for approval before logging in.')
        
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = self.user.get_full_name()
        data['email'] = self.user.email
        data['user_id'] = self.user.id
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['full_name'] = user.get_full_name()
        token['email'] = user.email
        return token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'full_name', 'role', 'phone', 'profile_photo', 'is_active',
                  'password', 'created_at']
        read_only_fields = ['created_at']

    def get_full_name(self, obj):
        return obj.get_full_name()

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password and password.strip():  # Only update if non-empty
            instance.set_password(password)
        instance.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=True, max_length=150)
    username = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(required=True, choices=User.ROLE_CHOICES)
    phone = serializers.CharField(required=False, max_length=15, allow_blank=True)
    password = serializers.CharField(required=True, min_length=8, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        return value

    def validate_email(self, value):
        if not value.lower().endswith('@sskatt.com'):
            raise serializers.ValidationError('Only company email addresses ending with @sskatt.com are allowed.')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Full name is required.')
        return value.strip()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        full_name = validated_data.pop('full_name')
        name_parts = full_name.split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        user = User(
            **validated_data,
            first_name=first_name,
            last_name=last_name,
            is_active=False,  # Requires admin activation
        )
        user.set_password(password)
        user.save()
        return user
