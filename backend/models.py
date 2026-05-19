from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from database import Base


class SleepRecord(Base):
    __tablename__ = "sleep_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    bed_time = Column(DateTime, nullable=False)
    wake_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    quality = Column(Integer, nullable=False)  # 1-5
    note = Column(Text, default="")


class SleepTip(Base):
    __tablename__ = "sleep_tips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True)  # 习惯/环境/饮食/运动


class SleepSound(Base):
    __tablename__ = "sleep_sounds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, index=True)  # 雨声/海浪/森林/白噪音
    file_url = Column(String, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
