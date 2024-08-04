import asyncio
import websockets
import ssl

async def monitor_websocket(uri):
    ssl_context = ssl._create_unverified_context()
    async with websockets.connect(uri, ssl=ssl_context) as websocket:
        try:
            while True:
                message = await websocket.recv()
                print(f"Received message: {message}")
        except websockets.ConnectionClosed:
            print("Connection closed")

# Replace 'wss://example.com/websocket' with your WebSocket URL
uri = "wss://192.168.0.77:8080"

# Start monitoring the WebSocket
asyncio.get_event_loop().run_until_complete(monitor_websocket(uri))
