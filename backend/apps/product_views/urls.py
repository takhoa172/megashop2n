from django.urls import path
from . import views

urlpatterns = [
    path("most-viewed", views.most_viewed, name="most-viewed"),
    path("suggested", views.suggested, name="suggested"),
    path("price-zero", views.price_zero, name="price-zero"),
    path("suggest", views.suggest, name="suggest"),
    path("for-you", views.for_you, name="for-you"),
    path("related/<uuid:product_id>", views.related, name="related"),
]
