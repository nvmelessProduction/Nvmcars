import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { KAV } from "@/components/KAV";
import { TextField } from "@/components/TextField";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { useWorkshopStore } from "@/store/useWorkshopStore";
import { SERVICES } from "@/data/services";
import {
  validatePhoneIT,
  validateVAT,
  validateCF,
  validateCAP,
  validateProvince,
  validateSDI,
  validateNotEmpty,
  validateMinLength,
  validateIBANIT,
  validatePEC,
} from "@/utils/validators";
import { geocodeAddress } from "@/utils/geocode";
import { pickFromGallery } from "@/utils/mediaPicker";
import type { ServiceKey, WorkshopHours } from "@/types";
import type { ProProfileStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<ProProfileStackParamList, "ProOnboarding">;

const TOTAL_STEPS = 6;

const DAY_LABELS_IT: Array<{ key: keyof WorkshopHours; label: string }> = [
  { key: "monday", label: "Lun" },
  { key: "tuesday", label: "Mar" },
  { key: "wednesday", label: "Mer" },
  { key: "thursday", label: "Gio" },
  { key: "friday", label: "Ven" },
  { key: "saturday", label: "Sab" },
  { key: "sunday", label: "Dom" },
];

export function ProOnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const workshopId = user && user.role === "professional" ? user.workshopId : "";

  const ensureWorkshop = useWorkshopStore((s) => s.ensureWorkshop);
  const updateWorkshop = useWorkshopStore((s) => s.updateWorkshop);
  const setOwner = useWorkshopStore((s) => s.setOwner);
  const setFiscal = useWorkshopStore((s) => s.setFiscal);
  const setHours = useWorkshopStore((s) => s.setHours);
  const setServices = useWorkshopStore((s) => s.setServices);
  const setStatus = useWorkshopStore((s) => s.setStatus);

  useEffect(() => {
    if (workshopId) ensureWorkshop(workshopId, user?.id);
  }, [workshopId, ensureWorkshop, user?.id]);

  const [step, setStep] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  const [legalName, setLegalName] = useState("");
  const [vat, setVat] = useState("");
  const [taxCode, setTaxCode] = useState("");
  const [sdi, setSdi] = useState("");
  const [pec, setPec] = useState("");
  const [iban, setIban] = useState("");

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cap, setCap] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [publicPhone, setPublicPhone] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [geocoding, setGeocoding] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [hours, setHoursState] = useState<WorkshopHours>({
    monday: { open: "08:30", close: "18:30" },
    tuesday: { open: "08:30", close: "18:30" },
    wednesday: { open: "08:30", close: "18:30" },
    thursday: { open: "08:30", close: "18:30" },
    friday: { open: "08:30", close: "18:30" },
    saturday: { open: "08:30", close: "13:00" },
    sunday: { open: "00:00", close: "00:00", closed: true },
  });

  const [servicePrices, setServicePrices] = useState<Partial<Record<ServiceKey, string>>>({});

  const stepLabel = useMemo(() => {
    switch (step) {
      case 0:
        return t.pro.stepOwner;
      case 1:
        return t.pro.stepFiscal;
      case 2:
        return t.pro.stepWorkshop;
      case 3:
        return t.pro.stepHours;
      case 4:
        return t.pro.stepServices;
      case 5:
        return t.pro.stepReview;
      default:
        return "";
    }
  }, [step, t]);

  const validateOwner = (): string | null => {
    const f = validateNotEmpty(firstName, "Nome");
    if (!f.ok) return f.reason;
    const l = validateNotEmpty(lastName, "Cognome");
    if (!l.ok) return l.reason;
    const p = validatePhoneIT(ownerPhone);
    if (!p.ok) return p.reason;
    return null;
  };

  const validateFiscal = (): string | null => {
    const ln = validateNotEmpty(legalName, "Ragione sociale");
    if (!ln.ok) return ln.reason;
    const v = validateVAT(vat);
    if (!v.ok) return v.reason;
    const tc = validateCF(taxCode);
    if (!tc.ok) return tc.reason;
    const s = validateSDI(sdi);
    if (!s.ok) return s.reason;
    const pp = validatePEC(pec);
    if (!pp.ok) return pp.reason;
    const ib = validateIBANIT(iban);
    if (!ib.ok) return ib.reason;
    return null;
  };

  const validateWorkshop = (): string | null => {
    const n = validateMinLength(name, 3, "Nome officina");
    if (!n.ok) return n.reason;
    const ad = validateMinLength(address, 5, "Indirizzo");
    if (!ad.ok) return ad.reason;
    const ca = validateCAP(cap);
    if (!ca.ok) return ca.reason;
    const ci = validateNotEmpty(city, "Città");
    if (!ci.ok) return ci.reason;
    const pr = validateProvince(province);
    if (!pr.ok) return pr.reason;
    const ph = validatePhoneIT(publicPhone);
    if (!ph.ok) return ph.reason;
    const d = validateMinLength(description, 30, "Descrizione");
    if (!d.ok) return d.reason;
    if (photos.length < 1) return "Aggiungi almeno una foto dell'officina";
    return null;
  };

  const validateServices = (): string | null => {
    const entries = Object.entries(servicePrices).filter(([, v]) => v && parseInt(v, 10) > 0);
    if (entries.length < 1) return "Attiva almeno un servizio con prezzo";
    return null;
  };

  const handleNext = async () => {
    let err: string | null = null;
    if (step === 0) err = validateOwner();
    else if (step === 1) err = validateFiscal();
    else if (step === 2) {
      err = validateWorkshop();
      if (!err) {
        setGeocoding(true);
        const res = await geocodeAddress({ address, city, cap });
        setGeocoding(false);
        if (res) setGeoCoords({ lat: res.lat, lng: res.lng });
      }
    } else if (step === 4) err = validateServices();

    if (err) {
      Alert.alert(t.common.error, err);
      return;
    }

    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePickPhoto = async () => {
    const result = await pickFromGallery();
    if (result?.uri && !result.isVideo) setPhotos([...photos, result.uri]);
  };

  const handleRemovePhoto = (idx: number) => setPhotos(photos.filter((_, i) => i !== idx));

  const handleToggleService = (k: ServiceKey) => {
    setServicePrices((s) => {
      const next = { ...s };
      if (next[k] !== undefined) delete next[k];
      else next[k] = "";
      return next;
    });
  };

  const handleSetServicePrice = (k: ServiceKey, v: string) => {
    setServicePrices((s) => ({ ...s, [k]: v.replace(/[^0-9]/g, "") }));
  };

  const handlePublish = () => {
    if (!workshopId) return;
    setOwner(workshopId, { firstName, lastName, phone: ownerPhone });
    setFiscal(workshopId, {
      legalName,
      vatNumber: vat,
      taxCode,
      sdiCode: sdi || undefined,
      pec: pec || undefined,
      ibanLast4: iban ? iban.slice(-4) : undefined,
    });
    setHours(workshopId, hours);
    const finalServices: Partial<Record<ServiceKey, number>> = {};
    for (const [k, v] of Object.entries(servicePrices)) {
      if (v && parseInt(v, 10) > 0) finalServices[k as ServiceKey] = parseInt(v, 10);
    }
    setServices(workshopId, finalServices);
    updateWorkshop(workshopId, {
      name,
      address,
      cap,
      city,
      province,
      phone: ownerPhone,
      description,
      photo: photos[0] ?? "",
      photos,
      lat: geoCoords?.lat ?? 0,
      lng: geoCoords?.lng ?? 0,
    });
    setStatus(workshopId, "active");
    Alert.alert(t.pro.publishedTitle, t.pro.publishedBody, [
      { text: "OK", onPress: () => navigation.replace("ProProfile") },
    ]);
  };

  return (
    <ScreenContainer>
      <KAV style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.bgElevated,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
                height: 6,
                backgroundColor: colors.accent,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              fontWeight: "700",
              marginTop: 8,
              letterSpacing: 0.6,
            }}
          >
            {t.pro.onboardingStep
              .replace("{current}", String(step + 1))
              .replace("{total}", String(TOTAL_STEPS))
              .toUpperCase()}{" "}
            · {stepLabel.toUpperCase()}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 ? (
            <Card>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                👋 Iniziamo con i tuoi dati
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                Servono al cliente per riconoscerti e a noi per contattarti in caso di necessità.
              </Text>
              <View style={{ marginTop: 16, gap: 12 }}>
                <TextField label={t.pro.firstName} value={firstName} onChangeText={setFirstName} />
                <TextField label={t.pro.lastName} value={lastName} onChangeText={setLastName} />
                <TextField
                  label={t.pro.ownerPhone}
                  value={ownerPhone}
                  onChangeText={setOwnerPhone}
                  keyboardType="phone-pad"
                  placeholder="+39 333 1234567"
                />
              </View>
            </Card>
          ) : null}

          {step === 1 ? (
            <Card>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                🧾 Dati fiscali
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                Necessari per la fatturazione italiana. P.IVA e codice fiscale vengono verificati.
              </Text>
              <View style={{ marginTop: 16, gap: 12 }}>
                <TextField label={t.pro.legalName} value={legalName} onChangeText={setLegalName} />
                <TextField
                  label={t.pro.vat}
                  value={vat}
                  onChangeText={setVat}
                  keyboardType="number-pad"
                  placeholder="11 cifre"
                  maxLength={11}
                />
                <TextField
                  label={t.pro.taxCode}
                  value={taxCode}
                  onChangeText={(v) => setTaxCode(v.toUpperCase())}
                  autoCapitalize="characters"
                  placeholder="RSSMRA80A01H501Z (16 car.)"
                  maxLength={16}
                />
                <TextField
                  label={t.pro.sdiCode + ` (${t.common.optional})`}
                  value={sdi}
                  onChangeText={(v) => setSdi(v.toUpperCase())}
                  autoCapitalize="characters"
                  placeholder="Codice destinatario 7 caratteri"
                  hint={t.pro.sdiHint}
                />
                <TextField
                  label={t.pro.pec + ` (${t.common.optional})`}
                  value={pec}
                  onChangeText={setPec}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextField
                  label={t.pro.iban}
                  value={iban}
                  onChangeText={(v) => setIban(v.toUpperCase())}
                  autoCapitalize="characters"
                  placeholder="IT60X0542811101000000123456"
                />
              </View>
            </Card>
          ) : null}

          {step === 2 ? (
            <Card>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                🏪 La tua officina
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                Queste sono le informazioni che il cliente vede.
              </Text>
              <View style={{ marginTop: 16, gap: 12 }}>
                <TextField label={t.pro.workshopNamePublic} value={name} onChangeText={setName} />
                <TextField
                  label={t.pro.workshopAddress}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Via Roma 12"
                />
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
                      placeholder="RM"
                    />
                  </View>
                </View>
                <TextField label={t.pro.workshopCity} value={city} onChangeText={setCity} />
                <TextField
                  label={t.pro.workshopPhone}
                  value={publicPhone}
                  onChangeText={setPublicPhone}
                  keyboardType="phone-pad"
                  placeholder="+39 06 12345678"
                />
                <TextField
                  label={t.pro.workshopDescription}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  hint={t.pro.workshopDescriptionHint}
                />
              </View>

              <Text
                style={{
                  fontSize: 11,
                  color: colors.textMuted,
                  fontWeight: "700",
                  letterSpacing: 0.6,
                  marginTop: 18,
                }}
              >
                {t.pro.workshopPhotos.toUpperCase()}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {photos.map((p, i) => (
                  <Pressable
                    key={i}
                    onLongPress={() => handleRemovePhoto(i)}
                    style={{ position: "relative" }}
                  >
                    <Image
                      source={{ uri: p }}
                      style={{ width: 80, height: 80, borderRadius: 10 }}
                    />
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
                  </Pressable>
                ))}
                <Pressable
                  onPress={handlePickPhoto}
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
              {geocoding ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}>
                  📍 {t.pro.geocoding}
                </Text>
              ) : geoCoords ? (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}>
                  📍 Coordinate: {geoCoords.lat.toFixed(4)}, {geoCoords.lng.toFixed(4)}
                </Text>
              ) : null}
            </Card>
          ) : null}

          {step === 3 ? (
            <Card>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                🕘 Orari di apertura
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                Puoi modificare singoli giorni o chiudere completamente.
              </Text>
              <View style={{ marginTop: 16, gap: 8 }}>
                {DAY_LABELS_IT.map(({ key, label }) => {
                  const day = hours[key];
                  return (
                    <View
                      key={key}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ width: 44, color: colors.text, fontWeight: "700" }}>{label}</Text>
                      <Switch
                        value={!day.closed}
                        onValueChange={(open) =>
                          setHoursState({ ...hours, [key]: { ...day, closed: !open } })
                        }
                      />
                      {!day.closed ? (
                        <View style={{ flexDirection: "row", gap: 6, flex: 1 }}>
                          <TextInput
                            value={day.open}
                            onChangeText={(v) =>
                              setHoursState({ ...hours, [key]: { ...day, open: v } })
                            }
                            placeholder="08:30"
                            placeholderTextColor={colors.textMuted}
                            style={{
                              flex: 1,
                              backgroundColor: colors.bgElevated,
                              borderRadius: 8,
                              padding: 8,
                              color: colors.text,
                              borderWidth: 1,
                              borderColor: colors.border,
                              textAlign: "center",
                            }}
                          />
                          <Text style={{ color: colors.textMuted, alignSelf: "center" }}>—</Text>
                          <TextInput
                            value={day.close}
                            onChangeText={(v) =>
                              setHoursState({ ...hours, [key]: { ...day, close: v } })
                            }
                            placeholder="18:30"
                            placeholderTextColor={colors.textMuted}
                            style={{
                              flex: 1,
                              backgroundColor: colors.bgElevated,
                              borderRadius: 8,
                              padding: 8,
                              color: colors.text,
                              borderWidth: 1,
                              borderColor: colors.border,
                              textAlign: "center",
                            }}
                          />
                        </View>
                      ) : (
                        <Text
                          style={{
                            flex: 1,
                            color: colors.textMuted,
                            fontStyle: "italic",
                          }}
                        >
                          Chiuso
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}

          {step === 4 ? (
            <Card>
              <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                💶 Servizi e prezzi base
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                Imposta i servizi che offri e il prezzo base. Potrai poi aggiungere prezzi
                personalizzati per marca/modello.
              </Text>
              <View style={{ marginTop: 14, gap: 10 }}>
                {SERVICES.map((s) => {
                  const enabled = servicePrices[s.key] !== undefined;
                  return (
                    <View
                      key={s.key}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        backgroundColor: colors.bgElevated,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        padding: 10,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                      <Text style={{ flex: 1, color: colors.text, fontWeight: "700", fontSize: 14 }}>
                        {s.label}
                      </Text>
                      {enabled ? (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.bg,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 8,
                            paddingHorizontal: 8,
                            minWidth: 90,
                          }}
                        >
                          <Text style={{ color: colors.textMuted }}>€</Text>
                          <TextInput
                            value={servicePrices[s.key] ?? ""}
                            onChangeText={(v) => handleSetServicePrice(s.key, v)}
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="number-pad"
                            style={{
                              flex: 1,
                              padding: 6,
                              color: colors.text,
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          />
                        </View>
                      ) : null}
                      <Switch
                        value={enabled}
                        onValueChange={() => handleToggleService(s.key)}
                      />
                    </View>
                  );
                })}
              </View>
            </Card>
          ) : null}

          {step === 5 ? (
            <View style={{ gap: 14 }}>
              <Card>
                <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
                  ✅ Tutto pronto
                </Text>
                <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 }}>
                  Verifica i dati. Pubblicando, la tua officina sarà visibile ai clienti.
                </Text>
              </Card>
              <Card>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                  TITOLARE
                </Text>
                <Text style={{ color: colors.text, fontSize: 15, marginTop: 4 }}>
                  {firstName} {lastName} · {ownerPhone}
                </Text>
              </Card>
              <Card>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                  AZIENDA
                </Text>
                <Text style={{ color: colors.text, fontSize: 15, marginTop: 4 }}>{legalName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                  P.IVA {vat} · CF {taxCode}
                </Text>
              </Card>
              <Card>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                  OFFICINA
                </Text>
                <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 4 }}>
                  {name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  {address}, {cap} {city} ({province})
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                  📞 {publicPhone}
                </Text>
                <Text style={{ color: colors.text, fontSize: 13, marginTop: 8, lineHeight: 19 }}>
                  {description}
                </Text>
                {photos.length > 0 ? (
                  <ScrollView
                    horizontal
                    style={{ marginTop: 10 }}
                    showsHorizontalScrollIndicator={false}
                  >
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {photos.map((p, i) => (
                        <Image
                          key={i}
                          source={{ uri: p }}
                          style={{ width: 100, height: 70, borderRadius: 8 }}
                        />
                      ))}
                    </View>
                  </ScrollView>
                ) : null}
              </Card>
              <Card>
                <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: "700", letterSpacing: 0.8 }}>
                  SERVIZI
                </Text>
                <View style={{ marginTop: 8, gap: 6 }}>
                  {Object.entries(servicePrices)
                    .filter(([, v]) => v && parseInt(v, 10) > 0)
                    .map(([k, v]) => {
                      const s = SERVICES.find((x) => x.key === k);
                      return (
                        <View
                          key={k}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ color: colors.text }}>
                            {s?.emoji} {s?.label}
                          </Text>
                          <Text style={{ color: colors.text, fontWeight: "800" }}>€{v}</Text>
                        </View>
                      );
                    })}
                </View>
              </Card>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            padding: 16,
            paddingBottom: 28,
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
            gap: 10,
          }}
        >
          {step > 0 ? (
            <Pressable
              onPress={handleBack}
              style={{
                flex: 0.4,
                paddingVertical: 14,
                borderRadius: 14,
                backgroundColor: colors.bgElevated,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700" }}>{t.common.previous}</Text>
            </Pressable>
          ) : null}
          {step < TOTAL_STEPS - 1 ? (
            <View style={{ flex: 1 }}>
              <PrimaryButton label={t.common.next + " ›"} onPress={handleNext} />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <PrimaryButton label={t.pro.submitProfile} icon="🚀" onPress={handlePublish} />
            </View>
          )}
        </View>
      </KAV>
    </ScreenContainer>
  );
}
