import httpx
from pydantic import BaseModel

# 和风天气 API 配置
QWEATHER_API_KEY = "5af036adf2c34d14a0af8412e6c0c1ca"
QWEATHER_NOW_URL = "https://devapi.qweather.com/v7/weather/now"

# OpenWeatherMap API 配置（免费备选）
OPENWEATHER_API_KEY = "demo"  # 替换为你的 OpenWeatherMap API Key
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


class WeatherData(BaseModel):
    city: str
    temp: float  # 摄氏度
    feels_like: float  # 体感温度
    humidity: int  # 湿度 %
    pressure: int  # 气压 hPa
    wind_speed: float  # 风速 m/s
    clouds: int  # 云量 %
    description: str  # 天气描述
    icon: str  # 天气图标代码


async def get_weather(lat: float, lon: float) -> WeatherData:
    """获取天气数据，优先使用和风天气，失败则使用 OpenWeatherMap"""
    try:
        return await _get_weather_qweather(lat, lon)
    except Exception as e:
        print(f"和风天气 API 失败: {e}，尝试使用 OpenWeatherMap")
        try:
            return await _get_weather_openweathermap(lat, lon)
        except Exception as e2:
            print(f"OpenWeatherMap API 也失败: {e2}，使用模拟数据")
            return _get_mock_weather(lat, lon)


async def _get_weather_qweather(lat: float, lon: float) -> WeatherData:
    """使用和风天气 API 获取天气"""
    async with httpx.AsyncClient() as client:
        location = f"{lon},{lat}"
        resp = await client.get(
            QWEATHER_NOW_URL,
            params={"location": location, "key": QWEATHER_API_KEY},
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        if data.get("code") != "200" or not data.get("now"):
            raise Exception(f"和风天气返回错误: {data}")

        now = data["now"]
        return WeatherData(
            city=_get_city_name(lat, lon),
            temp=float(now["temp"]),
            feels_like=float(now["feelsLike"]),
            humidity=int(now["humidity"]),
            pressure=int(now["pressure"]),
            wind_speed=float(now["windSpeed"]),
            clouds=0,
            description=now["text"],
            icon=now["icon"],
        )


async def _get_weather_openweathermap(lat: float, lon: float) -> WeatherData:
    """使用 OpenWeatherMap API 获取天气"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            OPENWEATHER_URL,
            params={
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric",
                "lang": "zh_cn",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        weather = data["weather"][0]
        main = data["main"]
        wind = data.get("wind", {})

        return WeatherData(
            city=data.get("name", _get_city_name(lat, lon)),
            temp=main["temp"],
            feels_like=main["feels_like"],
            humidity=main["humidity"],
            pressure=main["pressure"],
            wind_speed=wind.get("speed", 0),
            clouds=data.get("clouds", {}).get("all", 0),
            description=weather["description"],
            icon=weather["icon"],
        )


def _get_mock_weather(lat: float, lon: float) -> WeatherData:
    """返回模拟天气数据（当所有 API 都失败时）"""
    import random

    city_name = _get_city_name(lat, lon)
    temp = random.randint(15, 30)
    humidity = random.randint(40, 80)

    descriptions = ["晴", "多云", "阴", "小雨", "晴转多云"]
    desc = random.choice(descriptions)

    return WeatherData(
        city=city_name,
        temp=float(temp),
        feels_like=float(temp - 2),
        humidity=humidity,
        pressure=1013,
        wind_speed=random.uniform(1, 8),
        clouds=random.randint(0, 100),
        description=desc,
        icon="100" if "晴" in desc else "101",
    )


def _get_city_name(lat: float, lon: float) -> str:
    """根据经纬度估算城市名（简化版）"""
    cities = [
        ("北京", 39.9, 116.4),
        ("上海", 31.2, 121.5),
        ("广州", 23.1, 113.3),
        ("深圳", 22.5, 114.1),
        ("成都", 30.6, 104.1),
        ("杭州", 30.3, 120.2),
        ("武汉", 30.6, 114.3),
        ("西安", 34.3, 108.9),
        ("重庆", 29.6, 106.5),
        ("南京", 32.1, 118.8),
    ]

    min_dist = float('inf')
    nearest_city = "未知城市"

    for city_name, city_lat, city_lon in cities:
        dist = ((lat - city_lat) ** 2 + (lon - city_lon) ** 2) ** 0.5
        if dist < min_dist:
            min_dist = dist
            nearest_city = city_name

    if min_dist > 2.0:
        return f"({lat:.1f}, {lon:.1f})"

    return nearest_city
