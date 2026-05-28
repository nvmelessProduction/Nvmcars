import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { KAV } from "@/components/KAV";
import { useBookingsStore } from "@/store/useBookingsStore";
import { notifyEvent } from "@/store/useNotificationsStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { getServiceLabel } from "@/data/services";
import type { BookingSlot } from "@/types";
import type { ProRequestsStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProRequestsStackParamList, "ProProposeSlots">;
type Route = RouteProp<ProRequestsStackParamList, "ProProposeSlots">;

type DraftSlot = {
  date: number;
  time: string;
  duration: number;
};

const DURATIONS = [
  { v: 30, label: "30 min" },
  { v: 60, label: "1 ora" },
  { v: 90, label: "1h 30" },
  { v: 120, label: "2 ore" },
  { v: 180, label: "3 ore" },
  { v: 240, label: "4 ore" },
];

const TIMES = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "14:00", "14:30", "15:00",
  "15:30", "16:00", "16:30", "17:00", "17:30", "18:00",
];

function formatDateChip(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  if (daysOffset === 0) return "Oggi";
  if (daysOffset === 1) return "Domani";
  return d.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "short" });
}

function combineDateTime(daysOffset: number, time: string): number {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  d.setHours(h ?? 9, m ?? 0, 0, 0);
  return d.getTime();
}

export function ProProposeSlotsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { bookingId } = route.params;
  const colors = useColors();
  const t = useT();
  const booking = useBookingsStore((s) => s.bookings.find((b) => b.id === bookingId));
  const proposeSlots = useBookingsStore((s) => s.proposeSlots);

  const [slots, setSlots] = useState<DraftSlot[]>([]);
  const [draftDate, setDraftDate] = useState(1);
  const [draftTime, setDraftTime] = useState("09:00");
  const [draftDuration, setDraftDuration] = useState(60);
  const [note, setNote] = useState("");

  const dateOptions = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7], []);

  const handleAddSlot = () => {
    if (slots.length >= 5) {
      Alert.alert("Massimo 5 orari", "Hai raggiunto il numero massimo di proposte.");
      return;
    }
    const newSlot: DraftSlot = { date: draftDate, time: draftTime, duration: draftDuration };
    const startAt = combineDateTime(newSlot.date, newSlot.time);
    if (slots.some((s) => combineDateTime(s.date, s.time) === startAt)) {
      Alert.alert("Orario già aggiunto", "Hai già proposto questo slot.");
      return;
    }
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!booking) return;
    if (slots.length === 0) {
      Alert.alert("Aggiungi almeno un orario", "Proponi almeno una disponibilità.");
      return;
    }
    const final: BookingSlot[] = slots
      .map((s, i) => ({
        id: `slot-${Date.now()}-${i}`,
        startAt: combineDateTime(s.date, s.time),
        durationMinutes: s.duration,
      }))
      .sort((a, b) => a.startAt - b.startAt);
    proposeSlots(booking.id, final, note.trim() || undefined);
    notifyEvent({
      userId: booking.customerId,
      type: "booking_slot_proposed",
      title: "Orari proposti dall'officina",
      body: `L'officina ti propone ${final.length} orari per ${getServiceLabel(booking.service)}.`,
      relatedId: booking.id,
      relatedKind: "booking",
    });
    Alert.alert("Proposta inviata", "Il cliente è stato avvisato. Riceverai conferma al più presto.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  if (!booking) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.textMuted }}>Richiesta non trovata.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KAV style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
        >
          <Card>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>
              📅 {t.pro.proposeSlots}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 }}>
              {t.pro.proposeSlotsSubtitle}. Servizio: <Text style={{ fontWeight: "700" }}>{getServiceLabel(booking.service)}</Text>.
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              {t.pro.slotDate.toUpperCase()}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {dateOptions.map((d) => (
                  <Pressable
                    key={d}
                    onPress={() => setDraftDate(d)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: draftDate === d ? colors.accent : colors.bgElevated,
                      borderWidth: 1,
                      borderColor: draftDate === d ? colors.accent : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: draftDate === d ? "#FFF" : colors.text,
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {formatDateChip(d)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text
              style={{
                fontSize: 11,
                color: colors.textMuted,
                fontWeight: "700",
                letterSpacing: 0.8,
                marginTop: 14,
              }}
            >
              {t.pro.slotTime.toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {TIMES.map((time) => (
                <Pressable
                  key={time}
                  onPress={() => setDraftTime(time)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: draftTime === time ? colors.text : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: draftTime === time ? colors.text : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: draftTime === time ? colors.bg : colors.text,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text
              style={{
                fontSize: 11,
                color: colors.textMuted,
                fontWeight: "700",
                letterSpacing: 0.8,
                marginTop: 14,
              }}
            >
              {t.pro.slotDuration.toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d.v}
                  onPress={() => setDraftDuration(d.v)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: draftDuration === d.v ? colors.text : colors.bgElevated,
                    borderWidth: 1,
                    borderColor: draftDuration === d.v ? colors.text : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: draftDuration === d.v ? colors.bg : colors.text,
                      fontWeight: "700",
                      fontSize: 13,
                    }}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={handleAddSlot}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: colors.accent,
                borderStyle: "dashed",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "800" }}>
                + {t.pro.addSlot}
              </Text>
            </Pressable>
          </Card>

          {slots.length > 0 ? (
            <Card>
              <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                ORARI PROPOSTI ({slots.length}/5)
              </Text>
              <View style={{ gap: 8, marginTop: 10 }}>
                {slots.map((s, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: colors.bgElevated,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                        {formatDateChip(s.date)} ore {s.time}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                        Durata: {DURATIONS.find((d) => d.v === s.duration)?.label}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveSlot(i)} hitSlop={10}>
                      <Text style={{ color: colors.danger, fontWeight: "700", fontSize: 18 }}>×</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          <Card>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
              NOTA AL CLIENTE (FACOLTATIVA)
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="es. Porta libretto, paga in officina, ecc."
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                marginTop: 10,
                minHeight: 60,
                fontSize: 14,
                color: colors.text,
                padding: 10,
                borderRadius: 10,
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: colors.border,
                textAlignVertical: "top",
              }}
            />
          </Card>

          <PrimaryButton
            label={t.pro.sendProposal}
            icon="📤"
            onPress={handleSubmit}
            disabled={slots.length === 0}
          />
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}
