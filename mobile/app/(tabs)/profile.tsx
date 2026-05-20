import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LineChart } from "react-native-chart-kit";
import {
  createRecord,
  getRecords,
  getStats,
  deleteRecord,
  postAIAnalyze,
  SleepRecord,
  SleepStats,
  AIAnalysis,
} from "../../services/api";
import { COLORS, SIZES, FONTS } from "../../constants/theme";

const screenWidth = Dimensions.get("window").width - SIZES.lg * 2;

type Section = "overview" | "record" | "history";

export default function ProfileScreen() {
  const [section, setSection] = useState<Section>("overview");
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [records, setRecords] = useState<SleepRecord[]>([]);
  const [days, setDays] = useState(7);

  useFocusEffect(
    useCallback(() => {
      getStats(days).then(setStats).catch(console.error);
      getRecords().then(setRecords).catch(console.error);
    }, [days])
  );

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}小时${m}分` : `${m}分钟`;
  };

  const qualityLabel = ["", "很差", "较差", "一般", "不错", "很好"];

  return (
    <View style={styles.container}>
      {/* 顶部切换 */}
      <View style={styles.tabRow}>
        {[
          { key: "overview" as Section, label: "总览" },
          { key: "record" as Section, label: "记录" },
          { key: "history" as Section, label: "历史" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, section === t.key && styles.tabBtnActive]}
            onPress={() => setSection(t.key)}
          >
            <Text style={[styles.tabText, section === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {section === "overview" && (
        <OverviewSection
          stats={stats}
          days={days}
          setDays={setDays}
          formatDuration={formatDuration}
        />
      )}
      {section === "record" && <RecordSection />}
      {section === "history" && (
        <HistorySection
          records={records}
          formatDuration={formatDuration}
          qualityLabel={qualityLabel}
          onDelete={async (id) => {
            await deleteRecord(id);
            setRecords((prev) => prev.filter((r) => r.id !== id));
          }}
        />
      )}
    </View>
  );
}

// --- 总览 ---
function OverviewSection({
  stats,
  days,
  setDays,
  formatDuration,
}: {
  stats: SleepStats | null;
  days: number;
  setDays: (d: number) => void;
  formatDuration: (m: number) => string;
}) {
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const data = await getRecords();
      const result = await postAIAnalyze(data);
      setAiResult(result);
    } catch {
      setAiResult({ analysis: "分析失败，请稍后重试", record_count: 0, avg_duration: 0, avg_quality: 0 });
    } finally {
      setAiLoading(false);
    }
  };

  if (!stats || stats.total_records === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>🌙</Text>
        <Text style={styles.emptyText}>暂无睡眠数据</Text>
        <Text style={styles.emptyHint}>记录几晚睡眠后再来看统计吧</Text>
      </View>
    );
  }

  const chartData = {
    labels: stats.weekly_trend.map((t) => t.date.slice(5)),
    datasets: [
      {
        data: stats.weekly_trend.map((t) => t.duration_minutes / 60),
        color: () => COLORS.mint,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* 时间范围 */}
      <View style={styles.rangeRow}>
        {[7, 14, 30].map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.rangeBtn, days === d && styles.rangeBtnActive]}
            onPress={() => setDays(d)}
          >
            <Text style={[styles.rangeText, days === d && styles.rangeTextActive]}>
              {d}天
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 概览卡片 */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(stats.avg_duration_minutes)}</Text>
          <Text style={styles.statLabel}>平均时长</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.avg_quality.toFixed(1)}</Text>
          <Text style={styles.statLabel}>平均质量</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total_records}</Text>
          <Text style={styles.statLabel}>记录数</Text>
        </View>
      </View>

      {/* 趋势图 */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>睡眠时长趋势（小时）</Text>
        {stats.weekly_trend.length > 1 ? (
          <LineChart
            data={chartData}
            width={screenWidth - SIZES.lg * 2}
            height={180}
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 1,
              color: () => COLORS.mint,
              labelColor: () => COLORS.textMuted,
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: COLORS.mint,
              },
            }}
            bezier
            style={{ borderRadius: SIZES.radiusMedium }}
          />
        ) : (
          <Text style={styles.chartEmpty}>至少需要2条记录才能显示趋势图</Text>
        )}
      </View>

      {/* 极值 */}
      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(stats.best_duration_minutes)}</Text>
          <Text style={styles.statLabel}>最长睡眠</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatDuration(stats.worst_duration_minutes)}</Text>
          <Text style={styles.statLabel}>最短睡眠</Text>
        </View>
      </View>

      {/* AI 分析 */}
      <TouchableOpacity
        style={[styles.aiAnalyzeBtn, aiLoading && { opacity: 0.6 }]}
        onPress={handleAIAnalyze}
        disabled={aiLoading}
      >
        <Text style={styles.aiAnalyzeBtnText}>
          {aiLoading ? "AI 正在分析..." : "🤖 AI 睡眠分析"}
        </Text>
      </TouchableOpacity>
      {aiResult && (
        <View style={styles.aiResultCard}>
          <Text style={styles.aiResultLabel}>✨ AI 分析报告</Text>
          <Text style={styles.aiResultText}>{aiResult.analysis}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// --- 记录睡眠 ---
function RecordSection() {
  const [bedTime, setBedTime] = useState(new Date(2026, 4, 18, 23, 0));
  const [wakeTime, setWakeTime] = useState(new Date(2026, 4, 19, 7, 0));
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState("");
  const [showBedPicker, setShowBedPicker] = useState(false);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const qualityOptions = [
    { value: 1, emoji: "😫", label: "很差" },
    { value: 2, emoji: "😕", label: "较差" },
    { value: 3, emoji: "😐", label: "一般" },
    { value: 4, emoji: "😊", label: "不错" },
    { value: 5, emoji: "😴", label: "很好" },
  ];

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      await createRecord({
        date: dateStr,
        bed_time: bedTime.toISOString(),
        wake_time: wakeTime.toISOString(),
        quality,
        note,
      });
      Alert.alert("成功", "睡眠记录已保存");
      setNote("");
    } catch {
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* 入睡时间 */}
      <View style={styles.recordCard}>
        <Text style={styles.recordLabel}>入睡时间</Text>
        <TouchableOpacity style={styles.timeBtn} onPress={() => setShowBedPicker(true)}>
          <Text style={styles.timeText}>{formatTime(bedTime)}</Text>
        </TouchableOpacity>
        {showBedPicker && (
          <DateTimePicker
            value={bedTime}
            mode="time"
            is24Hour
            onChange={(_, date) => {
              setShowBedPicker(Platform.OS === "ios");
              if (date) setBedTime(date);
            }}
          />
        )}
      </View>

      {/* 起床时间 */}
      <View style={styles.recordCard}>
        <Text style={styles.recordLabel}>起床时间</Text>
        <TouchableOpacity style={styles.timeBtn} onPress={() => setShowWakePicker(true)}>
          <Text style={styles.timeText}>{formatTime(wakeTime)}</Text>
        </TouchableOpacity>
        {showWakePicker && (
          <DateTimePicker
            value={wakeTime}
            mode="time"
            is24Hour
            onChange={(_, date) => {
              setShowWakePicker(Platform.OS === "ios");
              if (date) setWakeTime(date);
            }}
          />
        )}
      </View>

      {/* 睡眠质量 */}
      <View style={styles.recordCard}>
        <Text style={styles.recordLabel}>睡眠质量</Text>
        <View style={styles.qualityRow}>
          {qualityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.qualityBtn, quality === opt.value && styles.qualityBtnActive]}
              onPress={() => setQuality(opt.value)}
            >
              <Text style={styles.qualityEmoji}>{opt.emoji}</Text>
              <Text style={[styles.qualityLabel, quality === opt.value && styles.qualityLabelActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 备注 */}
      <View style={styles.recordCard}>
        <Text style={styles.recordLabel}>备注（可选）</Text>
        <TextInput
          style={styles.input}
          placeholder="记录一下今天的感受..."
          placeholderTextColor={COLORS.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>

      {/* 提交 */}
      <TouchableOpacity
        style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? "保存中..." : "保存记录"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- 历史记录 ---
function HistorySection({
  records,
  formatDuration,
  qualityLabel,
  onDelete,
}: {
  records: SleepRecord[];
  formatDuration: (m: number) => string;
  qualityLabel: string[];
  onDelete: (id: number) => void;
}) {
  if (records.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyText}>暂无记录</Text>
        <Text style={styles.emptyHint}>去"记录"页面记录你的第一晚睡眠吧</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {records.map((r) => (
        <View key={r.id} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyDate}>{r.date}</Text>
            <TouchableOpacity onPress={() => onDelete(r.id)}>
              <Text style={styles.deleteText}>删除</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyRow}>
            <View style={styles.historyItem}>
              <Text style={styles.historyValue}>{formatDuration(r.duration_minutes)}</Text>
              <Text style={styles.historyLabel}>时长</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyValue}>{qualityLabel[r.quality] || "-"}</Text>
              <Text style={styles.historyLabel}>质量</Text>
            </View>
          </View>
          {r.note ? <Text style={styles.historyNote}>{r.note}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },

  // Tab
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

  // 空状态
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  emptyText: {
    fontSize: SIZES.subtitle,
    color: COLORS.textSecondary,
    ...FONTS.medium,
  },
  emptyHint: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: SIZES.xs,
  },

  // 统计
  rangeRow: {
    flexDirection: "row",
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  rangeBtn: {
    paddingVertical: 6,
    paddingHorizontal: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    backgroundColor: COLORS.card,
  },
  rangeBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  rangeText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  rangeTextActive: {
    color: COLORS.text,
    ...FONTS.medium,
  },
  statRow: {
    flexDirection: "row",
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    alignItems: "center",
  },
  statValue: {
    fontSize: SIZES.subtitle,
    color: COLORS.text,
    ...FONTS.semibold,
  },
  statLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: SIZES.xs,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  chartTitle: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginBottom: SIZES.md,
  },
  chartEmpty: {
    fontSize: SIZES.body,
    color: COLORS.textMuted,
    textAlign: "center",
    padding: SIZES.lg,
  },

  // 记录
  recordCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
  },
  recordLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginBottom: SIZES.sm,
  },
  timeBtn: {
    backgroundColor: COLORS.cardLight,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    alignItems: "center",
  },
  timeText: {
    fontSize: SIZES.hero,
    color: COLORS.text,
    ...FONTS.semibold,
  },
  qualityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qualityBtn: {
    alignItems: "center",
    padding: SIZES.sm,
    borderRadius: SIZES.radiusMedium,
    minWidth: 52,
  },
  qualityBtnActive: {
    backgroundColor: COLORS.primaryDark,
  },
  qualityEmoji: {
    fontSize: 26,
  },
  qualityLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: SIZES.xs,
  },
  qualityLabelActive: {
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.cardLight,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    color: COLORS.text,
    fontSize: SIZES.body,
    minHeight: 72,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    alignItems: "center",
    marginBottom: SIZES.xxl,
  },
  submitText: {
    fontSize: SIZES.subtitle,
    color: COLORS.text,
    ...FONTS.semibold,
  },

  // 历史
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.sm,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  historyDate: {
    fontSize: SIZES.body,
    color: COLORS.text,
    ...FONTS.medium,
  },
  deleteText: {
    fontSize: SIZES.caption,
    color: COLORS.coral,
  },
  historyRow: {
    flexDirection: "row",
    gap: SIZES.lg,
  },
  historyItem: {},
  historyValue: {
    fontSize: SIZES.subtitle,
    color: COLORS.text,
    ...FONTS.semibold,
  },
  historyLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyNote: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
    lineHeight: 18,
  },

  // AI 分析
  aiAnalyzeBtn: { backgroundColor: COLORS.primaryDark, borderRadius: SIZES.radiusLarge, padding: SIZES.md, alignItems: "center", marginBottom: SIZES.md },
  aiAnalyzeBtnText: { fontSize: SIZES.body, color: COLORS.text, ...FONTS.medium },
  aiResultCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.md, borderWidth: 1, borderColor: COLORS.mint },
  aiResultLabel: { fontSize: SIZES.caption, color: COLORS.mint, ...FONTS.medium, marginBottom: SIZES.sm },
  aiResultText: { fontSize: SIZES.body, color: COLORS.textSecondary, lineHeight: 24 },
});
