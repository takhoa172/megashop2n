from django.urls import path
from .views import LoginView, RegisterView, CustomerRegisterView, RefreshView, LogoutView, MeView, UserViewSet

users_list = UserViewSet.as_view({
    "get": "list",
    "post": "create",
})
users_detail = UserViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "patch": "partial_update",
    "delete": "destroy",
})

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("register", RegisterView.as_view(), name="auth-register"),
    path("register/customer", CustomerRegisterView.as_view(), name="auth-register-customer"),
    path("refresh", RefreshView.as_view(), name="auth-refresh"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("me", MeView.as_view(), name="auth-me"),
    path("users", users_list, name="users-list"),
    path("users/<uuid:pk>", users_detail, name="users-detail"),
]
