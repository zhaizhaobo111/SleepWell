import os
import uuid
import httpx
import edge_tts

QWEN_API_KEY = "sk-3b066661f42f49c9971861631950c710"
QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
QWEN_MODEL = "qwen-turbo"

MEDITATION_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sounds", "meditation")
STORIES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sounds", "stories")
os.makedirs(MEDITATION_DIR, exist_ok=True)
os.makedirs(STORIES_DIR, exist_ok=True)


async def call_qwen(prompt: str, system: str = "", temperature: float = 0.7) -> str:
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            QWEN_BASE_URL,
            headers={
                "Authorization": f"Bearer {QWEN_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": QWEN_MODEL,
                "messages": messages,
                "temperature": temperature,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def analyze_sleep(records: list[dict]) -> dict:
    if not records:
        return {"analysis": "暂无睡眠数据，请先记录几晚睡眠。", "suggestions": []}

    total_dur = sum(r["duration_minutes"] for r in records)
    total_qual = sum(r["quality"] for r in records)
    avg_dur = total_dur / len(records)
    avg_qual = total_qual / len(records)

    summary = f"共{len(records)}条记录，平均时长{avg_dur:.0f}分钟({avg_dur/60:.1f}小时)，平均质量{avg_qual:.1f}/5。"
    recent = "\n".join(
        f"- {r['date']}: {r['duration_minutes']}分钟, 质量{r['quality']}/5"
        for r in records[:7]
    )

    prompt = f"""你是专业睡眠健康顾问。根据以下用户睡眠数据，给出专业分析和改善建议。

【数据概要】{summary}

【最近记录】
{recent}

要求：
1. 用2-3句话分析睡眠状况（问题在哪、是否健康）
2. 给出3-5条具体可执行的改善建议
3. 语气温暖鼓励，不要说教
4. 用中文回答"""

    result = await call_qwen(prompt, temperature=0.5)
    return {"analysis": result, "record_count": len(records), "avg_duration": round(avg_dur), "avg_quality": round(avg_qual, 1)}


async def chat_with_assistant(message: str, history: list[dict] | None = None, sleep_context: str = "") -> str:
    system = """你是 SleepWell 睡眠助手，专门帮助用户解决睡眠问题。
- 只回答睡眠、健康、放松相关的话题
- 回答简洁温暖，100字以内
- 如果用户问非睡眠话题，友好地引导回睡眠主题
- 用中文回答"""

    if sleep_context:
        system += f"\n\n用户近期睡眠数据：{sleep_context}"

    messages = [{"role": "system", "content": system}]
    if history:
        messages.extend(history[-6:])
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            QWEN_BASE_URL,
            headers={
                "Authorization": f"Bearer {QWEN_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": QWEN_MODEL,
                "messages": messages,
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def generate_meditation_text(theme: str = "通用助眠") -> str:
    prompt = f"""生成一段60秒的睡前冥想引导词。
主题：{theme}
要求：
- 温柔舒缓的语气，适合失眠或压力大的人
- 包含呼吸指导和身体放松暗示
- 纯文本，不要标题和格式
- 150字左右
- 用中文"""

    return await call_qwen(prompt, temperature=0.8)


async def generate_meditation_audio(text: str) -> str:
    filename = f"meditation_{uuid.uuid4().hex[:8]}.mp3"
    filepath = os.path.join(MEDITATION_DIR, filename)

    communicate = edge_tts.Communicate(text, "zh-CN-XiaoyiNeural", rate="-20%")
    await communicate.save(filepath)

    return f"meditation/{filename}"


# ===================== 助眠故事 =====================

STORY_THEMES = [
    "月光森林奇遇",
    "海边小镇的夜晚",
    "云端小火车",
    "星星的摇篮曲",
    "小熊的冬眠日记",
    "萤火虫的花园",
    "雨后的彩虹桥",
    "蒲公英的旅行",
]


async def generate_sleep_story(theme: str) -> str:
    prompt = f"""你是一位温柔的睡前故事讲述者。请为成年人写一篇助眠小故事。

主题：{theme}

要求：
- 500-800字，适合睡前聆听
- 语调温柔舒缓，像在耳边轻声细语
- 画面感强，多用感官描写（月光、微风、花香等）
- 节奏缓慢，有自然的停顿感
- 结尾温暖安宁，引导进入梦乡
- 纯叙事文本，不要标题、段落标题或格式符号
- 用中文"""

    return await call_qwen(prompt, temperature=0.9)


async def generate_story_audio(text: str, voice: str = "zh-CN-YunxiNeural") -> tuple[str, int]:
    filename = f"story_{uuid.uuid4().hex[:8]}.mp3"
    filepath = os.path.join(STORIES_DIR, filename)

    communicate = edge_tts.Communicate(text, voice, rate="-15%")
    await communicate.save(filepath)

    size = os.path.getsize(filepath)
    duration = max(60, size // 16000)

    return f"stories/{filename}", duration


async def generate_and_save_story(theme: str, db) -> dict:
    from models import SleepSound

    text = await generate_sleep_story(theme)
    audio_url, duration = await generate_story_audio(text)

    story = SleepSound(
        name=theme,
        category="故事",
        file_url=audio_url,
        duration_seconds=duration,
    )
    db.add(story)
    db.commit()
    db.refresh(story)

    return {"id": story.id, "name": story.name, "audio_url": audio_url, "duration_seconds": duration}


async def seed_stories(db):
    from models import SleepSound

    existing = db.query(SleepSound).filter(SleepSound.category == "故事").count()
    if existing >= 5:
        return

    for theme in STORY_THEMES[:5]:
        try:
            text = await generate_sleep_story(theme)
            audio_url, duration = await generate_story_audio(text)
            db.add(SleepSound(
                name=theme,
                category="故事",
                file_url=audio_url,
                duration_seconds=duration,
            ))
        except Exception as e:
            print(f"Failed to generate story '{theme}': {e}")

    db.commit()
