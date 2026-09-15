from typing import Any
from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from django.utils.translation import gettext_lazy as _
from .models import User


class UserSerializer(serializers.ModelSerializer):
    asm_name = serializers.CharField(source='asm.name', read_only=True, default=None)
    asm_employee_id = serializers.CharField(source='asm.employee_id', read_only=True, default=None)

    class Meta:
        model = User
        fields = [
            'id', 'employee_id', 'email', 'name', 'mobile', 'role',
            'branch', 'territory', 'joining_date', 'asm', 'asm_name', 'asm_employee_id',
            'must_change_password', 'credentials_email_status', 'is_deleted',
            'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BadRequestException(exceptions.APIException):
    status_code = 400
    default_detail = _('Bad request')
    default_code = 'bad_request'

    def __init__(self, detail: str):
        self.detail = detail


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Supports logging in with Employee ID (e.g. TC-001) OR Email Address.
    Validates account status (is_active & not is_deleted) and returns user info.
    """
    token_class = RefreshToken

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'email' in self.fields:
            self.fields['email'].required = False
            self.fields['email'].allow_blank = True
        if 'username' in self.fields:
            self.fields['username'].required = False
            self.fields['username'].allow_blank = True
        if 'password' in self.fields:
            self.fields['password'].required = False
            self.fields['password'].allow_blank = True
        self.fields['employee_id'] = serializers.CharField(
            required=False,
            allow_blank=True,
            help_text="Employee ID (e.g. TC-001, ADMIN-001) or Email Address"
        )

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:  # type: ignore[override]
        employee_id_raw = attrs.get('employee_id') or attrs.get('username') or attrs.get('email')
        password = attrs.get('password')

        employee_id_input = str(employee_id_raw).strip() if employee_id_raw else ""
        password_input = str(password).strip() if password else ""

        if not employee_id_input and not password_input:
            raise BadRequestException('Employee ID and password are required.')
        if not employee_id_input:
            raise BadRequestException('Employee ID is required.')
        if not password_input:
            raise BadRequestException('Password is required.')

        user_obj = User.objects.filter(
            Q(employee_id__iexact=employee_id_input) | Q(email__iexact=employee_id_input),
            is_deleted=False
        ).first()

        if not user_obj:
            raise exceptions.AuthenticationFailed('Invalid Employee ID or password.')

        if not user_obj.is_active:
            raise exceptions.AuthenticationFailed('Your account is inactive. Please contact the Admin.')

        if not user_obj.check_password(password_input):
            raise exceptions.AuthenticationFailed('Invalid Employee ID or password.')

        self.user = user_obj
        refresh = RefreshToken.for_user(self.user)

        return {
            'message': 'Login successful',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(self.user.id),
                'employee_id': self.user.employee_id,
                'email': self.user.email,
                'name': self.user.name,
                'role': self.user.role,
                'branch': self.user.branch,
                'status': 'ACTIVE' if self.user.is_active else 'INACTIVE',
                'must_change_password': self.user.must_change_password,
            }
        }


class CreateTelecallerSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'mobile', 'email', 'employee_id', 'branch', 'joining_date', 'asm', 'password', 'confirm_password', 'is_active']

    def validate_employee_id(self, value):
        if value:
            value = value.strip()
            if User.objects.filter(employee_id__iexact=value).exists():
                raise serializers.ValidationError("Employee ID already exists. Please enter another Employee ID.")
        return value

    def validate_email(self, value):
        if value:
            value = value.strip().lower()
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("Email address already exists. Please enter another Email.")
        return value

    def validate_mobile(self, value):
        if value:
            value = value.strip()
            if User.objects.filter(mobile=value).exists():
                raise serializers.ValidationError("Mobile number already exists. Please enter another Mobile Number.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        if validated_data.get('employee_id'):
            validated_data['employee_id'] = validated_data['employee_id'].strip()
        validated_data['role'] = User.Role.TELECALLER
        validated_data['must_change_password'] = True

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class CreateAsmSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['name', 'mobile', 'email', 'employee_id', 'branch', 'joining_date', 'password', 'confirm_password', 'is_active']

    def validate_employee_id(self, value):
        if value:
            value = value.strip()
            if User.objects.filter(employee_id__iexact=value).exists():
                raise serializers.ValidationError("Employee ID already exists. Please enter another Employee ID.")
        return value

    def validate_email(self, value):
        if value:
            value = value.strip().lower()
            if User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("Email address already exists. Please enter another Email.")
        return value

    def validate_mobile(self, value):
        if value:
            value = value.strip()
            if User.objects.filter(mobile=value).exists():
                raise serializers.ValidationError("Mobile number already exists. Please enter another Mobile Number.")
        return value

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        if validated_data.get('employee_id'):
            validated_data['employee_id'] = validated_data['employee_id'].strip()
        validated_data['role'] = User.Role.ASM
        validated_data['must_change_password'] = True

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        return attrs


class ResetPasswordSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True, min_length=6)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs
