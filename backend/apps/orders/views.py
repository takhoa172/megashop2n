from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction, models as db_models
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusSerializer,
)
from core.permissions import IsStaffOrHigher
from apps.products.models import Product
from apps.notifications.services import (
    notify_order_created, notify_order_status, notify_order_cancelled,
)

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

        qs = Order.objects.prefetch_related("items__product").select_related("user")

        if self.action == "list":
            if not (self.request.query_params.get("all") == "1" and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]):
                qs = qs.filter(user=user)

            search = self.request.query_params.get("search", "").strip()
            if search:
                qs = qs.filter(
                    db_models.Q(shipping_name__icontains=search) |
                    db_models.Q(shipping_phone__icontains=search) |
                    db_models.Q(guest_email__icontains=search) |
                    db_models.Q(id__icontains=search)
                )
            return qs

        if user.role not in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
            return qs.filter(user=user)
        return qs

    def create(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        transaction.on_commit(
            lambda: notify_order_created(order)
        )
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
        transaction.on_commit(
            lambda: notify_order_status(order, order.get_status_display())
        )

        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=["patch"])
    def payment(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("payment_status", "")
        if new_status not in Order.PaymentStatus.values:
            return Response(
                {"detail": "payment_status không hợp lệ"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.payment_status = new_status
        order.save(update_fields=["payment_status", "updated_at"])
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
            transaction.on_commit(lambda: notify_order_cancelled(order))
        return Response(OrderSerializer(order).data)
