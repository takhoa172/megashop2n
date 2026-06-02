from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        detail = response.data
        if isinstance(detail, dict):
            message = next(iter(detail.values()))
            if isinstance(message, list):
                message = str(message[0]) if message else "Error"
            else:
                message = str(message)
        elif isinstance(detail, list):
            message = str(detail[0]) if detail else "Error"
        else:
            message = str(detail)
        response.data = {
            "success": False,
            "message": message,
            "data": detail,
        }
    return response
