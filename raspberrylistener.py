import asyncio
import websockets
import ssl
import json
import serial

port = "COM7"
ser = serial.Serial(port, 9600, timeout=1)

def writetoarduino(writeall):
    arr = bytes(writeall, 'utf-8')
    ser.write(arr)

async def monitor_websocket(uri):
    ssl_context = ssl._create_unverified_context()
    async with websockets.connect(uri, ssl=ssl_context) as websocket:
        try:
            while True:
                print(ser.read_all())
                message = await websocket.recv()
                data = json.loads(message)
                if data['type'] == 'keypress':
                    print(f"key press {data['data']}")
                if data['type'] == 'keyrelease':
                    print(f"key release {data['data']}")     
                if data['type'] == 'servo_coordinate':
                    #print(f"servo mapped angle ({data['data']['x']}, {data['data']['y']})")     
                    writetoarduino(f'{round(data["data"]["x"])}@')
                    writetoarduino(f'{round(data["data"]["y"])}!')
        except websockets.ConnectionClosed:
            print("Connection closed")

# Replace 'wss://example.com/websocket' with your WebSocket URL
uri = "wss://10.0.0.102:3013"

# Start monitoring the WebSocket
asyncio.get_event_loop().run_until_complete(monitor_websocket(uri))