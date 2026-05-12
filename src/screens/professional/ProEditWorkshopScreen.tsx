import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
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

export function ProEditWorkshopScreen() {
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const workshopId = user && user.role === "professional" ? user.workshopId : undefined;
  const workshop = useOwnWorkshop(workshopId);
  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const updateWorkshop = useWorkshopStore((s) => s.updateWorkshop);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cap, setCap] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

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
  }, [workshop?.id]);

  const handleSave = async () => {
    const checks: Array<{ ok: true } | { ok: false; reason: string }> = [
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
    const geo = await geocodeAddress({ address, city, cap });
    if (!workshopId) return;
    updateWorkshop(workshopId, {
      name,
      address,
      cap,
      city,
      province,
      phone,
      description,
      photo: photos[0]!,
      photos,
      lat: geo?.lat ?? workshop?.lat ?? 0,
      lng: geo?.lng ?? workshop?.lng ?? 0,
    });
    Alert.alert("Profilo salvato", "Le modifiche sono visibili ai clienti.", [
      { text: t.common.ok },
    ]);
  };

  const handleAddPhoto = async () => {
    const r = await pickFromGallery();
    if (r?.uri && !r.isVideo) setPhotos([...photos, r.uri]);
  };

  const handleRemovePhoto = (idx: number) => setPhotos(photos.filter((_, i) => i !== idx));

  return (
    <ScreenContainer>
      <KAV>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
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
            <PrimaryButton label={t.common.save} icon="💾" onPress={handleSave} />
          </View>
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}
