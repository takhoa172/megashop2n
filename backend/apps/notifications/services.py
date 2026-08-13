import logging
import urllib.parse
import urllib.request

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _order_email_body(order, message_title, message_text):
    items = "\n".join(
        f"- {item.product_name} x{item.quantity} = {item.subtotal:,} VNĐ"
        for item in order.items.all()
    )
    return (
        f"{message_text}\n\n"
        f"--- ĐƠN HÀNG {order.id.hex[:8].upper()} ---\n"
        f"Người nhận: {order.shipping_name} ({order.shipping_phone})\n"
        f"Địa chỉ: {order.shipping_address}\n"
        f"Sản phẩm:\n{items}\n"
        f"Tạm tính: {order.subtotal:,} VNĐ\n"
        f"Phí vận chuyển: {order.shipping_fee:,} VNĐ\n"
        f"Tổng cộng: {order.total:,} VNĐ\n"
        f"Phương thức thanh toán: {order.get_payment_method_display()}\n"
        f"Trạng thái thanh toán: {order.get_payment_status_display()}\n"
        f"Trạng thái đơn: {order.get_status_display()}"
    )


def send_order_email(order, subject, message_text, recipient=None):
    email = recipient or (order.guest_email or getattr(order.user, "email", None))
    if not email:
        return
    if not getattr(settings, "EMAIL_HOST_USER", ""):
        logger.warning("EMAIL_HOST_USER not configured, skip order email")
        return
    try:
        send_mail(
            subject=subject,
            message=_order_email_body(order, subject, message_text),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send order email")


def _sms_body(order, message_text):
    return (
        f"{message_text} - Đơn {order.id.hex[:8].upper()}: "
        f"{order.total:,} VNĐ, {order.shipping_name}, {order.shipping_phone}"
    )


def send_order_sms(order, message_text):
    phone = order.shipping_phone
    if not phone:
        return
    api_url = getattr(settings, "SMS_API_URL", "")
    api_key = getattr(settings, "SMS_API_KEY", "")
    sender = getattr(settings, "SMS_SENDER", "")
    if not api_url or not api_key:
        logger.warning("SMS_API_URL/KEY not configured, skip order sms")
        return
    try:
        body = _sms_body(order, message_text)
        data = urllib.parse.urlencode(
            {"api_key": api_key, "sender": sender, "phone": phone, "content": body}
        ).encode("utf-8")
        req = urllib.request.Request(api_url, data=data, method="POST")
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp.read()
    except Exception:
        logger.exception("Failed to send order sms")


def notify_order_created(order):
    send_order_email(
        order,
        subject=f"[VIETSHOP] Xác nhận đơn hàng {order.id.hex[:8].upper()}",
        message_text="Cảm ơn bạn đã đặt hàng tại VIETSHOP! Đơn hàng của bạn đang được xử lý.",
    )
    send_order_sms(order, "VIETSHOP xác nhận đã nhận đơn hàng của bạn.")


def notify_order_status(order, status_label):
    send_order_email(
        order,
        subject=f"[VIETSHOP] Cập nhật đơn hàng {order.id.hex[:8].upper()}",
        message_text=f"Đơn hàng của bạn đã chuyển sang trạng thái: {status_label}.",
    )
    send_order_sms(order, f"VIETSHOP: đơn hàng của bạn {status_label.lower()}.")


def notify_order_cancelled(order):
    send_order_email(
        order,
        subject=f"[VIETSHOP] Đơn hàng {order.id.hex[:8].upper()} đã hủy",
        message_text="Đơn hàng của bạn đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ shop.",
    )
    send_order_sms(order, "VIETSHOP: đơn hàng của bạn đã bị hủy.")
