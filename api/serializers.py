from rest_framework import serializers
from .models import Member, ChatMessage


class MemberRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Member
        fields = ["id", "username", "password"]
        read_only_fields = ["id"]

    def validate_username(self, value):
        if Member.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует.")
        return value

    def create(self, validated_data):
        member = Member(username=validated_data["username"])
        member.set_password(validated_data["password"])
        member.save()
        return member


class MemberLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        try:
            member = Member.objects.get(username=username)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Неверное имя пользователя или пароль.")
        if not member.check_password(password):
            raise serializers.ValidationError("Неверное имя пользователя или пароль.")
        attrs["member"] = member
        return attrs


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "username", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChatMessageSerializer(serializers.ModelSerializer):
    member = serializers.CharField(source="member.username", read_only=True)

    class Meta:
        model = ChatMessage
        fields = ["id", "member", "content", "created_at"]
        read_only_fields = ["id", "member", "created_at"]

    def validate_content(self, value):
        value = value.strip()
        if value == "":
            raise serializers.ValidationError("Сообщение не может быть пустым.")
        if len(value) > 1000:
            raise serializers.ValidationError("Слишком длинное сообщение. Максимум 1000 символов.")
        return value
