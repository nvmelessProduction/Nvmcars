import { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KeyboardAwareScrollView } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useWorkshopStore, useOwnWorkshop } from "@/store/useWorkshopStore";
import {
  validateCAP,
  validateMinLength,
  validateNotEmpty,
  validatePhoneIT,
  validateProvince,
} from "@/utils/validators";
import { geocodeAddress } from "@/utils/geocode";
import { pickFromGallery } from "@/utils/mediaPicker";
import { isSupabaseConfigured } from "@/lib/supabase";
import { ensureMyWorkshop } from "@/services/workshops";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ProEditWorkshopScreen() {
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);
  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const updateWorkshop = useWorkshopStore((s) => s.updateWorkshop);
  const hydrateWorkshopById = useWorkshopStore((s) => s.hydrateById);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  // AUTO-RIPARAZIONE: se l'account pro non ha un'officina valida collegata
  // (workshopId vuoto o non-UUID, tipico degli account creati prima del fix),
  // la cerca/crea sul backend e aggiorna l'utente. Risolve da solo l'errore
  // "Officina non trovata" senza che l'utente faccia nulla.
  useEffect(() => {
    if (!user || user.role !== "professional" || !isSupabaseConfigured) return;
    if (workshopId && UUID_RE.test(workshopId)) return; // già a posto
    const proUser = user; // narrowed to ProfessionalUser
    let active = true;
    ensureMyWorkshop(proUser.id)
      .then((res) => {
        if (active && res.id) {
          setUser({ ...proUser, workshopId: res.id });
          hydrateWorkshopById(res.id).catch(() => undefined);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user, workshopId, setUser, hydrateWorkshopById]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cap, setCap] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!workshop) return;
    setName(workshop.name ?? "");
    setAddress(workshop.address ?? "");
    setCap(workshop.cap ?? "");
    setCity(workshop.city ?? "");
    setProvince(workshop.province ?? "");
    setPhone(workshop.phone ?? "");
    setDescription(workshop.description ?? "");
    setPhotos(workshop.photos ?? (workshop.photo ? [workshop.photo] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workshop?.id]); // intentional: reset form only when a different workshop is loaded

  const handleSave = async () => {
    const checks: ({ ok: true } | { ok: false; reason: string })[] = [
      validateMinLength(name, 3, "Nome officina"),
      validateMinLength(address, 5, "Indirizzo"),
      validateCAP(cap),
      validateNotEmpty(city, "Città"),
      validateProvince(province),
      validatePhoneIT(phone),
      validateMinLength(description, 30, "Descrizione"),
    ];
    for (const c of checks) {
      if (!c.ok) {
        Alert.alert(t.common.error, c.reason);
        return;
      }
    }
    if (photos.length < 1) {
      Alert.alert(t.common.error, "Aggiungi almeno una foto dell'officina");
      return;
    }
    setSaving(true);
    // Risolvi un id officina VALIDO (UUID). Se manca o non è valido (account
    // creato prima del fix), prova a ripararlo al volo cercando/creando
    // l'officina sul backend e collegandola al profilo.
    let targetId = workshopId && UUID_RE.test(workshopId) ? workshopId : null;
    if (!targetId && user && user.role === "professional" && isSupabaseConfigured) {
      const rep = await ensureMyWorkshop(user.id);
      if (rep.id) {
        targetId = rep.id;
        setUser({ ...user, workshopId: rep.id });
      } else {
        setSaving(false);
        Alert.alert("Salvataggio non riuscito", rep.reason ?? "Officina non collegata.");
        return;
      }
    }
    if (!targetId) {
      setSaving(false);
      Alert.alert(
        t.common.error,
        "Officina non collegata al tuo account. Esci e rientra: verrà creata automaticamente."
      );
      return;
    }
    // Salva e ASPETTA l'esito reale del salvataggio su Supabase, così l'utente
    // vede un vero successo o un vero errore (prima mostrava sempre "salvato").
    const res = await updateWorkshop(targetId, {
      name,
      address,
      cap,
      city,
      province,
      phone,
      description,
      photo: photos[0]!,
      photos,
      lat: workshop?.lat ?? 0,
      lng: workshop?.lng ?? 0,
    });
    setSaving(false);
    if (!res.ok) {
      Alert.alert(
        "Salvataggio non riuscito",
        res.reason ?? "Controlla la connessione e riprova."
      );
      return;
    }
    Alert.alert("Profilo salvato", "Le modifiche sono visibili ai clienti.", [
      { text: t.common.ok },
    ]);
    // Raffina le coordinate in sottofondo (best-effort): se l'indirizzo è
    // cambiato, aggiorna lat/lng senza bloccare l'utente.
    geocodeAddress({ address, city, cap })
      .then((geo) => {
        if (geo) updateWorkshop(targetId, { lat: geo.lat, lng: geo.lng });
      })
      .catch(() => undefined);
  };

  const handleAddPhoto = async () => {
    const r = await pickFromGallery();
    if (r?.uri && !r.isVideo) setPhotos([...photos, r.uri]);
  };

  const handleRemovePhoto = (idx: number) => setPhotos(photos.filter((_, i) => i !== idx));

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
          <Card>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              Aggiorna le informazioni della tua officina. Queste sono le info che i clienti vedono.
            </Text>
          </Card>

          <TextField label={t.pro.workshopNamePublic} value={name} onChangeText={setName} />
          <TextField label={t.pro.workshopAddress} value={address} onChangeText={setAddress} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextField
                label={t.pro.workshopCap}
                value={cap}
                onChangeText={setCap}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={{ flex: 0.5 }}>
              <TextField
                label={t.pro.workshopProvince}
                value={province}
                onChangeText={(v) => setProvince(v.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>
          <TextField label={t.pro.workshopCity} value={city} onChangeText={setCity} />
          <TextField
            label={t.pro.workshopPhone}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextField
            label={t.pro.workshopDescription}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
            hint={t.pro.workshopDescriptionHint}
          />

          <Card>
            <Text
              style={{
                fontSize: 11,
                color: colors.textMuted,
                fontWeight: "700",
                letterSpacing: 0.6,
              }}
            >
              {t.pro.workshopPhotos.toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {photos.map((p, i) => (
                <View key={i} style={{ position: "relative" }}>
                  <Image source={{ uri: p }} style={{ width: 80, height: 80, borderRadius: 10 }} />
                  <Pressable
                    onPress={() => handleRemovePhoto(i)}
                    hitSlop={6}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: colors.danger,
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "800" }}>×</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable
                onPress={handleAddPhoto}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  borderColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.accent, fontSize: 28 }}>+</Text>
              </Pressable>
            </View>
          </Card>

          <View style={{ marginTop: 8 }}>
            <PrimaryButton
              label={saving ? "Salvataggio…" : t.common.save}
              icon="💾"
              onPress={handleSave}
              loading={saving}
              disabled={saving}
            />
          </View>
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
}
