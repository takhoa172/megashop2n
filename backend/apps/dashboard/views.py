from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from apps.products.models import Product
from apps.sales.models import Sale
from apps.purchases.models import Purchase


class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        today_start = timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.min.time())
        )
        today_end = timezone.make_aware(
            timezone.datetime.combine(today, timezone.datetime.max.time())
        )

        today_sales = Sale.objects.filter(sold_at__range=(today_start, today_end))
        today_products = Sale.objects.filter(
            sold_at__range=(today_start, today_end)
        ).count()

        today_revenue = today_sales.aggregate(total=Sum("sale_price"))["total"] or 0

        today_purchases = Purchase.objects.filter(
            purchased_at__range=(today_start, today_end)
        )
        today_cost = today_purchases.aggregate(total=Sum("purchase_price"))["total"] or 0
        today_profit = today_revenue - today_cost

        total_products = Product.objects.count()
        in_stock = Product.objects.filter(status="in_stock").count()
        sold = Product.objects.filter(status="sold").count()
        pending_price = Product.objects.filter(status="pending_price").count()

        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_sales = Sale.objects.filter(sold_at__gte=month_start)
        monthly_revenue = monthly_sales.aggregate(total=Sum("sale_price"))["total"] or 0
        monthly_purchases = Purchase.objects.filter(purchased_at__gte=month_start)
        monthly_cost = monthly_purchases.aggregate(total=Sum("purchase_price"))["total"] or 0
        monthly_profit = monthly_revenue - monthly_cost

        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        yearly_sales = Sale.objects.filter(sold_at__gte=year_start)
        yearly_revenue = yearly_sales.aggregate(total=Sum("sale_price"))["total"] or 0
        yearly_purchases = Purchase.objects.filter(purchased_at__gte=year_start)
        yearly_cost = yearly_purchases.aggregate(total=Sum("purchase_price"))["total"] or 0
        yearly_profit = yearly_revenue - yearly_cost

        return Response({
            "today": {
                "revenue": float(today_revenue),
                "cost": float(today_cost),
                "profit": float(today_profit),
                "products_sold": today_products,
            },
            "monthly": {
                "revenue": float(monthly_revenue),
                "cost": float(monthly_cost),
                "profit": float(monthly_profit),
            },
            "yearly": {
                "revenue": float(yearly_revenue),
                "cost": float(yearly_cost),
                "profit": float(yearly_profit),
            },
            "inventory": {
                "total_products": total_products,
                "in_stock": in_stock,
                "sold": sold,
                "pending_price": pending_price,
            },
        })


class RevenueChartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        revenue_by_month = (
            Sale.objects
            .filter(sold_at__gte=year_start)
            .annotate(month=TruncMonth("sold_at"))
            .values("month")
            .annotate(revenue=Sum("sale_price"))
            .order_by("month")
        )
        data = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "revenue": float(item["revenue"]),
            }
            for item in revenue_by_month
        ]
        return Response(data)


class ProfitChartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)

        revenue_by_month = dict(
            Sale.objects
            .filter(sold_at__gte=year_start)
            .annotate(month=TruncMonth("sold_at"))
            .values("month")
            .annotate(revenue=Sum("sale_price"))
            .values_list("month", "revenue")
        )

        cost_by_month = dict(
            Purchase.objects
            .filter(purchased_at__gte=year_start)
            .annotate(month=TruncMonth("purchased_at"))
            .values("month")
            .annotate(cost=Sum("purchase_price"))
            .values_list("month", "cost")
        )

        all_months = set(list(revenue_by_month.keys()) + list(cost_by_month.keys()))
        data = []
        for month in sorted(all_months):
            revenue = float(revenue_by_month.get(month, 0))
            cost = float(cost_by_month.get(month, 0))
            data.append({
                "month": month.strftime("%Y-%m"),
                "profit": revenue - cost,
                "revenue": revenue,
                "cost": cost,
            })
        return Response(data)


class InventoryChartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        in_stock = Product.objects.filter(status="in_stock").count()
        sold = Product.objects.filter(status="sold").count()
        pending_price = Product.objects.filter(status="pending_price").count()
        cancelled = Product.objects.filter(status="cancelled").count()
        return Response([
            {"name": "In Stock", "value": in_stock, "color": "#22c55e"},
            {"name": "Sold", "value": sold, "color": "#3b82f6"},
            {"name": "Pending Price", "value": pending_price, "color": "#f59e0b"},
            {"name": "Cancelled", "value": cancelled, "color": "#ef4444"},
        ])


class TopCategoriesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.products.models import Product
        from django.db.models import Count

        top = (
            Product.objects
            .filter(category__isnull=False)
            .values("category__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        return Response([
            {"name": item["category__name"], "count": item["count"]}
            for item in top
        ])
