import { useLayoutEffect } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useQuoteStore } from "@/store/useQuoteStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "PaymentSuccess">;
type Route = RouteProp<HomeStackParamList, "PaymentSuccess">;

export function PaymentSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const colors = useColors();
  const t = useT();
  const quote = useQuoteStore((s) => s.byId(route.params.quoteId));

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <ScreenContainer>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 18,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: colors.success,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 52, color: "#FFF" }}>✓</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={{ alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 26, fontWeight: "900", color: colors.text }}>
            {t.payment.success}
          </Text>
          <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
            {t.payment.successDesc}
          </Text>
        </Animated.View>

        {quote ? (
          <Animated.View entering={FadeInDown.delay(220).duration(400)} style={{ width: "100%" }}>
            <Card padding={18}>
              <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "700" }}>
                IMPORTO PAGATO
              </Text>
              <Text style={{ fontSize: 32, fontWeight: "900", color: colors.accent, marginTop: 4 }}>
                € {quote.total.toFixed(2)}
              </Text>
              {quote.paymentRef ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
                  Ref: {quote.paymentRef}
                </Text>
              ) : null}
            </Card>
          </Animated.View>
        ) : null}

        <View style={{ width: "100%", marginTop: 12 }}>
          <PrimaryButton
            label={t.payment.goToBookings}
            onPress={() => navigation.popToTop()}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
