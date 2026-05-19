import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { CITY_DATA, City } from "../data/cities";

const COLORS = {
  bg: "#16213e",
  card: "#1a1a2e",
  accent: "#e94560",
  blue: "#0f3460",
  text: "#eee",
  sub: "#8888aa",
};

interface Props {
  visible: boolean;
  onSelect: (city: City) => void;
  onClose: () => void;
}

export default function CityPicker({ visible, onSelect, onClose }: Props) {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const provinces = CITY_DATA.map((g) => g.province);
  const cities = selectedProvince
    ? CITY_DATA.find((g) => g.province === selectedProvince)?.cities || []
    : [];

  const handleProvinceSelect = (province: string) => {
    setSelectedProvince(province);
  };

  const handleCitySelect = (city: City) => {
    onSelect(city);
    setSelectedProvince(null);
  };

  const handleClose = () => {
    setSelectedProvince(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* 标题栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>取消</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {selectedProvince ? `选择城市` : `选择省份`}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          {/* 面包屑 */}
          {selectedProvince && (
            <TouchableOpacity
              style={styles.breadcrumb}
              onPress={() => setSelectedProvince(null)}
            >
              <Text style={styles.breadcrumbText}>← 返回省份列表</Text>
              <Text style={styles.breadcrumbProvince}>{selectedProvince}</Text>
            </TouchableOpacity>
          )}

          {/* 列表 */}
          <FlatList
            data={selectedProvince ? cities : provinces}
            keyExtractor={(item) =>
              typeof item === "string" ? item : item.name
            }
            renderItem={({ item }) => {
              if (typeof item === "string") {
                // 省份列表
                return (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => handleProvinceSelect(item)}
                  >
                    <Text style={styles.itemText}>{item}</Text>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                );
              }
              // 城市列表
              return (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleCitySelect(item as City)}
                >
                  <Text style={styles.itemText}>{(item as City).name}</Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: COLORS.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4e",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: COLORS.text,
  },
  closeBtn: {
    fontSize: 16,
    color: COLORS.sub,
    width: 50,
  },
  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.card,
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.accent,
  },
  breadcrumbProvince: {
    fontSize: 14,
    color: COLORS.sub,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a3e",
  },
  itemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.sub,
  },
});
