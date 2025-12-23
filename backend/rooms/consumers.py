import json
from channels.generic.websocket import AsyncWebsocketConsumer

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"room_{self.room_id}"

        # Join room group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        # Example expected shape:
        # { "type": "playback", "action": "PLAY", "time": 120.5 }
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "room_message",
                "payload": data,
            },
        )

    async def room_message(self, event):
        # Send to WebSocket
        await self.send(text_data=json.dumps(event["payload"]))
