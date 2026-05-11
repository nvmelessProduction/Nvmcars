import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { ServiceChip } from "@/components/ServiceChip";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { HOME_SERVICES } from "@/data/services";
import { useAuthStore } from "@/store/useAuthStore";
import { useActiveCar } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "Home">;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const car = useActiveCar();
  const firstName = user?.name?.split(" ")[0] ?? "ciao";

  return (
    <ScreenContainer dark>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View
          style={{
            backgroundColor: "#0F172A",
            paddingHorizontal: 22,
            paddingTop: 48,
            paddingBottom: 36,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ color: "#CBD5E1", fontSize: 13 }}>{t.home.hello},</Text>
              <Text style={{ color: "#FFF", fontSize: 24, fontWeight: "800" }}>
                {firstName} 👋
              </Text>
            </View>
          </View>

          <Animated.View entering={FadeInDown.delay(80).duration(400)} style={{ marginTop: 28 }}>
            <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800", lineHeight: 34 }}>
              {t.home.needCheck}
            </Text>
            <Text style={{ color: "#94A3B8", marginTop: 10, fontSize: 14, lineHeight: 20 }}>
              {t.home.invisible}
            </Text>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: -16 }}>
          <Animated.View entering={FadeIn.delay(120).duration(400)}>
            <Pressable
              onPress={() => navigation.navigate("MyCar")}
              style={{
                backgroundColor: car ? colors.bgElevated : colors.accent,
                borderRadius: 18,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                borderWidth: 1,
                borderColor: car ? colors.border : colors.accent,
              }}
            >
              <Text style={{ fontSize: 32 }}>🚗</Text>
              <View style={{ flex: 1 }}>
                {car ? (
                  <>
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                      {t.home.myCar.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                      {car.nickname ?? `${car.make} ${car.model}`}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {car.plate} · {car.make} {car.model} · {car.year}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: "700", letterSpacing: 0.8 }}>
                      NUOVO
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "800", color: "#FFF" }}>
                      {t.home.addCar}
                    </Text>
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
                      {t.home.addCarHint}
                    </Text>
                  </>
                )}
              </View>
              <Text style={{ fontSize: 20, color: car ? colors.textMuted : "#FFF" }}>›</Text>
            </Pressable>
          </Animated.View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
            {t.home.whatNow}
          </Text>
          <View style={{ gap: 12 }}>
            {[0, 2, 4].map((start) => (
              <View key={start} style={{ flexDirection: "row", gap: 12 }}>
                {HOME_SERVICES.slice(start, start + 2).map((service) => (
                  <ServiceChip
                    key={service.key}
                    service={service}
                    onPress={() => navigation.navigate("WorkshopList", { service: service.key })}
                  />
                ))}
              </View>
            ))}
          </View>

          <View style={{ marginTop: 6 }}>
            <PrimaryButton
              label={t.home.nearMe}
              icon="📍"
              variant="secondary"
              onPress={() => navigation.navigate("WorkshopList")}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
