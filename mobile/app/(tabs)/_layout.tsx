import { Tabs } from "expo-router";
import { Text } from "react-native";

const COLORS = {
  bg: "#1a1a2e",
  active: "#e94560",
  inactive: "#8888aa",
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: "🏠",
    record: "📝",
    stats: "📊",
    tips: "💡",
    sounds: "🎵",
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
        headerStyle: { backgroundColor: COLORS.bg },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: "#2a2a4e",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.active,
        tabBarInactiveTintColor: COLORS.inactive,
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
        name="record"
        options={{
          title: "记录",
          tabBarIcon: ({ focused }) => <TabIcon name="record" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "统计",
          tabBarIcon: ({ focused }) => <TabIcon name="stats" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: "建议",
          tabBarIcon: ({ focused }) => <TabIcon name="tips" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="sounds"
        options={{
          title: "音频",
          tabBarIcon: ({ focused }) => <TabIcon name="sounds" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
