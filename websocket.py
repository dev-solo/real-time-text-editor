""" Main server controller """
import asyncio
import datetime
import websockets
import json
from request_handler import RequestHandler
class SimpleWebSocket():
    LISTENERS = set() # Here we store all active connections

    MAIN_TEXT = '' # Storage for text.

    def users_event(self):
        return json.dumps({'action': 'add_user', 'count': len(self.LISTENERS)})

    async def notify_users(self, websocket):
        if self.LISTENERS:       # asyncio.wait doesn't accept an empty list
            message = self.users_event()
            await asyncio.wait([user.send(message) if user != websocket else user.send(json.dumps({'action': 'set_text', 'data': self.MAIN_TEXT})) for user in self.LISTENERS])

    async def register(self, websocket):
        self.LISTENERS.add(websocket)
        await self.notify_users(websocket)

    async def unregister(self, websocket):
        self.LISTENERS.remove(websocket)
        await self.notify_users(websocket)

    async def patching(self, websocket, path):
        await self.register(websocket) # add new client
        try: # listen clients messages
            async for message in websocket:
                handler = RequestHandler(message)
                self.MAIN_TEXT = handler.execute_action(self.MAIN_TEXT)
                # send message to all clients, but exclude sender
                await asyncio.wait([user.send(message) for user in self.LISTENERS if user != websocket])
        finally:
            await self.unregister(websocket) # delete this client
    
    def __init__(self):
        server = websockets.serve(self.patching, 'localhost', 443)
        asyncio.get_event_loop().run_until_complete(server)
        asyncio.get_event_loop().run_forever()
        