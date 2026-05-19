import { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { getStats, SleepStats } from "../../services/api";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

const screenWidth = Dimensions.get("window").width - 40;

export default function StatsScreen() {
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [days, setDays] = useState(7);

  useFocusEffect(
    useCallback(() => {
      getStats(days).then(setStats).catch(console.error);
    }, [days])
  );

  const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h${m}m`;
  };

  if (!stats || stats.total_records === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
        <Text style={{ color: COLORS.sub, fontSize: 16 }}>暂无数据</Text>
        <Text style={{ color: COLORS.sub, fontSize: 14, marginTop: 8 }}>
          记录几晚睡眠后再来看统计吧
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: stats.weekly_trend.map((t) =>
      t.date.slice(5) // MM-DD
    ),
    datasets: [
      {
        data: stats.weekly_trend.map((t) => t.duration_minutes / 60),
        color: () => COLORS.accent,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>睡眠统计</Text>

      {/* 时间范围选择 */}
      <View style={styles.rangeRow}>
        {[7, 14, 30].map((d) => (
          <Text
            key={d}
            style={[styles.rangeBtn, days === d && styles.rangeBtnActive]}
            onPress={() => setDays(d)}
          >
            {d}天
          </Text>
        ))}
      </View>

      {/* 概览卡片 */}
      <View style={styles.overviewRow}>
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

      {/* 睡眠时长趋势 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>睡眠时长趋势（小时）</Text>
        {stats.weekly_trend.length > 1 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 1,
              color: () => COLORS.accent,
              labelColor: () => COLORS.sub,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: COLORS.accent,
              },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        ) : (
          <Text style={{ color: COLORS.sub, textAlign: "center", padding: 20 }}>
            至少需要2条记录才能显示趋势图
          </Text>
        )}
      </View>

      {/* 极值 */}
      <View style={styles.overviewRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatDuration(stats.best_duration_minutes)}
          </Text>
          <Text style={styles.statLabel}>最长睡眠</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatDuration(stats.worst_duration_minutes)}
          </Text>
          <Text style={styles.statLabel}>最短睡眠</Text>
        </View>
      </View>
    </ScrollView>
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
  rangeRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  rangeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    color: COLORS.sub,
    fontSize: 14,
    overflow: "hidden",
  },
  rangeBtnActive: {
    backgroundColor: COLORS.accent,
    color: COLORS.text,
  },
  overviewRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.sub,
    marginTop: 4,
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
    marginBottom: 16,
  },
});
