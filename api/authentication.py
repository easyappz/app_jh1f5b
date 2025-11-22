from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import MemberToken


class MemberTokenAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        authorization = request.headers.get("Authorization")
        if not authorization:
            return None
        parts = authorization.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise exceptions.AuthenticationFailed("Неверный формат токена.")
        key = parts[1]
        try:
            token = MemberToken.objects.select_related("member").get(key=key)
        except MemberToken.DoesNotExist:
            raise exceptions.AuthenticationFailed("Недействительный токен.")
        return token.member, None
