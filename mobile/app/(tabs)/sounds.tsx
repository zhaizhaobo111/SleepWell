import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { getSounds, SleepSound, postAIMeditation, postAIStory } from "../../services/api";
import { COLORS, SIZES, FONTS } from "../../constants/theme";

const API_HOST = "http://10.10.80.40:8000";

const CATEGORIES = ["全部", "雨声", "海浪", "自然", "风声", "篝火", "城市", "白噪音", "故事"];

const categoryIcons: Record<string, string> = {
  雨声: "🌧️",
  海浪: "🌊",
  自然: "🌿",
  风声: "💨",
  篝火: "🔥",
  城市: "🏙️",
  白噪音: "📻",
  故事: "📖",
};

type TabType = "sounds" | "breathing" | "meditation";

export default function SoundsScreen() {
  const params = useLocalSearchParams<{ playSound?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("sounds");
  const [sounds, setSounds] = useState<SleepSound[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      const cat = selectedCategory === "全部" ? undefined : selectedCategory;
      getSounds(cat).then(setSounds).catch(console.error);

      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync().catch(() => {});
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        setSound(null);
        setPlayingId(null);
      };
    }, [selectedCategory])
  );

  // 从首页推荐跳转过来，自动播放指定音频
  useEffect(() => {
    if (!params.playSound || sounds.length === 0) return;
    const target = sounds.find((s) => s.name === params.playSound);
    if (target) {
      handlePlay(target);
    }
  }, [params.playSound, sounds]);

  const handlePlay = async (item: SleepSound) => {
    try {
      if (playingId === item.id && soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlayingId(null);
        } else {
          await soundRef.current.playAsync();
          setPlayingId(item.id);
        }
        return;
      }

      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
        setSound(null);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });

      const uri = `${API_HOST}/sounds/${item.file_url}`;
      const shouldLoop = item.category !== "故事";
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: shouldLoop }
      );
      soundRef.current = newSound;
      setSound(newSound);
      setPlayingId(item.id);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  return (
    <View style={styles.container}>
      {/* 顶部 Tab 切换 */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "sounds" && styles.tabBtnActive]}
          onPress={() => setActiveTab("sounds")}
        >
          <Text style={[styles.tabText, activeTab === "sounds" && styles.tabTextActive]}>
            助眠音频
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "breathing" && styles.tabBtnActive]}
          onPress={() => setActiveTab("breathing")}
        >
          <Text style={[styles.tabText, activeTab === "breathing" && styles.tabTextActive]}>
            呼吸放松
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "meditation" && styles.tabBtnActive]}
          onPress={() => setActiveTab("meditation")}
        >
          <Text style={[styles.tabText, activeTab === "meditation" && styles.tabTextActive]}>
            冥想引导
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "sounds" ? (
        <SoundsContent
          sounds={sounds}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          playingId={playingId}
          onPlay={handlePlay}
          onRefresh={() => {
            const cat = selectedCategory === "全部" ? undefined : selectedCategory;
            getSounds(cat).then(setSounds).catch(console.error);
          }}
        />
      ) : activeTab === "breathing" ? (
        <BreathingContent />
      ) : (
        <MeditationContent />
      )}
    </View>
  );
}

// --- 音频列表模块 ---
function SoundsContent({
  sounds,
  selectedCategory,
  setSelectedCategory,
  playingId,
  onPlay,
  onRefresh,
}: {
  sounds: SleepSound[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  playingId: number | null;
  onPlay: (s: SleepSound) => void;
  onRefresh: () => void;
}) {
  const [storyLoading, setStoryLoading] = useState(false);

  const handleGenerateStory = async () => {
    setStoryLoading(true);
    try {
      await postAIStory();
      onRefresh();
    } catch (e) {
      console.error("Story generation error:", e);
    } finally {
      setStoryLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 分类筛选 */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
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
        )}
      />

      {/* 故事生成按钮 */}
      {selectedCategory === "故事" && (
        <TouchableOpacity
          style={[styles.storyGenBtn, storyLoading && { opacity: 0.6 }]}
          onPress={handleGenerateStory}
          disabled={storyLoading}
        >
          {storyLoading ? (
            <ActivityIndicator color={COLORS.text} size="small" />
          ) : (
            <Text style={styles.storyGenText}>✨ AI 生成新故事</Text>
          )}
        </TouchableOpacity>
      )}

      {/* 音频列表 */}
      <FlatList
        data={sounds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.soundCard,
              playingId === item.id && styles.soundCardPlaying,
            ]}
            onPress={() => onPlay(item)}
            activeOpacity={0.7}
          >
            <View style={styles.soundIcon}>
              <Text style={{ fontSize: 24 }}>
                {categoryIcons[item.category] || "🎵"}
              </Text>
            </View>
            <View style={styles.soundInfo}>
              <Text style={styles.soundName}>{item.name}</Text>
              <Text style={styles.soundCategory}>{item.category}</Text>
            </View>
            <View style={[
              styles.playBtn,
              playingId === item.id && styles.playBtnActive,
            ]}>
              <Text style={{ fontSize: 18, color: COLORS.text }}>
                {playingId === item.id ? "⏸" : "▶"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

// --- 呼吸放松模块 ---
const BREATH_PHASES = [
  { label: "吸气", duration: 4000, scale: 1.4, color: COLORS.mint },
  { label: "屏息", duration: 4000, scale: 1.4, color: COLORS.sky },
  { label: "呼气", duration: 6000, scale: 1.0, color: COLORS.coral },
];

function BreathingContent() {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopBreathing = useCallback(() => {
    setIsRunning(false);
    setPhaseIndex(0);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.6,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const runPhase = useCallback(
    (index: number) => {
      const phase = BREATH_PHASES[index % BREATH_PHASES.length];
      setPhaseIndex(index % BREATH_PHASES.length);

      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: phase.scale,
          duration: phase.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: index % BREATH_PHASES.length === 2 ? 0.4 : 0.8,
          duration: phase.duration,
          useNativeDriver: true,
        }),
      ]).start();

      cycleRef.current = setTimeout(() => {
        runPhase(index + 1);
      }, phase.duration);
    },
    [scaleAnim, opacityAnim]
  );

  const startBreathing = useCallback(() => {
    setIsRunning(true);
    runPhase(0);
  }, [runPhase]);

  useEffect(() => {
    return () => {
      if (cycleRef.current) clearTimeout(cycleRef.current);
    };
  }, []);

  const currentPhase = BREATH_PHASES[phaseIndex];

  return (
    <View style={styles.breathContainer}>
      <View style={styles.breathCircleWrap}>
        <Animated.View
          style={[
            styles.breathCircleOuter,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
              borderColor: currentPhase.color,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.breathCircleInner,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: currentPhase.color + "30",
            },
          ]}
        >
          <Text style={styles.breathLabel}>
            {isRunning ? currentPhase.label : "开始"}
          </Text>
          {isRunning && (
            <Text style={styles.breathTimer}>{currentPhase.duration / 1000}秒</Text>
          )}
        </Animated.View>
      </View>

      <Text style={styles.breathGuide}>
        {isRunning
          ? `${BREATH_PHASES[0].label} ${BREATH_PHASES[0].duration / 1000}秒 · ${BREATH_PHASES[1].label} ${BREATH_PHASES[1].duration / 1000}秒 · ${BREATH_PHASES[2].label} ${BREATH_PHASES[2].duration / 1000}秒`
          : "跟随圆圈的节奏，缓缓呼吸"}
      </Text>

      <TouchableOpacity
        style={[
          styles.breathBtn,
          isRunning && styles.breathBtnStop,
        ]}
        onPress={isRunning ? stopBreathing : startBreathing}
        activeOpacity={0.7}
      >
        <Text style={styles.breathBtnText}>
          {isRunning ? "停止" : "开始呼吸"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// --- 冥想引导模块 ---
const MEDITATION_THEMES = ["通用助眠", "缓解焦虑", "深度放松", "睡前感恩"];

function MeditationContent() {
  const [meditationText, setMeditationText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("通用助眠");
  const meditationSound = useRef<Audio.Sound | null>(null);

  const generateMeditation = async (theme: string) => {
    setLoading(true);
    setMeditationText("");
    setAudioUrl("");
    try {
      const result = await postAIMeditation(theme);
      setMeditationText(result.text);
      setAudioUrl(result.audio_url);
    } catch {
      setMeditationText("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUrl) return;
    try {
      if (playing && meditationSound.current) {
        await meditationSound.current.pauseAsync();
        setPlaying(false);
        return;
      }
      if (meditationSound.current) {
        await meditationSound.current.unloadAsync();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
      });
      const uri = `${API_HOST}/sounds/${audioUrl}`;
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      meditationSound.current = sound;
      setPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
        }
      });
    } catch (e) {
      console.error("Meditation playback error:", e);
    }
  };

  useEffect(() => {
    return () => {
      meditationSound.current?.unloadAsync();
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.meditationContainer}>
      <View style={styles.meditationThemes}>
        {MEDITATION_THEMES.map((theme) => (
          <TouchableOpacity
            key={theme}
            style={[styles.meditationThemeBtn, selectedTheme === theme && styles.meditationThemeBtnActive]}
            onPress={() => setSelectedTheme(theme)}
          >
            <Text style={[styles.meditationThemeText, selectedTheme === theme && styles.meditationThemeTextActive]}>
              {theme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.meditationGenBtn, loading && { opacity: 0.6 }]}
        onPress={() => generateMeditation(selectedTheme)}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={COLORS.text} /> : <Text style={styles.meditationGenText}>✨ 生成冥想引导</Text>}
      </TouchableOpacity>
      {meditationText ? (
        <View style={styles.meditationTextCard}>
          <Text style={styles.meditationTextLabel}>🧘 冥想引导词</Text>
          <Text style={styles.meditationTextContent}>{meditationText}</Text>
        </View>
      ) : null}
      {audioUrl ? (
        <TouchableOpacity style={styles.meditationPlayBtn} onPress={handlePlayAudio}>
          <Text style={styles.meditationPlayText}>{playing ? "⏸ 暂停播放" : "▶️ 播放冥想语音"}</Text>
        </TouchableOpacity>
      ) : null}
      {!meditationText && !loading && (
        <View style={styles.meditationEmpty}>
          <Text style={styles.meditationEmptyIcon}>🌙</Text>
          <Text style={styles.meditationEmptyText}>选择主题，AI 为你生成专属冥想引导</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  // Tab 切换
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SIZES.sm + 2,
    borderRadius: SIZES.radiusMedium,
    backgroundColor: COLORS.card,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  tabText: {
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    ...FONTS.medium,
  },
  tabTextActive: {
    color: COLORS.text,
  },

  // 分类筛选
  categoryRow: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
  },
  categoryBtn: {
    paddingVertical: 6,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.card,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  categoryText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.text,
    ...FONTS.medium,
  },

  // 音频卡片
  soundCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  soundCardPlaying: {
    borderColor: COLORS.mint,
    borderWidth: 1.5,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center",
  },
  soundInfo: {
    flex: 1,
    marginLeft: SIZES.md,
  },
  soundName: {
    fontSize: SIZES.body,
    color: COLORS.text,
    ...FONTS.medium,
  },
  soundCategory: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnActive: {
    backgroundColor: COLORS.mint,
  },

  // 呼吸放松
  breathContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SIZES.lg,
  },
  breathCircleWrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.xl,
  },
  breathCircleOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: COLORS.mint,
  },
  breathCircleInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.mint + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  breathLabel: {
    fontSize: SIZES.title,
    color: COLORS.text,
    ...FONTS.medium,
  },
  breathTimer: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  breathGuide: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SIZES.xl,
    lineHeight: 20,
  },
  breathBtn: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xxl,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.primaryDark,
  },
  breathBtnStop: {
    backgroundColor: COLORS.coral,
  },
  breathBtnText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    ...FONTS.medium,
  },

  // 冥想引导
  meditationContainer: { padding: SIZES.lg, paddingBottom: 40, alignItems: "center" },
  meditationThemes: { flexDirection: "row", flexWrap: "wrap", gap: SIZES.sm, marginBottom: SIZES.lg, justifyContent: "center" },
  meditationThemeBtn: { paddingVertical: 6, paddingHorizontal: SIZES.md, borderRadius: SIZES.radiusLarge, backgroundColor: COLORS.card },
  meditationThemeBtnActive: { backgroundColor: COLORS.primaryDark },
  meditationThemeText: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  meditationThemeTextActive: { color: COLORS.text, ...FONTS.medium },
  meditationGenBtn: { backgroundColor: COLORS.primaryDark, borderRadius: SIZES.radiusLarge, paddingVertical: SIZES.md, paddingHorizontal: SIZES.xxl, marginBottom: SIZES.lg, minWidth: 200, alignItems: "center" },
  meditationGenText: { fontSize: SIZES.body, color: COLORS.text, ...FONTS.medium },
  meditationTextCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.md, width: "100%" },
  meditationTextLabel: { fontSize: SIZES.caption, color: COLORS.mint, ...FONTS.medium, marginBottom: SIZES.sm },
  meditationTextContent: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 24 },
  meditationPlayBtn: { backgroundColor: COLORS.mint, borderRadius: SIZES.radiusLarge, paddingVertical: SIZES.md, paddingHorizontal: SIZES.xxl, marginBottom: SIZES.lg, minWidth: 200, alignItems: "center" },
  meditationPlayText: { fontSize: SIZES.body, color: COLORS.bg, ...FONTS.medium },
  meditationEmpty: { alignItems: "center", marginTop: SIZES.xxl },
  meditationEmptyIcon: { fontSize: 48, marginBottom: SIZES.md },
  meditationEmptyText: { fontSize: SIZES.body, color: COLORS.textMuted, textAlign: "center" },

  // 故事生成
  storyGenBtn: {
    marginHorizontal: SIZES.lg,
    marginBottom: SIZES.sm,
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.radiusLarge,
    paddingVertical: SIZES.sm + 2,
    alignItems: "center",
  },
  storyGenText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    ...FONTS.medium,
  },
});
