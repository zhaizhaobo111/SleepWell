from services.weather import WeatherData


def generate_sleep_advice(weather: WeatherData) -> dict:
    """根据天气和环境数据生成睡眠建议"""
    tips = []

    # 温度建议
    if weather.feels_like >= 30:
        tips.append({
            "icon": "🌡️",
            "title": "高温预警",
            "content": f"当前体感温度 {weather.feels_like}°C，建议将空调调至22-24°C，使用轻薄透气的床品。"
        })
    elif weather.feels_like >= 26:
        tips.append({
            "icon": "🌡️",
            "title": "偏暖天气",
            "content": f"体感温度 {weather.feels_like}°C，建议适当降温，可开窗通风或使用风扇。"
        })
    elif weather.feels_like <= 5:
        tips.append({
            "icon": "❄️",
            "title": "寒冷天气",
            "content": f"体感温度 {weather.feels_like}°C，注意保暖，可使用电热毯预热床铺。"
        })
    elif weather.feels_like <= 10:
        tips.append({
            "icon": "🥶",
            "title": "偏冷天气",
            "content": f"体感温度 {weather.feels_like}°C，建议多盖一层被子，睡前泡脚助眠。"
        })
    else:
        tips.append({
            "icon": "✅",
            "title": "温度适宜",
            "content": f"体感温度 {weather.feels_like}°C，非常适合睡眠，保持当前室温即可。"
        })

    # 湿度建议
    if weather.humidity >= 80:
        tips.append({
            "icon": "💧",
            "title": "湿度偏高",
            "content": f"当前湿度 {weather.humidity}%，建议使用除湿器或空调除湿模式，保持卧室干爽。"
        })
    elif weather.humidity <= 30:
        tips.append({
            "icon": "🏜️",
            "title": "空气干燥",
            "content": f"当前湿度 {weather.humidity}%，建议使用加湿器，床头放一杯水，注意补充水分。"
        })
    else:
        tips.append({
            "icon": "✅",
            "title": "湿度适宜",
            "content": f"当前湿度 {weather.humidity}%，湿度适中，有利于深度睡眠。"
        })

    # 风力建议
    if weather.wind_speed >= 10:
        tips.append({
            "icon": "💨",
            "title": "大风天气",
            "content": f"风速 {weather.wind_speed}m/s，建议关好门窗减少噪音，可播放风声音频掩盖外界噪声。"
        })
    elif weather.wind_speed >= 5:
        tips.append({
            "icon": "🍃",
            "title": "有风天气",
            "content": f"风速 {weather.wind_speed}m/s，可微开窗户保持空气流通，注意不要直吹头部。"
        })

    # 气压建议
    if weather.pressure <= 1000:
        tips.append({
            "icon": "📉",
            "title": "低气压",
            "content": f"气压 {weather.pressure}hPa，低气压可能导致睡眠质量下降，建议早睡并放松心情。"
        })
    elif weather.pressure >= 1030:
        tips.append({
            "icon": "📈",
            "title": "高气压",
            "content": f"气压 {weather.pressure}hPa，高气压天气通常有利于睡眠，可适当增加户外活动。"
        })

    # 天气类型建议
    desc = weather.description
    if "雨" in desc:
        tips.append({
            "icon": "🌧️",
            "title": "雨天助眠",
            "content": "雨天是天然的白噪音，推荐播放「雨声」或「帐篷雨声」音频助眠。"
        })
    elif "雷" in desc:
        tips.append({
            "icon": "⛈️",
            "title": "雷雨天气",
            "content": "雷雨天气可能影响睡眠，建议播放「暴风雨」音频，将外界雷声融入背景音。"
        })
    elif "雪" in desc:
        tips.append({
            "icon": "❄️",
            "title": "雪天",
            "content": "雪天环境安静，适合深度睡眠，注意保暖即可。"
        })
    elif "雾" in desc or "霾" in desc:
        tips.append({
            "icon": "🌫️",
            "title": "雾霾天气",
            "content": "空气质量不佳，建议关闭窗户，使用空气净化器，避免开窗入睡。"
        })
    elif "晴" in desc:
        if weather.clouds <= 20:
            tips.append({
                "icon": "🌙",
                "title": "晴朗夜晚",
                "content": "天气晴好，可拉好窗帘避免月光干扰，享受安静的夜晚。"
            })

    # 云量建议
    if weather.clouds >= 80 and "雨" not in desc and "雪" not in desc:
        tips.append({
            "icon": "☁️",
            "title": "多云天气",
            "content": "云层较厚，光线较暗，适合睡眠，白天注意补充光照。"
        })

    # 生成推荐音频
    recommended_sounds = _recommend_sounds(weather)

    return {
        "city": weather.city,
        "weather": {
            "temp": weather.temp,
            "feels_like": weather.feels_like,
            "humidity": weather.humidity,
            "pressure": weather.pressure,
            "wind_speed": weather.wind_speed,
            "description": weather.description,
            "icon": weather.icon,
        },
        "tips": tips,
        "recommended_sounds": recommended_sounds,
    }


def _recommend_sounds(weather: WeatherData) -> list[str]:
    """根据天气推荐音频"""
    sounds = []
    desc = weather.description

    if "雨" in desc or "雷" in desc:
        sounds.extend(["雨声", "暴风雨", "帐篷雨声"])
    elif weather.wind_speed >= 5:
        sounds.extend(["风声", "树叶沙沙"])
    elif weather.feels_like >= 26:
        sounds.extend(["溪流", "瀑布", "海浪"])
    elif "雪" in desc or weather.feels_like <= 5:
        sounds.extend(["篝火", "雨声"])
    else:
        sounds.extend(["夜晚虫鸣", "鸟鸣"])

    # 始终推荐白噪音作为备选
    sounds.append("白噪音")

    return sounds[:3]
