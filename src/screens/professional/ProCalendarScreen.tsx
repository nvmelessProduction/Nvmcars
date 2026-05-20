import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/i18n";
import { useWorkshopStore, useOwnWorkshop } from "@/store/useWorkshopStore";

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

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISODate(s: string): Date {
  return new Date(s + "T00:00:00");
}

function isDateInVacation(d: Date, from: string, to: string): boolean {
  const day = toISODate(d);
  return day >= from && day <= to;
}

export function ProCalendarScreen() {
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);
  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const addVacation = useWorkshopStore((s) => s.addVacation);
  const removeVacation = useWorkshopStore((s) => s.removeVacation);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [modalOpen, setModalOpen] = useState(false);

  const vacations = workshop?.vacations ?? [];

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month]);
  const monthName = new Date(year, month, 1).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });

  const isPast = (d: Date) => {
    const ref = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d.getTime() < ref.getTime();
  };

  const dayIsClosed = (d: Date) =>
    vacations.some((v) => isDateInVacation(d, v.fromDate, v.toDate));

  const handleToggleDay = (d: Date) => {
    const key = toISODate(d);
    const vac = vacations.find((v) => v.fromDate === key && v.toDate === key);
    if (vac && workshopId) {
      removeVacation(workshopId, vac.id);
    } else if (workshopId && !dayIsClosed(d)) {
      addVacation(workshopId, { fromDate: key, toDate: key });
    }
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
            Tocca un giorno per chiuderlo. Oppure aggiungi un periodo di ferie più lungo.
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
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                textTransform: "capitalize",
              }}
            >
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
                const closed = dayIsClosed(cell);
                const past = isPast(cell);
                const isToday = cell.toDateString() === today.toDateString();
                return (
                  <Pressable
                    key={j}
                    disabled={past}
                    onPress={() => handleToggleDay(cell)}
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

        <Card>
          <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
            🏖️ {t.pro.vacations.toUpperCase()}
          </Text>
          {vacations.length === 0 ? (
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 10 }}>
              Nessun periodo di chiusura programmato.
            </Text>
          ) : (
            <View style={{ marginTop: 10, gap: 8 }}>
              {vacations
                .sort((a, b) => a.fromDate.localeCompare(b.fromDate))
                .map((v) => (
                  <View
                    key={v.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: colors.bgElevated,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                        {v.fromDate === v.toDate
                          ? parseISODate(v.fromDate).toLocaleDateString("it-IT", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                            })
                          : `${parseISODate(v.fromDate).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                            })} → ${parseISODate(v.toDate).toLocaleDateString("it-IT", {
                              day: "2-digit",
                              month: "short",
                            })}`}
                      </Text>
                      {v.reason ? (
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {v.reason}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => workshopId && removeVacation(workshopId, v.id)}
                      hitSlop={8}
                    >
                      <Text style={{ color: colors.danger, fontSize: 18, fontWeight: "700" }}>×</Text>
                    </Pressable>
                  </View>
                ))}
            </View>
          )}
          <Pressable
            onPress={() => setModalOpen(true)}
            style={{
              marginTop: 12,
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1.2,
              borderColor: colors.accent,
              borderStyle: "dashed",
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: "700" }}>+ {t.pro.addVacation}</Text>
          </Pressable>
        </Card>
      </ScrollView>

      <VacationModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(from, to, reason) => {
          if (!workshopId) return;
          addVacation(workshopId, { fromDate: from, toDate: to, reason: reason || undefined });
          setModalOpen(false);
        }}
      />
    </ScreenContainer>
  );
}

function VacationModal({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (from: string, to: string, reason: string) => void;
}) {
  const colors = useColors();
  const t = useT();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (visible) {
      setFrom("");
      setTo("");
      setReason("");
    }
  }, [visible]);

  const validate = (s: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const handleSubmit = () => {
    if (!validate(from) || !validate(to)) {
      Alert.alert("Date non valide", "Inserisci le date nel formato YYYY-MM-DD (es. 2026-08-15).");
      return;
    }
    if (from > to) {
      Alert.alert("Periodo non valido", "La data di inizio deve essere precedente alla fine.");
      return;
    }
    onConfirm(from, to, reason);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              {t.pro.addVacation}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ color: colors.textMuted, fontSize: 22 }}>×</Text>
            </Pressable>
          </View>

          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>
            {t.pro.vacationFrom} (YYYY-MM-DD)
          </Text>
          <TextInput
            value={from}
            onChangeText={setFrom}
            placeholder="2026-08-15"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              fontSize: 16,
              marginBottom: 12,
            }}
          />

          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>
            {t.pro.vacationTo} (YYYY-MM-DD)
          </Text>
          <TextInput
            value={to}
            onChangeText={setTo}
            placeholder="2026-08-22"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              fontSize: 16,
              marginBottom: 12,
            }}
          />

          <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 6 }}>
            {t.pro.vacationReason}
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Ferie estive"
            placeholderTextColor={colors.textMuted}
            style={{
              backgroundColor: colors.bgElevated,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              fontSize: 16,
              marginBottom: 18,
            }}
          />

          <PrimaryButton label={t.common.save} onPress={handleSubmit} />
        </View>
      </View>
    </Modal>
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
