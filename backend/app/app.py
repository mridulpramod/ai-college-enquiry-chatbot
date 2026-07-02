from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List
from models.interpreter import Interpreter
from app.greetings import get_updated_string
from app.spelling_fix import correct_spelling
import uvicorn
import random
import logging
import os
import json
import threading
from datetime import datetime

# =========================
# LOGGING
# =========================

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =========================
# PATH CONFIG
# =========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models", "saved")

model_path = os.path.join(MODEL_DIR, "new_stem.json")

# =========================
# TRAIN STATUS
# =========================

training_status = {
    "is_training": False,
    "progress": 0,
    "message": ""
}

# =========================
# JSON HELPERS
# =========================

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

# =========================
# LOAD MODEL
# =========================

try:
    if not os.path.exists(model_path):
        logger.info("Model not found. Training new model...")
        Interpreter.create_new_interpreter("new_stem")

    __interpreter = Interpreter.load_interpreter("new_stem")
    logger.info("Model loaded successfully")

except Exception as e:
    logger.error(f"Model initialization failed: {e}")
    raise

# =========================
# FASTAPI INIT
# =========================

__app = FastAPI(title="COET AI Assistant")

__app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# UTF RESPONSE
# =========================

def utf_response(data):
    return JSONResponse(
        content=data,
        headers={"Content-Type": "application/json; charset=utf-8"}
    )

# =========================
# CHAT ROUTE
# =========================

@__app.get("/query/{q}")
async def query(q: str):

    try:
        q = correct_spelling(q).lower()
        klass = __interpreter.parse(q)

        logger.info(f"Query: {q} -> Intent: {klass}")

        responses_data = load_json("responses.json")
        related_data = load_json("related.json")

        response = "Sorry, I didn't understand that."
        related_info = []

        for res in responses_data:
            if res["intent"] == klass:
                response = random.choice(res["responses"])

                if klass == "welcomegreeting":
                    response = get_updated_string(response)

                break

        for rel in related_data:
            if rel["intent"] == klass:
                related_info = rel["related"]
                break

        return utf_response({
            "status": 200,
            "message": response,
            "related": related_info
        })

    except Exception as e:
        logger.error(str(e))
        return utf_response({
            "status": 400,
            "message": str(e)
        })

# =========================
# DIRECT INTENT RESPONSE
# =========================

@__app.get("/direct/{klass}")
async def direct(klass: str):

    responses_data = load_json("responses.json")
    related_data = load_json("related.json")

    response = "Sorry, I didn't understand that."
    related_info = []

    for res in responses_data:
        if res["intent"] == klass:
            response = random.choice(res["responses"])
            break

    for rel in related_data:
        if rel["intent"] == klass:
            related_info = rel["related"]
            break

    return utf_response({
        "status": 200,
        "message": response,
        "related": related_info
    })

# =========================
# ADMIN LOGIN
# =========================

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "coet123"

class LoginRequest(BaseModel):
    username: str
    password: str

@__app.post("/admin/login")
async def admin_login(data: LoginRequest):

    if data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
        return {"status": 200}

    raise HTTPException(status_code=401, detail="Invalid credentials")

# =========================
# GET FULL DATA
# =========================

@__app.get("/admin/full-data")
async def get_full_data():

    return {
        "intends": load_json("intends.json"),
        "querys": load_json("querys.json"),
        "responses": load_json("responses.json"),
        "related": load_json("related.json")
    }

# =========================
# ADMISSION FORM SAVE
# =========================

class AdmissionForm(BaseModel):
    name: str
    phone: str
    email: str

@__app.post("/admin/save-admission")
async def save_admission(data: AdmissionForm):

    try:
        file_path = os.path.join(DATA_DIR, "admissions.json")

        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                existing = json.load(f)
        else:
            existing = []

        new_entry = {
            "name": data.name,
            "phone": data.phone,
            "email": data.email,
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        existing.append(new_entry)

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=4, ensure_ascii=False)

        logger.info(f"New admission saved: {data.name}")

        return {"status": 200, "message": "Saved successfully"}

    except Exception as e:
        logger.error(f"Save failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# REQUEST MODELS
# =========================

class FullIntentRequest(BaseModel):
    intent: str
    queries: List[str] = Field(default_factory=list)
    responses: List[str] = Field(default_factory=list)
    related: List[dict] = Field(default_factory=list)

class UpdateIntentRequest(BaseModel):
    intent: str
    queries: List[str] = Field(default_factory=list)
    responses: List[str] = Field(default_factory=list)
    related: List[dict] = Field(default_factory=list)

# =========================
# ADD INTENT
# =========================

@__app.post("/admin/add-intent")
async def add_intent(data: FullIntentRequest):

    intends = load_json("intends.json")
    querys = load_json("querys.json")
    responses_data = load_json("responses.json")
    related_data = load_json("related.json")

    if data.intent in intends:
        raise HTTPException(status_code=400, detail="Intent already exists")

    intends.append(data.intent)

    querys.append({"intent": data.intent, "questions": data.queries})
    responses_data.append({"intent": data.intent, "responses": data.responses})
    related_data.append({"intent": data.intent, "related": data.related})

    save_json("intends.json", intends)
    save_json("querys.json", querys)
    save_json("responses.json", responses_data)
    save_json("related.json", related_data)

    return {"message": "Intent added successfully"}

# =========================
# UPDATE INTENT
# =========================

@__app.post("/admin/update-intent")
async def update_intent(data: UpdateIntentRequest):

    try:
        querys = load_json("querys.json")
        responses_data = load_json("responses.json")
        related_data = load_json("related.json")

        for item in querys:
            if item["intent"] == data.intent:
                item["questions"] = data.queries

        for item in responses_data:
            if item["intent"] == data.intent:
                item["responses"] = data.responses

        for item in related_data:
            if item["intent"] == data.intent:
                item["related"] = data.related

        save_json("querys.json", querys)
        save_json("responses.json", responses_data)
        save_json("related.json", related_data)

        return {"message": "Intent updated successfully"}

    except Exception as e:
        logger.error(f"Update failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# TRAIN MODEL
# =========================

def train_model_background():

    global __interpreter, training_status

    training_status["is_training"] = True
    training_status["progress"] = 10
    training_status["message"] = "Training started..."

    try:
        if os.path.exists(model_path):
            os.remove(model_path)

        Interpreter.create_new_interpreter("new_stem")
        __interpreter = Interpreter.load_interpreter("new_stem")

        training_status["progress"] = 100
        training_status["message"] = "Training completed successfully"

    except Exception as e:
        logger.error(e)
        training_status["progress"] = 0
        training_status["message"] = "Training failed"

    finally:
        training_status["is_training"] = False

# =========================
# RETRAIN
# =========================

@__app.post("/admin/retrain")
async def retrain():

    if training_status["is_training"]:
        return {"message": "Training already running"}

    thread = threading.Thread(target=train_model_background)
    thread.start()

    return {"message": "Training started"}

# =========================
# TRAIN STATUS
# =========================

@__app.get("/admin/training-status")
async def get_training_status():
    return training_status

# =========================
# FALLBACK
# =========================

@__app.get("/{path:path}")
async def not_found(path: str):

    return utf_response({
        "status": 404,
        "message": "Path not found"
    })

# =========================
# RUN
# =========================

def run_app():
    uvicorn.run(__app, host="0.0.0.0", port=8000)