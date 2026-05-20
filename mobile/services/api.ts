import axios from "axios";

const API_BASE = "http://10.10.80.40:8000/api"; // 真机 Expo Go 用电脑局域网 IP

const api = axios.create({ baseURL: API_BASE });

// --- Types ---

export interface SleepRecord {
  id: number;
  date: string;
  bed_time: string;
  wake_time: string;
  duration_minutes: number;
  quality: number;
  note: string;
}

export interface SleepStats {
  total_records: number;
  avg_duration_minutes: number;
  avg_quality: number;
  best_duration_minutes: number;
  worst_duration_minutes: number;
  weekly_trend: { date: string; duration_minutes: number; quality: number }[];
}

export interface SleepTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

export interface SleepSound {
  id: number;
  name: string;
  category: string;
  file_url: string;
  duration_seconds: number;
}

export interface WeatherAdvice {
  city: string;
  weather: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    wind_speed: number;
    description: string;
    icon: string;
  };
  tips: { icon: string; title: string; content: string }[];
  recommended_sounds: string[];
}

// --- API Calls ---

export const createRecord = async (data: {
  date: string;
  bed_time: string;
  wake_time: string;
  quality: number;
  note?: string;
}): Promise<SleepRecord> => {
  const res = await api.post("/records/", data);
  return res.data;
};

export const getRecords = async (
  startDate?: string,
  endDate?: string
): Promise<SleepRecord[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const res = await api.get("/records/", { params });
  return res.data;
};

export const deleteRecord = async (id: number): Promise<void> => {
  await api.delete(`/records/${id}`);
};

export const getStats = async (days = 7): Promise<SleepStats> => {
  const res = await api.get("/records/stats", { params: { days } });
  return res.data;
};

export const getTips = async (category?: string): Promise<SleepTip[]> => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const res = await api.get("/tips/", { params });
  return res.data;
};

export const getRandomTip = async (): Promise<SleepTip> => {
  const res = await api.get("/tips/random");
  return res.data;
};

export const getSounds = async (
  category?: string
): Promise<SleepSound[]> => {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const res = await api.get("/sounds/", { params });
  return res.data;
};

export const getSleepAdvice = async (
  lat: number,
  lon: number
): Promise<WeatherAdvice> => {
  const res = await api.get("/sleep-advice/", { params: { lat, lon } });
  return res.data;
};

// --- AI API ---

export interface AIAnalysis {
  analysis: string;
  record_count: number;
  avg_duration: number;
  avg_quality: number;
}

export interface AIMeditation {
  text: string;
  audio_url: string;
}

export const postAIAnalyze = async (
  records: SleepRecord[]
): Promise<AIAnalysis> => {
  const res = await api.post("/ai/analyze", {
    records: records.map((r) => ({
      date: r.date,
      duration_minutes: r.duration_minutes,
      quality: r.quality,
    })),
  });
  return res.data;
};

export const postAIChat = async (
  message: string,
  history?: { role: string; content: string }[],
  sleepContext?: string
): Promise<{ reply: string }> => {
  const res = await api.post("/ai/chat", {
    message,
    history,
    sleep_context: sleepContext,
  });
  return res.data;
};

export const postAIMeditation = async (
  theme?: string
): Promise<AIMeditation> => {
  const res = await api.post("/ai/meditation", { theme });
  return res.data;
};

export const getAIMeditationText = async (
  theme?: string
): Promise<{ text: string }> => {
  const res = await api.get("/ai/meditation/text", {
    params: { theme: theme || "通用助眠" },
  });
  return res.data;
};

// --- 故事 API ---

export const getStoryThemes = async (): Promise<{ themes: string[] }> => {
  const res = await api.get("/ai/story/themes");
  return res.data;
};

export const postAIStory = async (
  theme?: string
): Promise<{ id: number; name: string; audio_url: string; duration_seconds: number }> => {
  const res = await api.post("/ai/story", { theme });
  return res.data;
};
