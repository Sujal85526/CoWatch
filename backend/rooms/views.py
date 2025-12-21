from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework import viewsets, permissions
from .models import Room
from .serializers import RoomSerializer
import secrets, string

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

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        # All actions restricted to owner
        return Room.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        code = generate_invite_code()
        serializer.save(owner=self.request.user, invite_code=code)