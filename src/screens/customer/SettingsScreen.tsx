import { Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { useThemeStore, useColors, type ThemeMode } from "@/store/useThemeStore";
import { useLanguageStore, type Locale } from "@/store/useLanguageStore";
import { useT } from "@/i18n";

export function SettingsScreen() {
  const colors = useColors();
  const t = useT();
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const locale = useLanguageStore((s) => s.locale);
  const setLocale = useLanguageStore((s) => s.setLocale);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <SectionTitle title={t.settings.appearance} colors={colors} />
        <Card>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 10 }}>
            {t.settings.theme}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(
              [
                { v: "auto" as ThemeMode, label: t.settings.themeAuto, icon: "🌓" },
                { v: "light" as ThemeMode, label: t.settings.themeLight, icon: "☀️" },
                { v: "dark" as ThemeMode, label: t.settings.themeDark, icon: "🌙" },
              ]
            ).map(({ v, label, icon }) => {
              const active = themeMode === v;
              return (
                <Pressable
                  key={v}
                  onPress={() => setThemeMode(v)}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: active ? colors.accent : colors.bg,
                    borderWidth: 1,
                    borderColor: active ? colors.accent : colors.border,
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{icon}</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: active ? "#FFF" : colors.text,
                      fontWeight: "700",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <SectionTitle title={t.settings.language} colors={colors} />
        <Card>
          {([
            { v: "it" as Locale, label: t.settings.italian, flag: "🇮🇹" },
            { v: "en" as Locale, label: t.settings.english, flag: "🇬🇧" },
          ]).map(({ v, label, flag }, idx) => {
            const active = locale === v;
            return (
              <Pressable
                key={v}
                onPress={() => setLocale(v)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 12,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 24 }}>{flag}</Text>
                <Text style={{ flex: 1, fontSize: 15, color: colors.text, fontWeight: "600" }}>
                  {label}
                </Text>
                <Text style={{ fontSize: 18 }}>
                  {active ? "✅" : "  "}
                </Text>
              </Pressable>
            );
          })}
        </Card>

        <SectionTitle title={t.settings.about} colors={colors} />
        <Card>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{t.settings.version}</Text>
            <Text style={{ fontSize: 13, color: colors.text, fontWeight: "600" }}>0.2.0</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function SectionTitle({
  title,
  colors,
}: {
  title: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 1,
        color: colors.textMuted,
        marginTop: 6,
      }}
    >
      {title.toUpperCase()}
    </Text>
  );
}
