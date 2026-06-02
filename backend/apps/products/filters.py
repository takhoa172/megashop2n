import django_filters
import django.db.models as models
from .models import Product


class ProductFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Product.Status.choices)
    category = django_filters.UUIDFilter(field_name="category_id")
    keyword = django_filters.CharFilter(method="filter_keyword")
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["status", "category", "keyword", "date_from", "date_to"]

    def filter_keyword(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) | models.Q(sku__icontains=value)
        )
