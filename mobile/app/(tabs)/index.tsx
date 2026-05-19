import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getRecords,
  getRandomTip,
  getSleepAdvice,
  SleepRecord,
  SleepTip,
  WeatherAdvice,
} from "../../services/api";
import CityPicker from "../../components/CityPicker";
import { City } from "../../data/cities";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

const CITY_STORAGE_KEY = "@sleepwell_city";

export default function HomeScreen() {
  const [lastRecord, setLastRecord] = useState<SleepRecord | null>(null);
  const [tip, setTip] = useState<SleepTip | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 加载保存的城市
  const loadSavedCity = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(CITY_STORAGE_KEY);
      if (saved) {
        setSelectedCity(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load saved city:", e);
    }
  }, []);

  // 保存城市到本地
  const saveCity = useCallback(async (city: City) => {
    try {
      await AsyncStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city));
      setSelectedCity(city);
    } catch (e) {
      console.error("Failed to save city:", e);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [records, randomTip] = await Promise.all([
        getRecords(),
        getRandomTip(),
      ]);
      if (records.length > 0) setLastRecord(records[0]);
      setTip(randomTip);
    } catch (e) {
      console.error("Failed to load home data:", e);
    }
  }, []);

  const loadWeatherAdvice = useCallback(async (city: City) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const advice = await getSleepAdvice(city.lat, city.lon);
      setWeatherAdvice(advice);
    } catch (e) {
      console.error("Failed to load weather advice:", e);
      setWeatherError("获取天气信息失败");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadSavedCity();
    }, [loadData, loadSavedCity])
  );

  // 城市变化时加载天气
  useFocusEffect(
    useCallback(() => {
      if (selectedCity) {
        loadWeatherAdvice(selectedCity);
      }
    }, [selectedCity, loadWeatherAdvice])
  );

  const handleCitySelect = (city: City) => {
    setShowCityPicker(false);
    saveCity(city);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (selectedCity) {
      await loadWeatherAdvice(selectedCity);
    }
    setRefreshing(false);
  };

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}小时${m}分钟`;
  };

  const qualityEmoji = ["", "😫", "😕", "😐", "😊", "😴"];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.greeting}>SleepWell</Text>
      <Text style={styles.subtitle}>祝你今晚好眠</Text>

      {/* 昨晚睡眠卡片 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>昨晚睡眠</Text>
        {lastRecord ? (
          <>
            <Text style={styles.duration}>
              {formatDuration(lastRecord.duration_minutes)}
            </Text>
            <Text style={styles.quality}>
              {qualityEmoji[lastRecord.quality]} 质量评分: {lastRecord.quality}/5
            </Text>
            <Text style={styles.time}>
              {new Date(lastRecord.bed_time).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              →{" "}
              {new Date(lastRecord.wake_time).toLocaleTimeString("zh-CN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </>
        ) : (
          <Text style={styles.empty}>还没有睡眠记录，去记录一下吧</Text>
        )}
      </View>

      {/* 今日建议卡片 */}
      <View style={[styles.card, { borderLeftColor: COLORS.accent, borderLeftWidth: 3 }]}>
        <Text style={styles.cardTitle}>💡 今日建议</Text>
        {tip ? (
          <>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipContent}>{tip.content}</Text>
            <Text style={styles.tipCategory}>#{tip.category}</Text>
          </>
        ) : (
          <Text style={styles.empty}>加载中...</Text>
        )}
      </View>

      {/* 天气睡眠建议卡片 */}
      <View style={[styles.card, { borderLeftColor: "#4fc3f7", borderLeftWidth: 3 }]}>
        <View style={styles.weatherTitleRow}>
          <Text style={styles.cardTitle}>🌤️ 天气睡眠建议</Text>
          <TouchableOpacity
            style={styles.cityBtn}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={styles.cityBtnText}>
              {selectedCity ? `📍 ${selectedCity.name}` : "选择城市"}
            </Text>
          </TouchableOpacity>
        </View>

        {!selectedCity ? (
          <TouchableOpacity
            style={styles.selectCityPrompt}
            onPress={() => setShowCityPicker(true)}
          >
            <Text style={styles.selectCityText}>请先选择城市以获取天气建议</Text>
          </TouchableOpacity>
        ) : weatherLoading ? (
          <Text style={styles.empty}>正在获取天气信息...</Text>
        ) : weatherError ? (
          <View>
            <Text style={styles.empty}>{weatherError}</Text>
            <TouchableOpacity
              onPress={() => loadWeatherAdvice(selectedCity)}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>重试</Text>
            </TouchableOpacity>
          </View>
        ) : weatherAdvice ? (
          <>
            {/* 天气概况 */}
            <View style={styles.weatherHeader}>
              <Text style={styles.weatherCity}>{weatherAdvice.city}</Text>
              <Text style={styles.weatherDesc}>
                {weatherAdvice.weather.description} {Math.round(weatherAdvice.weather.temp)}°C
              </Text>
              <Text style={styles.weatherDetail}>
                体感 {Math.round(weatherAdvice.weather.feels_like)}°C · 湿度 {weatherAdvice.weather.humidity}%
              </Text>
            </View>

            {/* 睡眠建议列表 */}
            {weatherAdvice.tips.map((t, i) => (
              <View key={i} style={styles.adviceItem}>
                <Text style={styles.adviceIcon}>{t.icon}</Text>
                <View style={styles.adviceContent}>
                  <Text style={styles.adviceTitle}>{t.title}</Text>
                  <Text style={styles.adviceText}>{t.content}</Text>
                </View>
              </View>
            ))}

            {/* 推荐音频 */}
            <View style={styles.recommendRow}>
              <Text style={styles.recommendLabel}>🎵 推荐音频：</Text>
              <Text style={styles.recommendSounds}>
                {weatherAdvice.recommended_sounds.join(" · ")}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.empty}>暂无天气数据</Text>
        )}
      </View>

      {/* 城市选择器 */}
      <CityPicker
        visible={showCityPicker}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.sub,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    color: COLORS.sub,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  duration: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.text,
  },
  quality: {
    fontSize: 18,
    color: COLORS.text,
    marginTop: 8,
  },
  time: {
    fontSize: 14,
    color: COLORS.sub,
    marginTop: 8,
  },
  empty: {
    fontSize: 14,
    color: COLORS.sub,
    fontStyle: "italic",
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  tipContent: {
    fontSize: 14,
    color: COLORS.sub,
    lineHeight: 22,
  },
  tipCategory: {
    fontSize: 12,
    color: COLORS.accent,
    marginTop: 12,
  },
  weatherTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cityBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  cityBtnText: {
    fontSize: 13,
    color: COLORS.text,
  },
  selectCityPrompt: {
    padding: 20,
    alignItems: "center",
  },
  selectCityText: {
    fontSize: 15,
    color: COLORS.sub,
  },
  weatherHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  weatherCity: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
  },
  weatherDesc: {
    fontSize: 16,
    color: "#4fc3f7",
    marginTop: 4,
  },
  weatherDetail: {
    fontSize: 13,
    color: COLORS.sub,
    marginTop: 4,
  },
  adviceItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  adviceIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  adviceText: {
    fontSize: 13,
    color: COLORS.sub,
    lineHeight: 20,
  },
  recommendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#2a2a4e",
  },
  recommendLabel: {
    fontSize: 13,
    color: COLORS.sub,
  },
  recommendSounds: {
    fontSize: 13,
    color: "#4fc3f7",
    fontWeight: "500",
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  retryText: {
    color: COLORS.text,
    fontSize: 13,
  },
});
