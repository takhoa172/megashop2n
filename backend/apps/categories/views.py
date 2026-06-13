from rest_framework import viewsets
from .models import Category
from .serializers import CategorySerializer
from core.permissions import IsAdminOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = "id"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        show_hidden = self.request.query_params.get("show_hidden") == "1"
        if self.action in ["list", "retrieve"] and not show_hidden:
            if not (user.is_authenticated and user.role in ["SUPER_ADMIN", "MANAGER", "STAFF"]):
                qs = qs.filter(is_visible=True)
        return qs
