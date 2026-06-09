from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db import transaction
from django.conf import settings
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusSerializer,
)
from core.permissions import IsStaffOrHigher, IsCustomer
from apps.products.models import Product


class OrderViewSet(viewsets.GenericViewSet):
    queryset = Order.objects.prefetch_related("items__product").select_related("user")

    def get_serializer_class(self):
        if self.action == "create":
            return OrderCreateSerializer
        if self.action == "update_status":
            return OrderStatusSerializer
        return OrderSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        if self.action == "update_status":
            return [IsStaffOrHigher()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]:
            return Order.objects.all()
        return Order.objects.filter(user=user)

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

        with transaction.atomic():
            old_status = order.status
            order.status = new_status
            order.save()

            if new_status == "confirmed" and old_status != "confirmed":
                for item in order.items.select_related("product"):
                    product = item.product
                    if product:
                        product.quantity -= item.quantity
                        if product.quantity <= 0:
                            product.status = "sold"
                            product.quantity = 0
                        product.save()

            if new_status == "cancelled" and old_status != "cancelled":
                for item in order.items.select_related("product"):
                    product = item.product
                    if product:
                        product.quantity += item.quantity
                        if product.status == "sold":
                            product.status = "in_stock"
                        product.save()

        return Response(OrderSerializer(order).data)
