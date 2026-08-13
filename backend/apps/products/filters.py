import django_filters
import django.db.models as models
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from .models import Product


class ProductFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Product.Status.choices)
    category = django_filters.CharFilter(method="filter_category")
    keyword = django_filters.CharFilter(method="filter_keyword")
    q = django_filters.CharFilter(method="filter_fulltext")
    date_from = django_filters.DateFilter(field_name="created_at", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="created_at", lookup_expr="lte")
    price_min = django_filters.NumberFilter(field_name="sale_price", lookup_expr="gte")
    price_max = django_filters.NumberFilter(field_name="sale_price", lookup_expr="lte")

    class Meta:
        model = Product
        fields = ["status", "category", "keyword", "q", "date_from", "date_to", "price_min", "price_max"]

    def filter_category(self, queryset, name, value):
        cat_ids = value.split(",")
        return queryset.filter(category_id__in=cat_ids)

    def filter_keyword(self, queryset, name, value):
        return queryset.filter(
            models.Q(name__icontains=value) | models.Q(sku__icontains=value)
        )

    def filter_fulltext(self, queryset, name, value):
        vector = SearchVector("name", "description", "sku")
        query = SearchQuery(value)
        return queryset.annotate(
            search_rank=SearchRank(vector, query)
        ).filter(search_rank__gt=0).order_by("-search_rank")
