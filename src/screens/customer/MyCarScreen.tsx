import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useCarStore } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { CATEGORY_LABEL } from "@/data/carBrands";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "MyCar">;

export function MyCarScreen() {
  const navigation = useNavigation<Nav>();
  const t = useT();
  const colors = useColors();
  const cars = useCarStore((s) => s.cars);
  const activeCarId = useCarStore((s) => s.activeCarId);
  const setActive = useCarStore((s) => s.setActiveCar);
  const removeCar = useCarStore((s) => s.removeCar);

  const confirmRemove = (id: string, name: string) => {
    Alert.alert(
      "Rimuovere auto?",
      `Vuoi davvero rimuovere ${name}?`,
      [
        { text: t.common.cancel, style: "cancel" },
        { text: t.common.delete, style: "destructive", onPress: () => removeCar(id) },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: 16 }}>
        {cars.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <EmptyState
              emoji="🚗"
              title={t.home.addCar}
              body={t.home.addCarHint}
            />
            <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
              <PrimaryButton
                label={t.home.addCar}
                icon="➕"
                onPress={() => navigation.navigate("AddCar")}
              />
            </View>
          </View>
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => {
              const isActive = item.id === activeCarId;
              return (
                <Pressable onPress={() => setActive(item.id)}>
                  <Card style={{ borderColor: isActive ? colors.accent : colors.border, borderWidth: 2 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 1 }}>
                          {item.plate}
                        </Text>
                        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 4 }}>
                          {item.nickname ?? `${item.make} ${item.model}`}
                        </Text>
                        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
                          {item.make} {item.model} · {item.year}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                          <Pill text={t.car[item.fuel]} colors={colors} />
                          <Pill text={`${item.displacement}cc`} colors={colors} />
                          <Pill text={CATEGORY_LABEL[item.category]} colors={colors} />
                        </View>
                      </View>
                      <Pressable
                        onPress={() => confirmRemove(item.id, item.nickname ?? `${item.make} ${item.model}`)}
                        hitSlop={8}
                      >
                        <Text style={{ fontSize: 18 }}>🗑️</Text>
                      </Pressable>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 12,
                        alignItems: "center",
                      }}
                    >
                      {isActive ? (
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            backgroundColor: colors.accent,
                            borderRadius: 12,
                          }}
                        >
                          <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>
                            ATTIVA
                          </Text>
                        </View>
                      ) : null}
                      <Pressable
                        onPress={() => navigation.navigate("CarServiceLog", { carId: item.id })}
                        hitSlop={6}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.bgElevated,
                        }}
                      >
                        <Text style={{ color: colors.text, fontSize: 11, fontWeight: "700" }}>
                          📋 {t.car.serviceLog}
                        </Text>
                      </Pressable>
                    </View>
                  </Card>
                </Pressable>
              );
            }}
            ListFooterComponent={
              <View style={{ marginTop: 12 }}>
                <PrimaryButton
                  label={t.home.addCar}
                  variant="ghost"
                  icon="➕"
                  onPress={() => navigation.navigate("AddCar")}
                />
              </View>
            }
          />
        )}
      </View>
    </ScreenContainer>
  );
}

function Pill({ text, colors }: { text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        backgroundColor: colors.accentSoft,
      }}
    >
      <Text style={{ fontSize: 11, color: colors.text, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}
