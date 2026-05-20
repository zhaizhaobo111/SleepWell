import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { postAIChat } from "../../services/api";
import { COLORS, SIZES, FONTS } from "../../constants/theme";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "你好！我是 SleepWell 睡眠助手 🌙\n有什么睡眠问题可以问我~" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const { reply } = await postAIChat(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，暂时无法回复，请稍后再试。" },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.bubble,
        item.role === "user" ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={styles.bubbleText}>{item.content}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 消息列表 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* 输入栏 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="问我任何睡眠问题..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Text style={styles.sendText}>{loading ? "..." : "发送"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  messageList: {
    padding: SIZES.md,
    paddingBottom: SIZES.lg,
  },
  bubble: {
    maxWidth: "80%",
    padding: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.sm,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primaryDark,
    borderBottomRightRadius: SIZES.sm,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: SIZES.sm,
  },
  bubbleText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.cardLight,
    backgroundColor: COLORS.bg,
    gap: SIZES.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLarge,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 2,
    fontSize: SIZES.body,
    color: COLORS.text,
  },
  sendBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: SIZES.radiusLarge,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm + 2,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: SIZES.body,
    color: COLORS.text,
    ...FONTS.medium,
  },
});
