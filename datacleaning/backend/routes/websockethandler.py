from fastapi import APIRouter,WebSocket,WebSocketDisconnect

router = APIRouter()

@router.websocket("/websocket")
async def websocket_endpoint(websocket : WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"text": "connection successfull"})
    except WebSocketDisconnect:
        print("Client disconnected")