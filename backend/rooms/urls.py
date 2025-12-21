from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import register, login, RoomViewSet, join_room_by_code

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('rooms/join/', join_room_by_code, name='join-room-by-code'),
    path('', include(router.urls)),
]
