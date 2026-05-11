import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";

const DAYS_OF_WEEK = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

function getMonthMatrix(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

export function ProCalendarScreen() {
  const colors = useColors();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [closedDays, setClosedDays] = useState<string[]>([]);

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthName = new Date(year, month, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const isPast = (d: Date) => {
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d.getTime() < t.getTime();
  };

  const toggle = (d: Date) => {
    const key = d.toISOString().slice(0, 10);
    setClosedDays((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSave = () => {
    Alert.alert(
      "Disponibilità aggiornata",
      `${closedDays.length} giorno/i contrassegnati come chiusi.`
    );
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
            Tocca un giorno per marcarlo come chiuso. I clienti non potranno prenotare in quei
            giorni.
          </Text>
        </Card>

        <Card>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Pressable onPress={prev} hitSlop={8}>
              <Text style={{ fontSize: 26, color: colors.text }}>‹</Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, textTransform: "capitalize" }}>
              {monthName}
            </Text>
            <Pressable onPress={next} hitSlop={8}>
              <Text style={{ fontSize: 26, color: colors.text }}>›</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row" }}>
            {DAYS_OF_WEEK.map((d) => (
              <Text
                key={d}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  color: colors.textMuted,
                  fontWeight: "700",
                  marginBottom: 6,
                }}
              >
                {d}
              </Text>
            ))}
          </View>

          {matrix.map((row, i) => (
            <View key={i} style={{ flexDirection: "row", marginBottom: 6 }}>
              {row.map((cell, j) => {
                if (!cell) return <View key={j} style={{ flex: 1, aspectRatio: 1 }} />;
                const key = cell.toISOString().slice(0, 10);
                const closed = closedDays.includes(key);
                const past = isPast(cell);
                const isToday = cell.toDateString() === today.toDateString();
                return (
                  <Pressable
                    key={j}
                    onPress={() => !past && toggle(cell)}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                      backgroundColor: closed ? colors.danger : "transparent",
                      borderWidth: isToday ? 2 : 0,
                      borderColor: colors.accent,
                      opacity: past ? 0.35 : 1,
                      margin: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: closed ? "#FFF" : colors.text,
                        fontWeight: isToday ? "800" : "600",
                      }}
                    >
                      {cell.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Card>

        <View style={{ flexDirection: "row", gap: 16, justifyContent: "center" }}>
          <Legend label="Aperto" color={colors.bgElevated} border={colors.border} colors={colors} />
          <Legend label="Chiuso" color={colors.danger} colors={colors} />
          <Legend label="Oggi" color={colors.bgElevated} border={colors.accent} colors={colors} />
        </View>

        <PrimaryButton label="Salva disponibilità" icon="💾" onPress={handleSave} />
      </ScrollView>
    </ScreenContainer>
  );
}

function Legend({
  label,
  color,
  border,
  colors,
}: {
  label: string;
  color: string;
  border?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          backgroundColor: color,
          borderWidth: border ? 2 : 0,
          borderColor: border,
        }}
      />
      <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}
