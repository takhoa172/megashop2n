from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
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
        today_products = today_sales.count()

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

        month_param = request.query_params.get("month")
        year_param = request.query_params.get("year")

        if month_param and year_param:
            try:
                y = int(year_param)
                m = int(month_param)
                month_start = timezone.make_aware(timezone.datetime(y, m, 1))
                if m == 12:
                    month_end = timezone.make_aware(timezone.datetime(y + 1, 1, 1))
                else:
                    month_end = timezone.make_aware(timezone.datetime(y, m + 1, 1))
                monthly_label = f"Tháng {m}/{y}"
            except (ValueError, TypeError):
                month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                month_end = None
                monthly_label = "Tháng này"
        else:
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = None
            monthly_label = "Tháng này"

        if year_param:
            try:
                y = int(year_param)
                year_start = timezone.make_aware(timezone.datetime(y, 1, 1))
                year_end = timezone.make_aware(timezone.datetime(y + 1, 1, 1))
                yearly_label = f"Năm {y}"
            except (ValueError, TypeError):
                year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                year_end = None
                yearly_label = "Năm nay"
        else:
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            year_end = None
            yearly_label = "Năm nay"

        monthly_sales = Sale.objects.filter(sold_at__gte=month_start)
        if month_end:
            monthly_sales = monthly_sales.filter(sold_at__lt=month_end)
        monthly_revenue = monthly_sales.aggregate(total=Sum("sale_price"))["total"] or 0

        monthly_purchases = Purchase.objects.filter(purchased_at__gte=month_start)
        if month_end:
            monthly_purchases = monthly_purchases.filter(purchased_at__lt=month_end)
        monthly_cost = monthly_purchases.aggregate(total=Sum("purchase_price"))["total"] or 0
        monthly_profit = monthly_revenue - monthly_cost

        yearly_sales = Sale.objects.filter(sold_at__gte=year_start)
        if year_end:
            yearly_sales = yearly_sales.filter(sold_at__lt=year_end)
        yearly_revenue = yearly_sales.aggregate(total=Sum("sale_price"))["total"] or 0

        yearly_purchases = Purchase.objects.filter(purchased_at__gte=year_start)
        if year_end:
            yearly_purchases = yearly_purchases.filter(purchased_at__lt=year_end)
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
                "label": monthly_label,
            },
            "yearly": {
                "revenue": float(yearly_revenue),
                "cost": float(yearly_cost),
                "profit": float(yearly_profit),
                "label": yearly_label,
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
        year_param = request.query_params.get("year")
        now = timezone.now()
        try:
            year = int(year_param) if year_param else now.year
        except (ValueError, TypeError):
            year = now.year
        year_start = timezone.make_aware(timezone.datetime(year, 1, 1))
        year_end = timezone.make_aware(timezone.datetime(year + 1, 1, 1))
        revenue_by_month = (
            Sale.objects
            .filter(sold_at__gte=year_start, sold_at__lt=year_end)
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
        year_param = request.query_params.get("year")
        now = timezone.now()
        try:
            year = int(year_param) if year_param else now.year
        except (ValueError, TypeError):
            year = now.year
        year_start = timezone.make_aware(timezone.datetime(year, 1, 1))
        year_end = timezone.make_aware(timezone.datetime(year + 1, 1, 1))

        revenue_by_month = dict(
            Sale.objects
            .filter(sold_at__gte=year_start, sold_at__lt=year_end)
            .annotate(month=TruncMonth("sold_at"))
            .values("month")
            .annotate(revenue=Sum("sale_price"))
            .values_list("month", "revenue")
        )

        cost_by_month = dict(
            Purchase.objects
            .filter(purchased_at__gte=year_start, purchased_at__lt=year_end)
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
