import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from dotenv import load_dotenv
import os
from google import genai
from google.genai import types

load_dotenv()
FRONTEND_URL = os.environ.get("FRONTEND_URL")
# requires GEMINI_API_KEY environment variable to be set in .env
client = genai.Client()

app = FastAPI()

# allowed origins
origins = [
    "http://localhost:5173",    # local port
    "http://127.0.0.1:5173",
]

if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResponseData(BaseModel):
    response: str | None

@app.post("/api/questions")
async def generate_questions(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    response = client.models.generate_content(
        model='gemini-3.5-flash-lite',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg',
            ),
            "Using the information provided in this study sheet, generate proper review questions that can be used for studying (multiple choice) and output the results as JSON. Make sure the key values are 'question', 'options', and 'answer'. The 'options' value should be an array of strings, and the 'answer' value should be a string that is exactly one of the options."
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return ResponseData(response=response.text)
    
@app.post("/api/summary")
async def generate_summary(file: UploadFile = File(...)):
    image_bytes = await file.read()

    response = client.models.generate_content(
        model='gemini-3.5-flash-lite',
        contents=[
            types.Part.from_bytes(
                data=image_bytes,
                mime_type='image/jpeg',
            ),
            "Using the information provided in this study sheet, generate a proper summary that can be used for studying and output the results as JSON."
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return ResponseData(response=response.text)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)