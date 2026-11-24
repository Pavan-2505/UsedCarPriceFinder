from fastapi import APIRouter,WebSocket,WebSocketDisconnect
import datetime
from reporter import Reporter
import asyncio
from fastapi.encoders import jsonable_encoder
from datacleaning import cleaner
import traceback

router = APIRouter()

OPERATIONS = {
    "main" : cleaner
}

@router.websocket("/websocket")
async def websocket_endpoint(websocket : WebSocket):
    await websocket.accept()
    reporter = Reporter()
    tasks: dict[str, asyncio.Task] = {}
    async def sender():
        async for out in reporter.stream():
            await websocket.send_json(jsonable_encoder(out))

    async def runner(run_id,op,params):
        try:
            result = await OPERATIONS[op](reporter,params)
            await reporter.report("done", run_id=run_id ,result=result)
        except asyncio.CancelledError:
            await reporter.report("cancelled", run_id=run_id)
        except Exception as e:
            tb = traceback.format_exc()  
            print("Error : ",e,tb)
            await reporter.report("error", run_id=run_id,message=str(e))
        finally:
            tasks.pop(run_id,None)
    
    send_task = asyncio.create_task(sender())
    try:
        while True:
            msg = await websocket.receive_json()
            kind = msg.get("type")

            if kind == "start":
                run_id = msg["run_id"]
                print("Work : ",msg)
                tasks[run_id] = asyncio.create_task(
                    runner(run_id,msg["op"], msg.get("params", {}))
                )
            elif kind == "answer":
                await reporter.answer(msg["id"],msg["value"])

            if kind == "cancel":
                if t:= tasks.get(msg["run_id"]):
                    t.cancel()
    except WebSocketDisconnect:
        pass
    finally:
        print("Client disconnected")
        for t in tasks.values():
            t.cancel()
        send_task.cancel()