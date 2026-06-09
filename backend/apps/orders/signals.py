from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.db import transaction
from .models import Order, OrderItem


@receiver(pre_save, sender=Order)
def track_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = Order.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except Order.DoesNotExist:
            instance._old_status = instance.status
    else:
        instance._old_status = instance.status


@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    if created:
        return

    old_status = getattr(instance, "_old_status", None)
    if old_status is None:
        return

    new_status = instance.status
    if new_status == old_status:
        return

    transaction.on_commit(lambda: _update_stock(instance, old_status, new_status))


def _update_stock(order, old_status, new_status):
    items = OrderItem.objects.filter(order=order).select_related("product")

    if new_status == "confirmed" and old_status != "confirmed":
        for item in items:
            product = item.product
            if product and product.status != "sold":
                product.quantity -= item.quantity
                if product.quantity <= 0:
                    product.status = "sold"
                    product.quantity = 0
                product.save()

    if new_status == "cancelled" and old_status != "cancelled":
        for item in items:
            product = item.product
            if product:
                product.quantity += item.quantity
                if product.status == "sold":
                    product.status = "in_stock"
                product.save()
