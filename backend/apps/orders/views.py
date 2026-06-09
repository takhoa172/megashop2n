from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusSerializer,
)
from core.permissions import IsStaffOrHigher
from apps.products.models import Product


class OrderViewSet(viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("items__product").select_related("user")

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if self.action in ["update_status", "cancel"]:
            return OrderStatusSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action in ["list", "retrieve", "cancel"]:
            return [IsAuthenticated()]
        if self.action == "update_status":
            return [IsStaffOrHigher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if self.action == "list":
            if self.request.query_params.get("all") == "1" and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
                return Order.objects.all()
            return Order.objects.filter(user=user)
        if user.role not in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
            return Order.objects.filter(user=user)
        return Order.objects.all()

    def create(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )

    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = OrderSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        order = self.get_object()
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]

        order.status = new_status
        order.save()

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != "pending":
            return Response(
                {"detail": "Chỉ có thể hủy đơn hàng ở trạng thái chờ xác nhận"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        with transaction.atomic():
            order.status = Order.Status.CANCELLED
            order.save()
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def init_payment(self, request, pk=None):
        order = self.get_object()
        if order.payment_method != Order.PaymentMethod.VNPAY:
            return Response(
                {"detail": "Phương thức thanh toán không phải VNPay"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if order.payment_status == Order.PaymentStatus.PAID:
            return Response(
                {"detail": "Đơn hàng đã được thanh toán"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from .payment import create_payment_url
        payment_url = create_payment_url(order, request)
        return Response({"payment_url": payment_url})


class PaymentReturnView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        from .payment import verify_return
        params = request.query_params.dict()
        is_valid = verify_return(params)

        if is_valid:
            txn_ref = params.get("vnp_TxnRef", "")
            try:
                order = Order.objects.get(vnpay_txn_ref=txn_ref)
                if params.get("vnp_TransactionStatus") == "00":
                    order.payment_status = Order.PaymentStatus.PAID
                    order.vnpay_paid_at = timezone.now()
                    order.save(update_fields=["payment_status", "vnpay_paid_at"])
            except Order.DoesNotExist:
                pass
            return Response({"status": "success"})
        return Response({"status": "fail"}, status=status.HTTP_400_BAD_REQUEST)
