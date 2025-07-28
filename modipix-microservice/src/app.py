from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from src.config.env_config import ALLOWED_ORIGIN
from src.controller.moderation_controller import moderate_image
import os, shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGIN,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/moderate")
async def moderate_image_route(image: UploadFile = File(...)):
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = f"{temp_dir}/{image.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    result = moderate_image(temp_path)
    return JSONResponse(content=result)
