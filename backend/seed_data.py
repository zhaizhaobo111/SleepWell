from sqlalchemy.orm import Session
from models import SleepTip, SleepSound


TIPS = [
    # 习惯
    {"title": "保持规律作息", "content": "每天在同一时间上床和起床，即使在周末也尽量保持一致。规律的作息能帮助调节生物钟，让你更容易入睡和醒来。", "category": "习惯"},
    {"title": "建立睡前仪式", "content": "睡前30分钟进行固定的放松活动，如阅读、冥想或泡热水澡。这会向身体发出准备睡眠的信号。", "category": "习惯"},
    {"title": "避免午睡过长", "content": "如果需要午睡，控制在20-30分钟以内，且不要在下午3点之后午睡，以免影响夜间睡眠。", "category": "习惯"},
    {"title": "限制床上活动", "content": "床只用于睡觉和亲密关系。不要在床上工作、看电视或玩手机，让大脑将床与睡眠联系起来。", "category": "习惯"},

    # 环境
    {"title": "保持卧室凉爽", "content": "理想的睡眠温度为18-22°C。过热或过冷都会干扰睡眠质量。可以尝试调低空调温度或使用风扇。", "category": "环境"},
    {"title": "营造黑暗环境", "content": "使用遮光窗帘或眼罩阻挡光线。即使是微弱的光线也会抑制褪黑素的分泌，影响入睡。", "category": "环境"},
    {"title": "减少噪音干扰", "content": "使用耳塞、白噪音机或播放自然声音来屏蔽外界噪音。安静的环境有助于深度睡眠。", "category": "环境"},
    {"title": "选择舒适的寝具", "content": "投资一个好的枕头和床垫。支撑性好的寝具能减少身体疼痛，提高睡眠质量。", "category": "环境"},

    # 饮食
    {"title": "避免晚间咖啡因", "content": "下午2点后避免摄入咖啡、茶、可乐等含咖啡因的饮品。咖啡因的半衰期约为5小时，会显著影响入睡。", "category": "饮食"},
    {"title": "不要空腹入睡", "content": "如果饿了，可以吃少量含色氨酸的食物，如香蕉、牛奶或坚果。但避免大餐，消化过程会干扰睡眠。", "category": "饮食"},
    {"title": "限制酒精摄入", "content": "酒精虽然可能帮助入睡，但会破坏后半夜的睡眠结构，减少深度睡眠和REM睡眠。", "category": "饮食"},

    # 运动
    {"title": "规律运动助眠", "content": "每周进行至少150分钟的中等强度运动，如快走、游泳或骑车。运动能提高深度睡眠的比例。", "category": "运动"},
    {"title": "运动时间有讲究", "content": "尽量在睡前3小时完成剧烈运动。运动后体温升高和肾上腺素分泌可能让人难以入睡。", "category": "运动"},
    {"title": "尝试睡前瑜伽", "content": "温和的拉伸和瑜伽可以帮助放松肌肉，减轻身体紧张感，为睡眠做好准备。", "category": "运动"},
]


SOUNDS = [
    # 雨声
    {"name": "雨声", "category": "雨声", "file_url": "rain.ogg", "duration_seconds": 60},
    {"name": "暴风雨", "category": "雨声", "file_url": "storm.ogg", "duration_seconds": 60},
    {"name": "水滴", "category": "雨声", "file_url": "drops.ogg", "duration_seconds": 60},
    {"name": "帐篷雨声", "category": "雨声", "file_url": "rain-on-tent.ogg", "duration_seconds": 60},
    # 海浪
    {"name": "海浪", "category": "海浪", "file_url": "waves.ogg", "duration_seconds": 60},
    {"name": "水下", "category": "海浪", "file_url": "underwater.ogg", "duration_seconds": 60},
    {"name": "溪流", "category": "海浪", "file_url": "stream-water.ogg", "duration_seconds": 60},
    {"name": "瀑布", "category": "海浪", "file_url": "waterfall.ogg", "duration_seconds": 60},
    {"name": "小船", "category": "海浪", "file_url": "boat.ogg", "duration_seconds": 60},
    # 自然
    {"name": "鸟鸣", "category": "自然", "file_url": "birds-tree.ogg", "duration_seconds": 60},
    {"name": "树叶沙沙", "category": "自然", "file_url": "leaves.ogg", "duration_seconds": 60},
    {"name": "夜晚虫鸣", "category": "自然", "file_url": "night.ogg", "duration_seconds": 60},
    {"name": "洞穴滴水", "category": "自然", "file_url": "cave-drops.ogg", "duration_seconds": 60},
    # 风声
    {"name": "风声", "category": "风声", "file_url": "wind.ogg", "duration_seconds": 60},
    {"name": "飞机", "category": "风声", "file_url": "air-plane.ogg", "duration_seconds": 60},
    # 篝火
    {"name": "篝火", "category": "篝火", "file_url": "fire.ogg", "duration_seconds": 60},
    # 城市
    {"name": "咖啡馆", "category": "城市", "file_url": "coffee.ogg", "duration_seconds": 60},
    {"name": "火车", "category": "城市", "file_url": "train.ogg", "duration_seconds": 60},
    {"name": "洗衣机", "category": "城市", "file_url": "washing-machine.ogg", "duration_seconds": 60},
    {"name": "游乐场", "category": "城市", "file_url": "playground.ogg", "duration_seconds": 60},
    # 白噪音
    {"name": "白噪音", "category": "白噪音", "file_url": "white-noise.ogg", "duration_seconds": 60},
    {"name": "粉红噪音", "category": "白噪音", "file_url": "pink-noise.ogg", "duration_seconds": 60},
    {"name": "棕噪音", "category": "白噪音", "file_url": "brown-noise.ogg", "duration_seconds": 60},
]


def seed_db(db: Session):
    if db.query(SleepTip).count() == 0:
        for tip in TIPS:
            db.add(SleepTip(**tip))

    if db.query(SleepSound).count() == 0:
        for sound in SOUNDS:
            db.add(SleepSound(**sound))

    db.commit()
