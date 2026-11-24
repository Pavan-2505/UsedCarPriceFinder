import csv
import io
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException,File,UploadFile
from pydantic import BaseModel
from loadingdata import splitUrlAndFile,loadDataViaKaggle
router = APIRouter(
    prefix="/uploads",
    tags=["upload"],
)

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True) # what is this

MAX_SIZE = 5 * 1024 * 1024

@router.post("/csv")
async def upload_csv(file : UploadFile = File(...)): # and this
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Only .csv files are allowed")
    
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, "Invalid CSV file")

    file_id = uuid.uuid4().hex

    (UPLOAD_DIR/f"{file_id}.csv").write_bytes(contents)

    return {"file_id" : file_id,"method" : "csv", "original_name":file.filename}

class PathRes(BaseModel):
    path : str

@router.post("/kaggle")
async def load_kaggle(pathData : PathRes):
    print("Recived File Path : ",pathData.path)
    if(not pathData.path.endswith(".csv")):
        raise HTTPException(400, "Only .csv files are allowed")
    splitRes = splitUrlAndFile(pathData.path)
    if(not splitRes["success"]):
        raise HTTPException(400, splitRes["error"])
    pathLoc,file = splitRes["data"]
    fileRes = loadDataViaKaggle(pathLoc,file)
    if(not fileRes["success"]):
        raise HTTPException(400, fileRes["error"])
    
    file_id = uuid.uuid4().hex
    return {"file_id" : file_id,"method" : "kaggle", "original_name":pathData.path}
    