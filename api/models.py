import secrets

from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Member(models.Model):
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username


class ChatMessage(models.Model):
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class MemberToken(models.Model):
    key = models.CharField(max_length=40, unique=True)
    member = models.OneToOneField(Member, on_delete=models.CASCADE, related_name="auth_token")
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.key:
            self.key = secrets.token_hex(20)
        super().save(*args, **kwargs)
