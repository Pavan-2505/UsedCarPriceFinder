import asyncio
import uuid
import datetime

class Reporter:
    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()
        self._pending : dict[str,asyncio.Future] = {}

    async def report(self,type_ : str, **data):
        req_id=data.get("id",None)
        if not req_id:
            req_id = uuid.uuid4().hex
        await self._queue.put({"type" : type_,"id":req_id,"time" : str(datetime.datetime.now()),**data})
    
    def report_threadsade(self,type_ : str, **data):
        self._loop.call_soon_threadsafe(
            self._queue.put_nowait, {"type":type_,**data}
        )

    async def ask(self,agent : int,prompt : str, kind : str="confirmation", options : list | None = None,multivalue : True | False = False ,timeout : float | None = None):
        req_id = uuid.uuid4().hex
        fut = asyncio.get_running_loop().create_future()
        self._pending[req_id] = fut
        await self.report("question",agent=agent, id=req_id,type=kind,prompt=prompt,multivalue=multivalue,options=options)
        try:
            return await asyncio.wait_for(fut,timeout)
        finally:
            self._pending.pop(req_id,None)

    async def answer(self,req_id : str, value) -> bool:
        fut = self._pending.get(req_id)
        if fut and not fut.done():
            fut.set_result(value)
            print(fut)
            return True
        return False

    async def stream(self):
        while True:
            yield await self._queue.get()