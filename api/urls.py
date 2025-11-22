from django.urls import path
from .views import RegisterView, LoginView, ProfileView, ChatMessagesView


urlpatterns = [
    path("members/register/", RegisterView.as_view(), name="member-register"),
    path("members/login/", LoginView.as_view(), name="member-login"),
    path("members/me/", ProfileView.as_view(), name="member-profile"),
    path("chat/messages/", ChatMessagesView.as_view(), name="chat-messages"),
]
