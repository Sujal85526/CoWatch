from django.shortcuts import render

from rest_framework import status, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer, LoginSerializer, RoomSerializer
from .models import Room

import secrets
import string

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': {'id': user.id, 'username': user.username}
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        token, _ = Token.objects.get_or_create(user=serializer.validated_data['user'])
        return Response({
            'token': token.key,
            'user': {
                'id': serializer.validated_data['user'].id,
                'username': serializer.validated_data['user'].username
            }
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def generate_invite_code(length=8):
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if self.action == "list":
            return Room.objects.filter(owner=user)
        if self.action == "retrieve":
            return Room.objects.all()
        return Room.objects.filter(owner=user)

    def perform_create(self, serializer):
        code = generate_invite_code()
        serializer.save(owner=self.request.user, invite_code=code)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_room_by_code(request):
    code = request.data.get('invite_code')
    if not code:
        return Response({"detail": "invite_code is required."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        room = Room.objects.get(invite_code=code)
    except Room.DoesNotExist:
        return Response({"detail": "Room not found."},
                        status=status.HTTP_404_NOT_FOUND)

    serializer = RoomSerializer(room)
    return Response(serializer.data, status=status.HTTP_200_OK)
