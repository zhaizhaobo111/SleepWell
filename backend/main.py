import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, SessionLocal, Base
from models import SleepRecord, SleepTip, SleepSound  # noqa: F401
from seed_data import seed_db
from routers import sleep_records, sleep_tips, sleep_sounds, sleep_advice, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_db(db)
    db.close()
    # 异步生成助眠故事（不阻塞启动）
    import asyncio
    from services.ai import seed_stories
    async def _seed():
        d = SessionLocal()
        try:
            await seed_stories(d)
        finally:
            d.close()
    asyncio.create_task(_seed())
    yield


app = FastAPI(title="SleepWell API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sleep_records.router)
app.include_router(sleep_tips.router)
app.include_router(sleep_sounds.router)
app.include_router(sleep_advice.router)
app.include_router(ai.router)


sounds_dir = os.path.join(os.path.dirname(__file__), "sounds")
if os.path.isdir(sounds_dir):
    app.mount("/sounds", StaticFiles(directory=sounds_dir), name="sounds")


@app.get("/")
def root():
    return {"message": "SleepWell API is running"}
