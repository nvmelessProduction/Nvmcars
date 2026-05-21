import { useMemo, useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KeyboardAwareScrollView } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useChatStore } from "@/store/useChatStore";
import { useQuoteStore, COMMISSION_PCT } from "@/store/useQuoteStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import type { ProRequestsStackParamList } from "@/navigation/types";
import { searchProducts, AutodocProduct } from "@/services/autodoc";

type Nav = NativeStackNavigationProp<ProRequestsStackParamList, "CreateQuote">;
type Route = RouteProp<ProRequestsStackParamList, "CreateQuote">;

type AutodocAttachment = {
  productId: string;
  brand: string;
  name: string;
  priceCents: number;
  url: string;
};

type DraftLine = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  autodoc?: AutodocAttachment;
};

const newLineId = () => `dl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

export function CreateQuoteScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { conversationId } = route.params;
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const create = useQuoteStore((s) => s.create);
  const send = useChatStore((s) => s.send);
  const conversation = useChatStore((s) =>
    s.conversations.find((c) => c.id === conversationId)
  );

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([
    { id: newLineId(), description: "", quantity: "1", unitPrice: "" },
  ]);
  const [searchingForLine, setSearchingForLine] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<AutodocProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const startProductSearch = async (lineId: string, description: string) => {
    if (!description.trim()) {
      Alert.alert("Aggiungi descrizione", "Scrivi prima il nome del pezzo (es. 'pastiglie freno').");
      return;
    }
    setSearchingForLine(lineId);
    setSearching(true);
    try {
      const products = await searchProducts(description.trim());
      setSearchResults(products);
      if (products.length === 0) {
        Alert.alert("Nessun risultato", "Prova con un termine più generico.");
      }
    } finally {
      setSearching(false);
    }
  };

  const attachProduct = (lineId: string, p: AutodocProduct) => {
    setLines((prev) =>
      prev.map((l) =>
        l.id === lineId
          ? {
              ...l,
              autodoc: {
                productId: p.id,
                brand: p.brand,
                name: p.name,
                priceCents: p.priceCents,
                url: p.url,
              },
            }
          : l
      )
    );
    setSearchingForLine(null);
    setSearchResults([]);
  };

  const detachProduct = (lineId: string) =>
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, autodoc: undefined } : l)));

  const computed = useMemo(() => {
    const subtotal = lines.reduce((acc, l) => {
      const q = Number(l.quantity) || 0;
      const p = Number(l.unitPrice) || 0;
      return acc + q * p;
    }, 0);
    const fee = Math.round(subtotal * COMMISSION_PCT * 100) / 100;
    const total = Math.round((subtotal + fee) * 100) / 100;
    return { subtotal, fee, total };
  }, [lines]);

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { id: newLineId(), description: "", quantity: "1", unitPrice: "" },
    ]);

  const removeLine = (id: string) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));

  const updateLine = (id: string, patch: Partial<DraftLine>) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const onSubmit = () => {
    if (!user || user.role !== "professional" || !conversation) return;
    if (!title.trim()) {
      Alert.alert(t.common.error, "Inserisci un titolo per il preventivo.");
      return;
    }
    const cleanLines = lines
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity) || 0,
        unitPrice: Number(l.unitPrice) || 0,
        autodocProduct: l.autodoc,
      }))
      .filter((l) => l.description && l.quantity > 0 && l.unitPrice > 0);
    if (cleanLines.length === 0) {
      Alert.alert(t.common.error, "Aggiungi almeno una voce con prezzo > 0.");
      return;
    }

    const quote = create({
      workshopId: conversation.workshopId,
      customerId: conversation.customerId,
      conversationId,
      title: title.trim(),
      notes: notes.trim() || undefined,
      lineItems: cleanLines,
    });

    send({
      conversationId,
      senderId: user.id,
      kind: "quote",
      quoteId: quote.id,
      text: `Preventivo: ${quote.title}`,
    });

    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}
      >
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {t.quote.createQuote}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted }}>
            Il cliente riceverà il preventivo in chat e potrà accettarlo + pagare in app.
          </Text>

          <TextField
            label={t.quote.title}
            value={title}
            onChangeText={setTitle}
            placeholder={t.quote.titleHint}
          />

          <TextField
            label={t.quote.notes}
            value={notes}
            onChangeText={setNotes}
            placeholder={t.quote.notesHint}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 8 }}>
              {t.quote.lineItems}
            </Text>
            <View style={{ gap: 10 }}>
              {lines.map((line, idx) => (
                <Card key={line.id} padding={14}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.textMuted }}>
                      VOCE #{idx + 1}
                    </Text>
                    {lines.length > 1 ? (
                      <Pressable onPress={() => removeLine(line.id)} hitSlop={8}>
                        <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "700" }}>
                          Rimuovi
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                  <TextField
                    label={t.quote.description}
                    value={line.description}
                    onChangeText={(v) => updateLine(line.id, { description: v })}
                    placeholder={t.quote.descriptionHint}
                  />
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                    <View style={{ width: 80 }}>
                      <TextField
                        label={t.quote.quantity}
                        value={line.quantity}
                        onChangeText={(v) => updateLine(line.id, { quantity: v.replace(/[^0-9]/g, "") })}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextField
                        label={`${t.quote.unitPrice} (€)`}
                        value={line.unitPrice}
                        onChangeText={(v) => updateLine(line.id, { unitPrice: v.replace(/[^0-9.,]/g, "").replace(",", ".") })}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>

                  {line.autodoc ? (
                    <View style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: colors.bgHeader }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 10, color: "#94A3B8", fontWeight: "800" }}>
                            🔧 PEZZO AUTODOC
                          </Text>
                          <Text style={{ fontSize: 12, color: "#FFF", marginTop: 2 }} numberOfLines={2}>
                            {line.autodoc.brand} · {line.autodoc.name}
                          </Text>
                          <Text style={{ fontSize: 11, color: "#10B981", marginTop: 2, fontWeight: "700" }}>
                            Online: € {(line.autodoc.priceCents / 100).toFixed(2)}
                          </Text>
                        </View>
                        <Pressable onPress={() => detachProduct(line.id)} hitSlop={8}>
                          <Text style={{ color: "#EF4444", fontSize: 11, fontWeight: "700" }}>Rimuovi</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => startProductSearch(line.id, line.description)}
                      style={{
                        marginTop: 10,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderStyle: "dashed",
                        borderColor: colors.border,
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
                        🔧 Cerca pezzo su Autodoc
                      </Text>
                    </Pressable>
                  )}

                  {searchingForLine === line.id ? (
                    <View style={{ marginTop: 10, gap: 6 }}>
                      <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.6 }}>
                        {searching ? "RICERCA…" : `${searchResults.length} RISULTATI`}
                      </Text>
                      {searchResults.slice(0, 5).map((p) => (
                        <Pressable
                          key={p.id}
                          onPress={() => attachProduct(line.id, p)}
                          style={{ padding: 10, borderRadius: 10, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border }}
                        >
                          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                            <Text style={{ fontSize: 12, color: colors.text, flex: 1, marginRight: 8 }} numberOfLines={2}>
                              {p.brand} · {p.name}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: "800", color: colors.text }}>
                              € {(p.priceCents / 100).toFixed(2)}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                      <Pressable onPress={() => { setSearchingForLine(null); setSearchResults([]); }} style={{ alignItems: "center", paddingTop: 4 }}>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>Annulla ricerca</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </Card>
              ))}
            </View>

            <Pressable
              onPress={addLine}
              style={{
                marginTop: 10,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>
                + {t.quote.addLineItem}
              </Text>
            </Pressable>
          </View>

          <Card padding={16}>
            <Row label={t.quote.subtotal} value={`€ ${computed.subtotal.toFixed(2)}`} colors={colors} />
            <Row
              label={`${t.quote.commissionFee} (${(COMMISSION_PCT * 100).toFixed(0)}%)`}
              value={`€ ${computed.fee.toFixed(2)}`}
              colors={colors}
              sub
            />
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 8,
              }}
            />
            <Row
              label={t.quote.total}
              value={`€ ${computed.total.toFixed(2)}`}
              colors={colors}
              strong
            />
            <Text
              style={{
                fontSize: 11,
                color: colors.textMuted,
                marginTop: 8,
                lineHeight: 16,
              }}
            >
              {t.quote.commissionFeeNote}
            </Text>
          </Card>

          <PrimaryButton label={t.quote.sendToCustomer} onPress={onSubmit} />
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
}

function Row({
  label,
  value,
  colors,
  sub,
  strong,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
  sub?: boolean;
  strong?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: sub ? 4 : 6,
      }}
    >
      <Text
        style={{
          fontSize: strong ? 16 : 14,
          fontWeight: strong ? "800" : sub ? "500" : "600",
          color: sub ? colors.textMuted : colors.text,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: strong ? 20 : 15,
          fontWeight: strong ? "900" : "700",
          color: strong ? colors.accent : colors.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}
