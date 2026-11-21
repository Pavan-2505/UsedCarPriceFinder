# Making env : python -m venv .venv
#Activating : .venv\Scripts\activate.bat
#RUn : fastapi dev main.py
from loadingdata import *
from reporter import Reporter
from fastapi import FastAPI
from routes import loaddataset
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loaddataset.router)

