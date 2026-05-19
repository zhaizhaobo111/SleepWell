from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import SleepRecord
from schemas import SleepRecordCreate, SleepRecordOut, SleepStats

router = APIRouter(prefix="/api/records", tags=["records"])


@router.post("/", response_model=SleepRecordOut)
def create_record(record: SleepRecordCreate, db: Session = Depends(get_db)):
    duration = int((record.wake_time - record.bed_time).total_seconds() / 60)
    if duration < 0:
        duration += 24 * 60  # 跨天处理

    db_record = SleepRecord(
        date=record.date,
        bed_time=record.bed_time,
        wake_time=record.wake_time,
        duration_minutes=duration,
        quality=record.quality,
        note=record.note,
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.get("/", response_model=list[SleepRecordOut])
def get_records(
    start_date: date | None = Query(None),
    end_date: date | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(SleepRecord)
    if start_date:
        query = query.filter(SleepRecord.date >= start_date)
    if end_date:
        query = query.filter(SleepRecord.date <= end_date)
    return query.order_by(SleepRecord.date.desc()).all()


@router.get("/stats", response_model=SleepStats)
def get_stats(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    since = date.today() - timedelta(days=days)
    records = db.query(SleepRecord).filter(SleepRecord.date >= since).all()

    if not records:
        return SleepStats(
            total_records=0,
            avg_duration_minutes=0,
            avg_quality=0,
            best_duration_minutes=0,
            worst_duration_minutes=0,
            weekly_trend=[],
        )

    durations = [r.duration_minutes for r in records]
    qualities = [r.quality for r in records]

    weekly_trend = [
        {"date": str(r.date), "duration_minutes": r.duration_minutes, "quality": r.quality}
        for r in sorted(records, key=lambda x: x.date)
    ]

    return SleepStats(
        total_records=len(records),
        avg_duration_minutes=round(sum(durations) / len(durations), 1),
        avg_quality=round(sum(qualities) / len(qualities), 1),
        best_duration_minutes=max(durations),
        worst_duration_minutes=min(durations),
        weekly_trend=weekly_trend,
    )


@router.get("/{record_id}", response_model=SleepRecordOut)
def get_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(SleepRecord).filter(SleepRecord.id == record_id).first()
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.delete("/{record_id}")
def delete_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(SleepRecord).filter(SleepRecord.id == record_id).first()
    if not record:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"detail": "Deleted"}
