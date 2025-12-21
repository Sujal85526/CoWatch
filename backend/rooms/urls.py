from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import register, login, RoomViewSet

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('', include(router.urls)),
]
