from django.urls import path
from .views import (
    DashboardSummaryView,
    RevenueChartView,
    ProfitChartView,
    InventoryChartView,
    TopCategoriesView,
)

urlpatterns = [
    path("summary", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("revenue", RevenueChartView.as_view(), name="dashboard-revenue"),
    path("profit", ProfitChartView.as_view(), name="dashboard-profit"),
    path("inventory", InventoryChartView.as_view(), name="dashboard-inventory"),
    path("top-categories", TopCategoriesView.as_view(), name="dashboard-top-categories"),
]
