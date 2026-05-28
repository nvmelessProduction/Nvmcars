import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "RoleSelection">;

export function RoleSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 16 }}>
        <View style={{ alignItems: "center", marginTop: 8, marginBottom: 24 }}>
          <Logo size={44} />
        </View>
        <Animated.View entering={FadeInDown.duration(350)}>
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.text }}>
            {t.auth.welcome}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 6, marginBottom: 24 }}>
            {t.auth.chooseRole}
          </Text>
        </Animated.View>

        <View style={{ gap: 14 }}>
          <RoleCard
            emoji="🚗"
            title={t.auth.iAmCustomer}
            description={t.auth.iAmCustomerDesc}
            onPress={() => navigation.navigate("RegisterCustomer")}
            colors={colors}
            delay={80}
          />
          <RoleCard
            emoji="🔧"
            title={t.auth.iAmPro}
            description={t.auth.iAmProDesc}
            badge={t.auth.onlyByInvite}
            onPress={() => navigation.navigate("RegisterProfessional")}
            colors={colors}
            delay={160}
          />
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", paddingBottom: 24, gap: 10 }}>
          <Text style={{ textAlign: "center", color: colors.textMuted }}>
            {t.auth.alreadyAccount}
          </Text>
          <PrimaryButton
            label={t.auth.login}
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function RoleCard({
  emoji,
  title,
  description,
  onPress,
  badge,
  colors,
  delay,
}: {
  emoji: string;
  title: string;
  description: string;
  onPress: () => void;
  badge?: string;
  colors: ReturnType<typeof useColors>;
  delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(350)}>
      <Pressable onPress={onPress}>
        <Card padding={18}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: colors.accentSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 32 }}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              {badge ? (
                <View style={{ flexDirection: "row", marginBottom: 6 }}>
                  <View
                    style={{
                      backgroundColor: colors.accent,
                      paddingHorizontal: 9,
                      paddingVertical: 3,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FFF",
                        fontSize: 10,
                        fontWeight: "800",
                        letterSpacing: 0.3,
                      }}
                    >
                      {badge}
                    </Text>
                  </View>
                </View>
              ) : null}
              <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text }}>
                {title}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                {description}
              </Text>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}
