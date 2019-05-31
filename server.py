""" Server init """
from websocket import SimpleWebSocket

if __name__ == '__main__':
    print('Server start on: ws://localhost:443/ to stop just close shell')
    SimpleWebSocket()
