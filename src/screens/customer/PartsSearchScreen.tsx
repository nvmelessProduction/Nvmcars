import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/store/useThemeStore";
import { useCarStore } from "@/store/useCarStore";
import { useAuthStore } from "@/store/useAuthStore";
import { searchProducts, trackAndOpen, AutodocProduct } from "@/services/autodoc";

export function PartsSearchScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const cars = useCarStore((s) => s.cars);
  const myCar = cars[0]; // best guess: prima auto registrata
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<AutodocProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const carHint = useMemo(() => {
    if (!myCar) return undefined;
    return { make: myCar.make, model: myCar.model, year: myCar.year };
  }, [myCar]);

  const runSearch = async () => {
    if (query.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const results = await searchProducts(query.trim(), carHint);
      setProducts(results);
    } finally {
      setLoading(false);
    }
  };

  const openProduct = async (p: AutodocProduct) => {
    const url = await trackAndOpen({
      product: p,
      context: "search",
    });
    Linking.openURL(url).catch(() => undefined);
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <Card padding={16}>
          <Text style={{ fontSize: 20, fontWeight: "900", color: colors.text }}>
            🔧 Ricambi auto
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Cerca pezzi compatibili con la tua auto. Acquisto su Autodoc (sito ufficiale, garanzia 2 anni).
          </Text>
          {myCar ? (
            <View style={{ marginTop: 10, padding: 10, borderRadius: 10, backgroundColor: colors.bgHeader }}>
              <Text style={{ fontSize: 11, color: "#FFF", fontWeight: "700", marginBottom: 2 }}>
                AUTO CORRENTE
              </Text>
              <Text style={{ fontSize: 14, color: "#FFF" }}>
                {myCar.make} {myCar.model} {myCar.year}
              </Text>
            </View>
          ) : null}
        </Card>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="es. pastiglie freno"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={runSearch}
            returnKeyType="search"
            style={{
              flex: 1,
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.text,
            }}
          />
          <Pressable
            onPress={runSearch}
            style={{
              backgroundColor: colors.accent,
              borderRadius: 14,
              paddingHorizontal: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "900" }}>🔍</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 30, alignItems: "center" }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}

        {!loading && searched && products.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="Nessun ricambio trovato"
            body="Prova con una parola diversa, oppure cerca un pezzo più generico (es. solo 'pastiglie')."
          />
        ) : null}

        {products.map((p) => (
          <Pressable key={p.id} onPress={() => openProduct(p)}>
            <Card padding={14}>
              <View style={{ flexDirection: "row", gap: 12 }}>
                {p.imageUrl ? (
                  <Image
                    source={{ uri: p.imageUrl }}
                    style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: colors.bgHeader }}
                  />
                ) : (
                  <View style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: colors.bgHeader, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 28 }}>📦</Text>
                  </View>
                )}
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700" }}>
                      {p.brand.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text, fontWeight: "600", marginTop: 2 }} numberOfLines={2}>
                      {p.name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 16, fontWeight: "900", color: colors.text }}>
                      {(p.priceCents / 100).toFixed(2)} €
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.accent, fontWeight: "700" }}>
                      Acquista →
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}

        {products.length > 0 ? (
          <Text style={{ fontSize: 10, color: colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 14 }}>
            Acquisti gestiti da Autodoc.it. Nvmcars riceve una commissione di affiliazione
            (non aumenta il prezzo per te).
          </Text>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
