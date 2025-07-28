import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", 8000))

ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGINS", "*").split(",")
