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
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "playback":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "playback_event",
                    "payload": data,
                },
            )
        elif msg_type == "chat":
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat_message",
                    "payload": data,
                },
            )

    async def playback_event(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["payload"]))

