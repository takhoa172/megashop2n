from django.urls import path
from . import views

urlpatterns = [
    path("most-viewed", views.most_viewed, name="most-viewed"),
    path("suggested", views.suggested, name="suggested"),
    path("price-zero", views.price_zero, name="price-zero"),
]
