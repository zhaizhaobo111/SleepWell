import random
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models import SleepTip
from schemas import SleepTipOut

router = APIRouter(prefix="/api/tips", tags=["tips"])


@router.get("/", response_model=list[SleepTipOut])
def get_tips(
    category: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(SleepTip)
    if category:
        query = query.filter(SleepTip.category == category)
    return query.all()


@router.get("/random", response_model=SleepTipOut)
def get_random_tip(db: Session = Depends(get_db)):
    tips = db.query(SleepTip).all()
    if not tips:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="No tips available")
    return random.choice(tips)
