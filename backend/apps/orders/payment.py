import hashlib
import hmac
import urllib.parse
from datetime import datetime
from django.conf import settings


def create_payment_url(order, request):
    tmn_code = getattr(settings, "VNPAY_TMN_CODE", "")
    hash_secret = getattr(settings, "VNPAY_HASH_SECRET", "")
    return_url = getattr(settings, "VNPAY_RETURN_URL", "")

    txn_ref = f"ORDER{order.id.hex[:12].upper()}"
    order.vnpay_txn_ref = txn_ref
    order.save(update_fields=["vnpay_txn_ref"])

    params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": tmn_code,
        "vnp_Amount": int(order.total * 100),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": f"Thanh toan don hang {order.id.hex[:8]}",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": request.META.get("REMOTE_ADDR", "127.0.0.1"),
        "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
    }

    sorted_params = sorted(params.items())
    raw_data = urllib.parse.urlencode(sorted_params)
    secure_hash = hmac.new(
        hash_secret.encode("utf-8"),
        raw_data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()
    params["vnp_SecureHash"] = secure_hash

    payment_url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    query = urllib.parse.urlencode(params)
    return f"{payment_url}?{query}"


def verify_return(params):
    hash_secret = getattr(settings, "VNPAY_HASH_SECRET", "")
    secure_hash = params.pop("vnp_SecureHash", None)
    if not secure_hash:
        return False

    sorted_params = sorted(
        [(k, v) for k, v in params.items() if k.startswith("vnp_")]
    )
    raw_data = urllib.parse.urlencode(sorted_params)
    expected_hash = hmac.new(
        hash_secret.encode("utf-8"),
        raw_data.encode("utf-8"),
        hashlib.sha512,
    ).hexdigest()

    if secure_hash != expected_hash:
        return False

    return params.get("vnp_TransactionStatus") == "00"
