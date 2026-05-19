from datetime import date, datetime
from pydantic import BaseModel, Field


# --- Sleep Records ---

class SleepRecordCreate(BaseModel):
    date: date
    bed_time: datetime
    wake_time: datetime
    quality: int = Field(ge=1, le=5)
    note: str = ""


class SleepRecordOut(BaseModel):
    id: int
    date: date
    bed_time: datetime
    wake_time: datetime
    duration_minutes: int
    quality: int
    note: str

    model_config = {"from_attributes": True}


# --- Sleep Stats ---

class SleepStats(BaseModel):
    total_records: int
    avg_duration_minutes: float
    avg_quality: float
    best_duration_minutes: int
    worst_duration_minutes: int
    weekly_trend: list[dict]  # [{date, duration_minutes, quality}, ...]


# --- Sleep Tips ---

class SleepTipOut(BaseModel):
    id: int
    title: str
    content: str
    category: str

    model_config = {"from_attributes": True}


# --- Sleep Sounds ---

class SleepSoundOut(BaseModel):
    id: int
    name: str
    category: str
    file_url: str
    duration_seconds: int

    model_config = {"from_attributes": True}
