from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = (
            "id", "first_name", "last_name", "email", "cpf", "password",
            "is_staff", "is_superuser", "is_active",
        )
        read_only_fields = ("id", "is_superuser")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        user = Usuario(**validated_data)

        if not password:
            raise serializers.ValidationError({"password": "Este campo é obrigatório."})

        try:
            validate_password(password, user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            try:
                validate_password(password, instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
            instance.set_password(password)

        instance.save()
        return instance
    
    def validate_cpf(self, value):
        from utils.validators import normalize_cpf
        return normalize_cpf(value)


class UsuarioSelfUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Usuario
        fields = ("first_name", "last_name", "email", "cpf", "password")
        read_only_fields = ("cpf",) # O usuário não pode mudar o próprio CPF (Username) sozinho

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            try:
                validate_password(password, instance)
            except DjangoValidationError as e:
                raise serializers.ValidationError({"password": list(e.messages)})
            instance.set_password(password)

        instance.save()
        return instance


# ==========================================
# SERIALIZER PARA LOOKUP (SELECTS)
# ==========================================

class UsuarioLookupSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField(source='id')
    label = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ['value', 'label', 'cpf']

    def get_label(self, obj: Usuario):
        nome_completo = obj.get_full_name()
        if nome_completo:
            return f"{nome_completo} ({obj.cpf})"
        return obj.cpf
