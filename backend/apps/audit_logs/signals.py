from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from .models import AuditLog
from core.audit_middleware import get_current_user

MODELS_TO_AUDIT = ["Product", "Purchase", "Sale"]


def _serialize_model(instance):
    data = {}
    for field in instance._meta.fields:
        name = field.name
        value = getattr(instance, name)
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        if hasattr(value, "pk"):
            value = str(value.pk)
        data[name] = str(value) if value is not None else None
    return data


@receiver(pre_save)
def audit_pre_save(sender, **kwargs):
    if sender.__name__ not in MODELS_TO_AUDIT:
        return
    if not kwargs.get("raw", False):
        instance = kwargs["instance"]
        if instance.pk:
            try:
                old = sender.objects.get(pk=instance.pk)
                instance._audit_old_data = _serialize_model(old)
            except sender.DoesNotExist:
                instance._audit_old_data = None
        else:
            instance._audit_old_data = None


@receiver(post_save)
def audit_post_save(sender, **kwargs):
    if sender.__name__ not in MODELS_TO_AUDIT:
        return
    if kwargs.get("raw", False):
        return
    instance = kwargs["instance"]
    action = "CREATE" if kwargs.get("created") else "UPDATE"
    old_data = getattr(instance, "_audit_old_data", None)
    new_data = _serialize_model(instance)
    AuditLog.objects.create(
        user=get_current_user(),
        action=action,
        table_name=sender.__name__,
        object_id=instance.pk,
        old_data=old_data,
        new_data=new_data,
    )


@receiver(post_delete)
def audit_post_delete(sender, **kwargs):
    if sender.__name__ not in MODELS_TO_AUDIT:
        return
    instance = kwargs["instance"]
    AuditLog.objects.create(
        user=get_current_user(),
        action="DELETE",
        table_name=sender.__name__,
        object_id=instance.pk,
        old_data=_serialize_model(instance),
        new_data=None,
    )
