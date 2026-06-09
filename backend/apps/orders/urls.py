from django.urls import path
from .views import OrderViewSet, PaymentReturnView

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
order_cancel = OrderViewSet.as_view({
    "post": "cancel",
})
order_init_payment = OrderViewSet.as_view({
    "post": "init_payment",
})

urlpatterns = [
    path("", order_list, name="order-list"),
    path("<uuid:pk>/", order_detail, name="order-detail"),
    path("<uuid:pk>/status/", order_status, name="order-status"),
    path("<uuid:pk>/cancel/", order_cancel, name="order-cancel"),
    path("<uuid:pk>/init-payment/", order_init_payment, name="order-init-payment"),
    path("payment-return/", PaymentReturnView.as_view(), name="payment-return"),
]
