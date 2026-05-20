from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from services import ai

router = APIRouter(prefix="/api/ai", tags=["ai"])


class AnalyzeRequest(BaseModel):
    records: list[dict]


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[dict]] = None
    sleep_context: Optional[str] = None


class MeditationRequest(BaseModel):
    theme: Optional[str] = "通用助眠"


class StoryRequest(BaseModel):
    theme: Optional[str] = None


@router.post("/analyze")
async def analyze_sleep(req: AnalyzeRequest):
    try:
        result = await ai.analyze_sleep(req.records)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        reply = await ai.chat_with_assistant(req.message, req.history, req.sleep_context or "")
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meditation")
async def meditation(req: MeditationRequest):
    try:
        text = await ai.generate_meditation_text(req.theme or "通用助眠")
        audio_url = await ai.generate_meditation_audio(text)
        return {"text": text, "audio_url": audio_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meditation/text")
async def meditation_text(theme: str = "通用助眠"):
    try:
        text = await ai.generate_meditation_text(theme)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/story/themes")
async def story_themes():
    return {"themes": ai.STORY_THEMES}


@router.post("/story")
async def create_story(req: StoryRequest):
    import random
    from database import SessionLocal
    try:
        theme = req.theme or random.choice(ai.STORY_THEMES)
        db = SessionLocal()
        result = await ai.generate_and_save_story(theme, db)
        db.close()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
