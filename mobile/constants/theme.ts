// SleepWell 治愈系主题配置
// 核心定位：低刺激、慢节奏、轻视觉、强治愈

export const COLORS = {
  // 夜间模式主色（默认）
  bg: "#1A1928",           // 深空柔黑 - 护眼不暗沉
  card: "#232238",         // 卡片底色 - 微微提亮
  cardLight: "#2C2B45",    // 浅色卡片

  // 主色调
  primary: "#5A5480",      // 静谧柔紫 - 助眠减压
  primaryLight: "#7B74A8", // 柔紫浅色
  primaryDark: "#3D3860",  // 柔紫深色

  // 点缀色
  mint: "#7EC8B8",         // 浅薄荷绿 - 舒缓
  coral: "#E8A0A0",        // 淡珊瑚粉 - 温暖
  apricot: "#F0C8A0",      // 暖柔杏色 - 柔和
  sky: "#8EB8D8",          // 雾感浅青蓝

  // 文字色（拒绝纯黑纯白）
  text: "#D8D8E8",         // 主文字 - 柔和浅色
  textSecondary: "#9999AA", // 次级文字
  textMuted: "#666680",    // 辅助提示

  // 功能色
  success: "#7EC8B8",
  warning: "#F0C8A0",
  error: "#E8A0A0",
};

export const SIZES = {
  // 圆角
  radiusSmall: 12,
  radiusMedium: 20,
  radiusLarge: 28,
  radiusXLarge: 36,

  // 间距
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // 字号
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 20,
  hero: 32,
  display: 44,
};

export const FONTS = {
  regular: { fontWeight: "400" as const },
  medium: { fontWeight: "500" as const },
  semibold: { fontWeight: "600" as const },
  bold: { fontWeight: "700" as const },
};
