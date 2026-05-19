import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { getTips, SleepTip } from "../../services/api";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

const CATEGORIES = ["全部", "习惯", "环境", "饮食", "运动"];

export default function TipsScreen() {
  const [tips, setTips] = useState<SleepTip[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("全部");

  useFocusEffect(
    useCallback(() => {
      const cat = selectedCategory === "全部" ? undefined : selectedCategory;
      getTips(cat).then(setTips).catch(console.error);
    }, [selectedCategory])
  );

  const categoryColors: Record<string, string> = {
    习惯: "#4ecdc4",
    环境: "#45b7d1",
    饮食: "#f9ca24",
    运动: "#6c5ce7",
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>睡眠建议</Text>

      {/* 分类筛选 */}
      <View style={styles.categoryRow}>
        {CATEGORIES.map((cat) => (
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

      {/* 建议列表 */}
      <FlatList
        data={tips}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: categoryColors[item.category] || COLORS.sub },
                ]}
              >
                <Text style={styles.badgeText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.cardContent}>{item.content}</Text>
          </View>
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
    padding: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.sub,
    lineHeight: 22,
  },
});
