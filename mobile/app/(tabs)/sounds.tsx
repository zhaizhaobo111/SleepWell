import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Audio } from "expo-av";
import { getSounds, SleepSound } from "../../services/api";

const API_HOST = "http://10.10.80.40:8000";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

const SOUND_CATEGORIES = ["全部", "雨声", "海浪", "自然", "风声", "篝火", "城市", "白噪音"];

export default function SoundsScreen() {
  const [sounds, setSounds] = useState<SleepSound[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      const cat = selectedCategory === "全部" ? undefined : selectedCategory;
      getSounds(cat).then(setSounds).catch(console.error);

      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [selectedCategory])
  );

  const categoryIcons: Record<string, string> = {
    雨声: "🌧️",
    海浪: "🌊",
    自然: "🌿",
    风声: "💨",
    篝火: "🔥",
    城市: "🏙️",
    白噪音: "📻",
  };

  const handlePlay = async (item: SleepSound) => {
    try {
      // 如果正在播放同一个，暂停/继续
      if (playingId === item.id && sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
          setPlayingId(null);
        } else {
          await sound.playAsync();
          setPlayingId(item.id);
        }
        return;
      }

      // 停止之前的
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // 设置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });

      // 播放真实音频
      const uri = `${API_HOST}/sounds/${item.file_url}`;
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setPlayingId(item.id);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>助眠音频</Text>

      {/* 分类筛选 */}
      <View style={styles.categoryRow}>
        {SOUND_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              selectedCategory === cat && styles.categoryBtnActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 音频列表 */}
      <FlatList
        data={sounds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.card,
              playingId === item.id && styles.cardPlaying,
            ]}
            onPress={() => handlePlay(item)}
          >
            <View style={styles.cardIcon}>
              <Text style={{ fontSize: 28 }}>
                {categoryIcons[item.category] || "🎵"}
              </Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardCategory}>{item.category}</Text>
            </View>
            <View style={styles.playBtn}>
              <Text style={{ fontSize: 20 }}>
                {playingId === item.id ? "⏸" : "▶️"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.card,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.accent,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.sub,
  },
  categoryTextActive: {
    color: COLORS.text,
    fontWeight: "600",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardPlaying: {
    borderColor: COLORS.accent,
    borderWidth: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  cardCategory: {
    fontSize: 12,
    color: COLORS.sub,
    marginTop: 2,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
