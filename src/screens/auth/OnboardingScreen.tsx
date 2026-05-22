import { useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Logo } from "@/components/Logo";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/i18n";
import type { AuthStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Onboarding">;

const { width } = Dimensions.get("window");

type Slide = {
  emoji: string;
  titleKey: "slide1Title" | "slide2Title" | "slide3Title" | "slide4Title";
  bodyKey: "slide1Body" | "slide2Body" | "slide3Body" | "slide4Body";
};

const SLIDES: Slide[] = [
  { emoji: "🔍", titleKey: "slide1Title", bodyKey: "slide1Body" },
  { emoji: "🚗", titleKey: "slide2Title", bodyKey: "slide2Body" },
  { emoji: "💬", titleKey: "slide3Title", bodyKey: "slide3Body" },
  { emoji: "🚀", titleKey: "slide4Title", bodyKey: "slide4Body" },
];

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const finishOnboarding = useAuthStore((s) => s.finishOnboarding);
  const t = useT();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finishOnboarding();
      navigation.replace("RoleSelection");
    }
  };

  const skip = () => {
    finishOnboarding();
    navigation.replace("RoleSelection");
  };

  return (
    <ScreenContainer dark>
      <View style={{ flex: 1, paddingTop: 8 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Logo size={36} tone="light" />
          <Pressable onPress={skip} hitSlop={8}>
            <Text style={{ color: "#CBD5E1", fontSize: 15, fontWeight: "600" }}>
              {t.onboarding.skip}
            </Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(_, i) => `slide-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <View style={{ width, paddingHorizontal: 28, alignItems: "center", justifyContent: "center" }}>
              <Animated.Text entering={FadeIn.duration(450)} style={{ fontSize: 110 }}>
                {item.emoji}
              </Animated.Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#FFFFFF",
                  textAlign: "center",
                  marginTop: 32,
                }}
              >
                {t.onboarding[item.titleKey]}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: "#CBD5E1",
                  textAlign: "center",
                  marginTop: 14,
                  lineHeight: 24,
                }}
              >
                {t.onboarding[item.bodyKey]}
              </Text>
            </View>
          )}
        />

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 16 }}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === index ? "#22D3EE" : "#334155",
              }}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
          <PrimaryButton
            label={index === SLIDES.length - 1 ? t.onboarding.start : t.onboarding.next}
            onPress={goNext}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}
