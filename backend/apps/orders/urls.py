from django.urls import path
from .views import OrderViewSet

order_list = OrderViewSet.as_view({
    "get": "list",
    "post": "create",
})
order_detail = OrderViewSet.as_view({
    "get": "retrieve",
})
order_status = OrderViewSet.as_view({
    "patch": "status",
})
order_payment = OrderViewSet.as_view({
    "patch": "payment",
})
order_cancel = OrderViewSet.as_view({
    "post": "cancel",
})

urlpatterns = [
    path("", order_list, name="order-list"),
    path("<uuid:pk>/", order_detail, name="order-detail"),
    path("<uuid:pk>/status/", order_status, name="order-status"),
    path("<uuid:pk>/payment/", order_payment, name="order-payment"),
    path("<uuid:pk>/cancel/", order_cancel, name="order-cancel"),
]
