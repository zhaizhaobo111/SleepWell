import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createRecord } from "../../services/api";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

export default function RecordScreen() {
  const [date] = useState(new Date());
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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

      await createRecord({
        date: dateStr,
        bed_time: bedTime.toISOString(),
        wake_time: wakeTime.toISOString(),
        quality,
        note,
      });
      Alert.alert("成功", "睡眠记录已保存");
      setNote("");
    } catch (e) {
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>记录睡眠</Text>

      {/* 入睡时间 */}
      <View style={styles.card}>
        <Text style={styles.label}>入睡时间</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowBedPicker(true)}
        >
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
      <View style={styles.card}>
        <Text style={styles.label}>起床时间</Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowWakePicker(true)}
        >
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
      <View style={styles.card}>
        <Text style={styles.label}>睡眠质量</Text>
        <View style={styles.qualityRow}>
          {qualityOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.qualityBtn,
                quality === opt.value && styles.qualityBtnActive,
              ]}
              onPress={() => setQuality(opt.value)}
            >
              <Text style={styles.qualityEmoji}>{opt.emoji}</Text>
              <Text
                style={[
                  styles.qualityLabel,
                  quality === opt.value && styles.qualityLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 备注 */}
      <View style={styles.card}>
        <Text style={styles.label}>备注（可选）</Text>
        <TextInput
          style={styles.input}
          placeholder="记录一下今天的感受..."
          placeholderTextColor={COLORS.sub}
          value={note}
          onChangeText={setNote}
          multiline
        />
      </View>

      {/* 提交按钮 */}
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
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.sub,
    marginBottom: 12,
  },
  timeButton: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  timeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.text,
  },
  qualityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  qualityBtn: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    minWidth: 56,
  },
  qualityBtnActive: {
    backgroundColor: COLORS.accent,
  },
  qualityEmoji: {
    fontSize: 28,
  },
  qualityLabel: {
    fontSize: 12,
    color: COLORS.sub,
    marginTop: 4,
  },
  qualityLabelActive: {
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 40,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
});
