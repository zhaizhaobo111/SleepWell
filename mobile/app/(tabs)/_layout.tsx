import { Tabs } from "expo-router";
import { Text } from "react-native";
import { COLORS } from "../../constants/theme";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: "🌙",
    sounds: "🎵",
    assistant: "🤖",
    profile: "👤",
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || "•"}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: COLORS.cardLight,
          borderTopWidth: 0.5,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.mint,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: "助眠库",
          tabBarIcon: ({ focused }) => <TabIcon name="sounds" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "睡眠助手",
          tabBarIcon: ({ focused }) => <TabIcon name="assistant" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "个人中心",
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
      {/* 隐藏旧路由 */}
      <Tabs.Screen name="record" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="tips" options={{ href: null }} />
    </Tabs>
  );
}
