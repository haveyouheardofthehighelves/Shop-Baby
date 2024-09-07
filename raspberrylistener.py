import asyncio
import websockets
import ssl
import json

async def monitor_websocket(uri):
    ssl_context = ssl._create_unverified_context()
    async with websockets.connect(uri, ssl=ssl_context) as websocket:
        try:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                if data['type'] == 'keypress':
                    print(f"key press {data['data']}")
                if data['type'] == 'keyrelease':
                    print(f"key release {data['data']}")                
        except websockets.ConnectionClosed:
            print("Connection closed")

# Replace 'wss://example.com/websocket' with your WebSocket URL
uri = "wss://10.0.0.102:3013"

# Start monitoring the WebSocket
asyncio.get_event_loop().run_until_complete(monitor_websocket(uri))