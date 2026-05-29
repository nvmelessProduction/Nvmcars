import { useEffect, useState } from "react";
import { Alert, Pressable, Share, Text, View, ScrollView, TextInput } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useColors } from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { track } from "@/lib/analytics";

type Stats = {
  code: string;
  usesRemaining: number;
  totalRedemptions: number;
};

export function ReferralScreen() {
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Cerca o crea il codice
      let { data: existing } = await supabase
        .from("referral_codes")
        .select("code, uses_remaining")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (!existing) {
        const newCode = generateCode();
        const { data: created, error } = await supabase
          .from("referral_codes")
          .insert({
            code: newCode,
            owner_user_id: user.id,
            type: user.role === "professional" ? "pro" : "customer",
            uses_remaining: 100,
            reward_credit_cents: 500,
          })
          .select("code, uses_remaining")
          .single();
        if (!error && created) existing = created;
      }

      if (!existing) return;

      const { count } = await supabase
        .from("referral_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("code", existing.code);

      setStats({
        code: existing.code,
        usesRemaining: existing.uses_remaining,
        totalRedemptions: count ?? 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!stats) return;
    try {
      await Share.share({
        message: `Usa il mio codice Nvmcars: ${stats.code} — ottieni 5€ di credito alla prima richiesta.\n\nScarica l'app: https://nvmcars.it`,
        title: "Nvmcars",
      });
    } catch {
      /* user cancel */
    }
  };

  const handleRedeem = async () => {
    if (!inputCode.trim()) return;
    if (!isSupabaseConfigured) {
      Alert.alert("Modalità offline", "Riprova quando sei online.");
      return;
    }
    setRedeemBusy(true);
    try {
      const { data, error } = await supabase.rpc("redeem_referral_code", {
        p_code: inputCode.trim().toUpperCase(),
      });
      if (error) {
        Alert.alert("Errore", error.message);
        return;
      }
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.success) {
        const reasonMap: Record<string, string> = {
          not_found: "Codice non trovato.",
          self_referral: "Non puoi usare il tuo codice.",
          expired: "Codice scaduto.",
          no_uses_left: "Codice esaurito.",
          already_redeemed: "Hai già usato un codice referral.",
          unauthorized: "Devi essere loggato.",
        };
        Alert.alert("Codice non valido", reasonMap[row?.reason] ?? row?.reason ?? "Errore");
        return;
      }
      track("referral_redeemed", { credit: row.reward_credit_cents });
      Alert.alert("✅ Riscattato", `Hai ricevuto ${(row.reward_credit_cents / 100).toFixed(2)}€ di credito.`);
      setInputCode("");
    } finally {
      setRedeemBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "900", color: colors.text }}>
            🎁 Invita amici
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19, marginTop: 4 }}>
            Per ogni amico che scarica l&apos;app e fa la prima richiesta, ricevi 5€ di credito.
          </Text>
        </View>

        {stats ? (
          <Card padding={20}>
            <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "800", letterSpacing: 0.6, marginBottom: 8 }}>
              IL TUO CODICE
            </Text>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: colors.accent,
                letterSpacing: 2,
                fontVariant: ["tabular-nums"],
              }}
              selectable
            >
              {stats.code}
            </Text>
            <View style={{ flexDirection: "row", gap: 20, marginTop: 12 }}>
              <View>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700" }}>USATI</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>{stats.totalRedemptions}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700" }}>RESTANTI</Text>
                <Text style={{ fontSize: 18, fontWeight: "900", color: colors.text }}>{stats.usesRemaining}</Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              <PrimaryButton label="Condividi" icon="📤" onPress={handleShare} />
            </View>
          </Card>
        ) : (
          <Card>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {loading ? "Carico il tuo codice…" : "Codice non disponibile."}
            </Text>
          </Card>
        )}

        <Card padding={16}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: colors.text, marginBottom: 8 }}>
            Hai un codice da riscattare?
          </Text>
          <TextInput
            value={inputCode}
            onChangeText={(v) => setInputCode(v.toUpperCase())}
            placeholder="CODICE-AMICO"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="characters"
            style={{
              backgroundColor: colors.bgElevated,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 16,
              color: colors.text,
              fontFamily: "monospace",
              letterSpacing: 2,
            }}
          />
          <View style={{ marginTop: 10 }}>
            <PrimaryButton
              label="Riscatta"
              variant="secondary"
              onPress={handleRedeem}
              disabled={!inputCode.trim() || redeemBusy}
              loading={redeemBusy}
            />
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // niente 0/O/1/I per leggibilità
  let out = "NVM-";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
