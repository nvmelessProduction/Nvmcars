import { useMemo, useState } from "react";
import { FlatList, Pressable, Share, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { useColors } from "@/store/useThemeStore";
import { INVITE_CODES, type InviteCode } from "@/data/inviteCodes";

type Filter = "all" | "free" | "used";

export function AdminInviteCodesScreen() {
  const colors = useColors();
  const [filter, setFilter] = useState<Filter>("all");

  const codes = useMemo(() => {
    if (filter === "free") return INVITE_CODES.filter((c) => !c.used);
    if (filter === "used") return INVITE_CODES.filter((c) => c.used);
    return INVITE_CODES;
  }, [filter]);

  const freeCount = INVITE_CODES.filter((c) => !c.used).length;

  const shareCode = (c: InviteCode) => {
    Share.share({
      message: `Ciao! Registra la tua officina su Nvmcars con questo codice invito: ${c.code}`,
    }).catch(() => undefined);
  };

  return (
    <ScreenContainer>
      <FlatList
        data={codes}
        keyExtractor={(c) => c.code}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 96 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Card padding={16}>
              <Text style={{ fontSize: 13, color: colors.textMuted }}>
                Codici invito disponibili
              </Text>
              <Text style={{ fontSize: 28, fontWeight: "900", color: colors.accent, marginTop: 4 }}>
                {freeCount} / {INVITE_CODES.length}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                Condividi un codice libero con una nuova officina per farla registrare.
              </Text>
            </Card>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["all", "free", "used"] as Filter[]).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor: filter === f ? colors.accent : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: filter === f ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: filter === f ? "#FFFFFF" : colors.text,
                    }}
                  >
                    {f === "all" ? "Tutti" : f === "free" ? "Liberi" : "Usati"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card padding={16}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: colors.text,
                    letterSpacing: 1,
                  }}
                >
                  {item.code}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Zona {item.region}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: item.used ? colors.border : colors.accentSoft,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "800",
                    color: item.used ? colors.textMuted : colors.accent,
                  }}
                >
                  {item.used ? "USATO" : "LIBERO"}
                </Text>
              </View>
              {!item.used ? (
                <Pressable onPress={() => shareCode(item)} hitSlop={8}>
                  <Text style={{ fontSize: 22 }}>📤</Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
