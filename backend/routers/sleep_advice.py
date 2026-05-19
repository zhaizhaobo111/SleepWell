from fastapi import APIRouter, Query, HTTPException
from services.weather import get_weather
from services.advice import generate_sleep_advice

router = APIRouter(prefix="/api/sleep-advice", tags=["sleep-advice"])


@router.get("/")
async def get_sleep_advice(
    lat: float = Query(..., description="纬度"),
    lon: float = Query(..., description="经度"),
):
    try:
        weather = await get_weather(lat, lon)
        advice = generate_sleep_advice(weather)
        return advice
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取天气数据失败: {str(e)}")
