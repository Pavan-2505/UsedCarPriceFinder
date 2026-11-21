import csv
import io
import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException,File,UploadFile

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

    return {"file_id" : file_id, "original_name":file.filename}