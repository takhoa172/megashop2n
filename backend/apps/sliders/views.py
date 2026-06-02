from rest_framework import viewsets
from .models import Slider
from .serializers import SliderSerializer
from core.permissions import IsAdminOrReadOnly


class SliderViewSet(viewsets.ModelViewSet):
    queryset = Slider.objects.all()
    serializer_class = SliderSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.method == "GET" and not self.request.query_params.get("all"):
            qs = qs.filter(is_active=True)
        return qs
