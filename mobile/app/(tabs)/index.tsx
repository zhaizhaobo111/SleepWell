import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
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
import { COLORS, SIZES, FONTS } from "../../constants/theme";

const CITY_STORAGE_KEY = "@sleepwell_city";

export default function HomeScreen() {
  const router = useRouter();
  const [lastRecord, setLastRecord] = useState<SleepRecord | null>(null);
  const [tip, setTip] = useState<SleepTip | null>(null);
  const [weatherAdvice, setWeatherAdvice] = useState<WeatherAdvice | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedCity = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(CITY_STORAGE_KEY);
      if (saved) setSelectedCity(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load saved city:", e);
    }
  }, []);

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
    try {
      const advice = await getSleepAdvice(city.lat, city.lon);
      setWeatherAdvice(advice);
    } catch (e) {
      console.error("Failed to load weather advice:", e);
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

  useFocusEffect(
    useCallback(() => {
      if (selectedCity) loadWeatherAdvice(selectedCity);
    }, [selectedCity, loadWeatherAdvice])
  );

  const handleCitySelect = (city: City) => {
    setShowCityPicker(false);
    saveCity(city);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (selectedCity) await loadWeatherAdvice(selectedCity);
    setRefreshing(false);
  };

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了，早点休息";
    if (hour < 12) return "早安，愿你精神充沛";
    if (hour < 18) return "午后时光，适当小憩";
    if (hour < 22) return "晚安，准备入眠吧";
    return "夜深了，放松身心";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primaryLight}
        />
      }
    >
      {/* 问候语 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <TouchableOpacity
          style={styles.cityChip}
          onPress={() => setShowCityPicker(true)}
        >
          <Text style={styles.cityChipText}>
            {selectedCity ? selectedCity.name : "选择城市"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 睡眠状态圆形卡片 */}
      <View style={styles.sleepCard}>
        <View style={styles.sleepCircle}>
          <Text style={styles.sleepEmoji}>🌙</Text>
          {lastRecord ? (
            <>
              <Text style={styles.sleepDuration}>
                {formatDuration(lastRecord.duration_minutes)}
              </Text>
              <Text style={styles.sleepQuality}>
                {["", "需要改善", "还需努力", "还不错", "睡得很好", "完美"][lastRecord.quality]}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.sleepDuration}>暂无记录</Text>
              <Text style={styles.sleepQuality}>点击下方记录你的睡眠</Text>
            </>
          )}
        </View>
      </View>

      {/* 天气睡眠建议 */}
      {selectedCity && weatherAdvice && !weatherLoading && (
        <View style={styles.weatherCard}>
          <View style={styles.weatherRow}>
            <Text style={styles.weatherCity}>{weatherAdvice.city}</Text>
            <Text style={styles.weatherTemp}>
              {Math.round(weatherAdvice.weather.temp)}°
            </Text>
          </View>
          <Text style={styles.weatherDesc}>
            {weatherAdvice.weather.description} · 体感 {Math.round(weatherAdvice.weather.feels_like)}°C
          </Text>
          {weatherAdvice.tips.length > 0 && (
            <View style={styles.adviceContainer}>
              {weatherAdvice.tips.slice(0, 2).map((t, i) => (
                <View key={i} style={styles.adviceRow}>
                  <Text style={styles.adviceIcon}>{t.icon}</Text>
                  <Text style={styles.adviceText}>{t.content}</Text>
                </View>
              ))}
            </View>
          )}
          {weatherAdvice.recommended_sounds.length > 0 && (
            <TouchableOpacity
              style={styles.soundSuggest}
              onPress={() => router.push({ pathname: "/(tabs)/sounds", params: { playSound: weatherAdvice.recommended_sounds[0] } })}
            >
              <Text style={styles.soundSuggestText}>
                🎵 推荐聆听：{weatherAdvice.recommended_sounds.join(" · ")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!selectedCity && (
        <TouchableOpacity
          style={styles.selectCityCard}
          onPress={() => setShowCityPicker(true)}
        >
          <Text style={styles.selectCityIcon}>🌤️</Text>
          <Text style={styles.selectCityText}>选择你的城市</Text>
          <Text style={styles.selectCityHint}>获取专属天气睡眠建议</Text>
        </TouchableOpacity>
      )}

      {/* 今日建议 */}
      {tip && (
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>今日小贴士</Text>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipContent}>{tip.content}</Text>
        </View>
      )}

      {/* 快捷入口 */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push("/(tabs)/sounds")}
        >
          <Text style={styles.quickIcon}>🎵</Text>
          <Text style={styles.quickLabel}>助眠音频</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push("/(tabs)/sounds")}
        >
          <Text style={styles.quickIcon}>🫧</Text>
          <Text style={styles.quickLabel}>呼吸放松</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.quickIcon}>📝</Text>
          <Text style={styles.quickLabel}>记录睡眠</Text>
        </TouchableOpacity>
      </View>

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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  greeting: {
    fontSize: SIZES.title,
    ...FONTS.medium,
    color: COLORS.text,
    letterSpacing: 1,
  },
  cityChip: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusLarge,
  },
  cityChipText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },

  // 睡眠圆形卡片
  sleepCard: {
    alignItems: "center",
    paddingVertical: SIZES.xl,
  },
  sleepCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryDark,
  },
  sleepEmoji: {
    fontSize: 36,
    marginBottom: SIZES.sm,
  },
  sleepDuration: {
    fontSize: SIZES.title,
    ...FONTS.semibold,
    color: COLORS.text,
    letterSpacing: 1,
  },
  sleepQuality: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },

  // 天气卡片
  weatherCard: {
    marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  weatherRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  weatherCity: {
    fontSize: SIZES.subtitle,
    ...FONTS.medium,
    color: COLORS.text,
  },
  weatherTemp: {
    fontSize: SIZES.hero,
    ...FONTS.light as any,
    color: COLORS.sky,
  },
  weatherDesc: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  adviceContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.cardLight,
    paddingTop: SIZES.md,
    gap: SIZES.sm,
  },
  adviceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.sm,
  },
  adviceIcon: {
    fontSize: 16,
  },
  adviceText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    flex: 1,
  },
  soundSuggest: {
    marginTop: SIZES.md,
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    alignItems: "center",
  },
  soundSuggestText: {
    fontSize: SIZES.body,
    color: COLORS.primaryLight,
  },

  // 选择城市提示
  selectCityCard: {
    marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.xl,
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  selectCityIcon: {
    fontSize: 40,
    marginBottom: SIZES.md,
  },
  selectCityText: {
    fontSize: SIZES.subtitle,
    ...FONTS.medium,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  selectCityHint: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
  },

  // 今日建议
  tipCard: {
    marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  tipLabel: {
    fontSize: SIZES.caption,
    color: COLORS.mint,
    ...FONTS.medium,
    marginBottom: SIZES.sm,
    letterSpacing: 2,
  },
  tipTitle: {
    fontSize: SIZES.subtitle,
    ...FONTS.semibold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  tipContent: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },

  // 快捷入口
  quickRow: {
    flexDirection: "row",
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    alignItems: "center",
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: SIZES.sm,
  },
  quickLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
});
