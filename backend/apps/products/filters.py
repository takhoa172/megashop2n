import django_filters
import django.db.models as models
from .models import Product


class ProductFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Product.Status.choices)
    category = django_filters.CharFilter(method="filter_category")
    keyword = django_filters.CharFilter(method="filter_keyword")
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")
    price_min = django_filters.NumberFilter(field_name="sale_price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="sale_price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["status", "category", "keyword", "date_from", "date_to", "price_min", "price_max"]

    def filter_category(self, queryset, name, value):
        cat_ids = value.split(",")
        return queryset.filter(category_id__in=cat_ids)

    def filter_keyword(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) | models.Q(sku__icontains=value)
        )
