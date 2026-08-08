import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import base64
from google import genai
from google.genai import types

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
)

class ResponseData(BaseModel):
    response: str | None

# requires GEMINI_API_KEY environment variable to be set in .env
client = genai.Client()

@app.post("/api/questions")
def generate_questions():
    with open("sample.jpg", "rb") as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=base64.b64decode(image_base64),
                mime_type='image/jpeg',
            ),
            "Using the information provided in this study sheet, generate proper review questions that can be used for studying (multiple choice) and output the results as JSON."
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    return ResponseData(response=response.text)
    
@app.post("/api/summary")
def generate_summary():
    with open("sample.jpg", "rb") as image_file:
        image_base64 = base64.b64encode(image_file.read()).decode("utf-8")

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            types.Part.from_bytes(
                data=base64.b64decode(image_base64),
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
    uvicorn.run(app, host="127.0.0.1", port=8000)