from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import SleepSound
from schemas import SleepSoundOut

router = APIRouter(prefix="/api/sounds", tags=["sounds"])


@router.get("/", response_model=list[SleepSoundOut])
def get_sounds(
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(SleepSound)
    if category:
        query = query.filter(SleepSound.category == category)
    return query.all()
