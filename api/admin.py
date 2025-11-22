from django.contrib import admin
from .models import Member, ChatMessage


class MemberAdmin(admin.ModelAdmin):
    list_display = ("username", "created_at")


class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("member", "content", "created_at")


admin.site.register(Member, MemberAdmin)
admin.site.register(ChatMessage, ChatMessageAdmin)
