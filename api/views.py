from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Member, ChatMessage, MemberToken
from .serializers import (
    MemberRegisterSerializer,
    MemberLoginSerializer,
    MemberSerializer,
    ChatMessageSerializer,
)
from .authentication import MemberTokenAuthentication


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = MemberRegisterSerializer(data=request.data)
        if serializer.is_valid():
            member = serializer.save()
            data = MemberSerializer(member).data
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        member = serializer.validated_data["member"]
        MemberToken.objects.filter(member=member).delete()
        token = MemberToken(member=member)
        token.save()
        data = {
            "token": token.key,
            "member": MemberSerializer(member).data,
        }
        return Response(data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [MemberTokenAuthentication]

    def get(self, request):
        serializer = MemberSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        member = request.user
        username = request.data.get("username")
        password = request.data.get("password")
        errors = {}
        if username is not None and username != member.username:
            if Member.objects.filter(username=username).exclude(id=member.id).exists():
                errors["username"] = ["Пользователь с таким именем уже существует."]
            else:
                member.username = username
        if password is not None:
            if len(password) < 6:
                errors["password"] = ["Пароль должен содержать не менее 6 символов."]
            else:
                member.set_password(password)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)
        member.save()
        serializer = MemberSerializer(member)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatMessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [MemberTokenAuthentication]

    def get(self, request):
        queryset = ChatMessage.objects.select_related("member").order_by("-created_at")[:50]
        messages = list(queryset)[::-1]
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = serializer.save(member=request.user)
            output = ChatMessageSerializer(message)
            return Response(output.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
