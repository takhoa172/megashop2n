import io
from PIL import Image
import cloudinary.uploader
from django import forms
from django.contrib import admin
from django.forms.models import modelform_factory
from django.contrib.admin.helpers import flatten_fieldsets
from django.utils.html import format_html


class CroppableFileWidget(forms.FileInput):
    class Media:
        css = {
            "all": (
                "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.css",
            )
        }
        js = (
            "https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js",
            "admin/js/croppable_image.js",
        )

    def render(self, name, value, attrs=None, renderer=None):
        html = super().render(name, value, attrs, renderer)
        html += format_html(
            '<div id="cropper-container-{0}" class="cropper-container"'
            '  style="display:none;margin-top:8px;max-width:600px">'
            '  <img id="cropper-img-{0}" style="max-width:100%">'
            "</div>",
            name,
        )
        return html


class CloudinaryImageFormMixin(forms.ModelForm):
    image_file = forms.ImageField(
        required=False,
        label="Chọn ảnh",
        widget=CroppableFileWidget(attrs={"accept": "image/*"}),
    )
    clear_image = forms.BooleanField(
        required=False,
        label="Xóa ảnh hiện tại (dùng text thay thế)",
    )
    aspect_ratio = forms.ChoiceField(
        choices=[
            ("free", "Free"),
            ("16:9", "16:9"),
            ("4:3", "4:3"),
            ("1:1", "1:1"),
        ],
        required=False,
        initial="16:9",
        label="Tỉ lệ crop",
    )
    crop_x = forms.FloatField(required=False, widget=forms.HiddenInput())
    crop_y = forms.FloatField(required=False, widget=forms.HiddenInput())
    crop_width = forms.FloatField(required=False, widget=forms.HiddenInput())
    crop_height = forms.FloatField(required=False, widget=forms.HiddenInput())

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if hasattr(self, "url_field") and self.url_field in self.fields:
            self.fields[self.url_field].widget = forms.HiddenInput()
            self.fields[self.url_field].required = False
        if (
            hasattr(self, "public_id_field")
            and self.public_id_field
            and self.public_id_field in self.fields
        ):
            self.fields[self.public_id_field].widget = forms.HiddenInput()
            self.fields[self.public_id_field].required = False

        if self.instance and self.instance.pk:
            current_url = getattr(self.instance, self.url_field, "")
            if current_url:
                self.fields["image_file"].help_text = format_html(
                    '<div style="margin-top:8px">'
                    "  <strong>Ảnh hiện tại:</strong><br>"
                    '  <img src="{}"'
                    '    style="max-width:200px;max-height:120px;object-fit:cover;border-radius:6px;margin-top:4px">'
                    "</div>",
                    current_url,
                )

    def save(self, commit=True):
        instance = super().save(commit=False)

        image_file = self.cleaned_data.get("image_file")
        if image_file:
            self._delete_cloudinary_image(instance)
            url, public_id = self._process_and_upload(image_file)
            setattr(instance, self.url_field, url)
            if self.public_id_field:
                setattr(instance, self.public_id_field, public_id)
        elif self.cleaned_data.get("clear_image"):
            self._delete_cloudinary_image(instance)
            setattr(instance, self.url_field, "")
            if self.public_id_field:
                setattr(instance, self.public_id_field, "")

        if commit:
            instance.save()
        return instance

    def _delete_cloudinary_image(self, instance):
        if not self.public_id_field:
            return
        public_id = getattr(instance, self.public_id_field, "")
        if public_id:
            try:
                cloudinary.uploader.destroy(public_id)
            except Exception:
                pass

    def _process_and_upload(self, image_file):
        img = Image.open(image_file)

        crop_x = self.cleaned_data.get("crop_x")
        if crop_x is not None:
            x = int(float(crop_x))
            y = int(float(self.cleaned_data["crop_y"]))
            w = int(float(self.cleaned_data["crop_width"]))
            h = int(float(self.cleaned_data["crop_height"]))
            if w > 1 and h > 1:
                img = img.crop((x, y, x + w, y + h))

        max_size = 1920
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size), Image.LANCZOS)

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85, optimize=True)
        buf.seek(0)

        result = cloudinary.uploader.upload(
            buf,
            folder=self.folder,
            resource_type="image",
        )

        return result["secure_url"], result["public_id"]


def cloudinary_image_admin(
    url_field="image_url",
    public_id_field="image_public_id",
    folder="common",
):
    custom_fields = [
        "image_file",
        "clear_image",
        "aspect_ratio",
        "crop_x",
        "crop_y",
        "crop_width",
        "crop_height",
    ]

    class CloudinaryImageAdmin(admin.ModelAdmin):
        def get_form(self, request, obj=None, change=False, **kwargs):
            if "fields" in kwargs:
                fields = kwargs.pop("fields")
            else:
                fields = flatten_fieldsets(self.get_fieldsets(request, obj))

            exclude = kwargs.pop("exclude", None)
            formfield_callback = kwargs.pop(
                "formfield_callback", getattr(self, "formfield_callback", None)
            )

            defaults = {
                "form": CloudinaryImageFormMixin,
                "fields": fields,
                "exclude": exclude if exclude is not None else self.exclude,
                "formfield_callback": formfield_callback,
            }
            defaults.update(kwargs)

            Form = modelform_factory(self.model, **defaults)

            DynamicForm = type(
                "DynamicForm",
                (Form,),
                {
                    "url_field": url_field,
                    "public_id_field": public_id_field,
                    "folder": folder,
                },
            )

            return DynamicForm

        def get_fields(self, request, obj=None):
            if self.fields:
                fields = list(self.fields)
            else:
                fields = []
                for f in self.opts.local_fields:
                    if f.editable and f.name not in (self.exclude or ()):
                        fields.append(f.name)
                for f in self.opts.local_many_to_many:
                    if f.name not in (self.exclude or ()):
                        fields.append(f.name)
                if self.exclude:
                    for name in self.exclude:
                        if name in fields:
                            fields.remove(name)

            if url_field in fields:
                fields.remove(url_field)
            if public_id_field and public_id_field in fields:
                fields.remove(public_id_field)
            for f in reversed(custom_fields):
                if f not in fields:
                    fields.insert(0, f)
            return fields

        def get_fieldsets(self, request, obj=None):
            if self.fieldsets:
                fieldsets = list(self.fieldsets)
            else:
                fieldsets = [(None, {"fields": self.get_fields(request, obj)})]

            if fieldsets:
                first = list(fieldsets[0])
                opts = dict(first[1])
                field_list = list(opts.get("fields", []))
                if url_field in field_list:
                    field_list.remove(url_field)
                if public_id_field and public_id_field in field_list:
                    field_list.remove(public_id_field)
                for f in reversed(custom_fields):
                    if f not in field_list:
                        field_list.insert(0, f)
                opts["fields"] = field_list
                first[1] = opts
                fieldsets[0] = tuple(first)
            return fieldsets

        def get_readonly_fields(self, request, obj=None):
            fields = list(self.readonly_fields) if self.readonly_fields else []
            if url_field in fields:
                fields.remove(url_field)
            return fields

    return CloudinaryImageAdmin
