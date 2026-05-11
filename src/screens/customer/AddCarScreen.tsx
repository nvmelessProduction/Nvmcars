import { useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { useCarStore } from "@/store/useCarStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { CAR_BRANDS, CAR_BRANDS_LIST, inferCategory } from "@/data/carBrands";
import type { FuelType } from "@/types";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "AddCar">;

const FUELS: FuelType[] = ["benzina", "diesel", "ibrido", "elettrico", "gpl", "metano"];

export function AddCarScreen() {
  const navigation = useNavigation<Nav>();
  const colors = useColors();
  const t = useT();
  const addCar = useCarStore((s) => s.addCar);

  const [plate, setPlate] = useState("");
  const [make, setMake] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [year, setYear] = useState(`${new Date().getFullYear() - 5}`);
  const [fuel, setFuel] = useState<FuelType>("benzina");
  const [displacement, setDisplacement] = useState("1400");
  const [nickname, setNickname] = useState("");

  const models = useMemo(() => (make ? CAR_BRANDS[make] : []), [make]);

  const handleSubmit = () => {
    const plateTrim = plate.trim().toUpperCase();
    if (plateTrim.length < 5) {
      Alert.alert(t.common.error, "Inserisci una targa valida.");
      return;
    }
    if (!make || !model) {
      Alert.alert(t.common.error, "Seleziona marca e modello.");
      return;
    }
    const yearNum = Number(year);
    if (!yearNum || yearNum < 1980 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert(t.common.error, "Anno non valido.");
      return;
    }
    const cc = Number(displacement);
    if (!cc || cc < 50 || cc > 8000) {
      Alert.alert(t.common.error, "Cilindrata non valida.");
      return;
    }
    addCar({
      plate: plateTrim,
      make,
      model,
      year: yearNum,
      fuel,
      displacement: cc,
      category: inferCategory(make, model),
      nickname: nickname.trim() || undefined,
    });
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {t.home.addCar}
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 6 }}>
            {t.home.addCarHint}
          </Text>

          <TextField
            label={t.car.plate}
            value={plate}
            onChangeText={(v) => setPlate(v.toUpperCase())}
            placeholder={t.car.plateHint}
            autoCapitalize="characters"
            maxLength={8}
          />

          <View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 6 }}>
              {t.car.make}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {CAR_BRANDS_LIST.map((b) => {
                  const active = b === make;
                  return (
                    <Pressable
                      key={b}
                      onPress={() => {
                        setMake(b);
                        setModel(null);
                      }}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: active ? colors.accent : colors.bgElevated,
                        borderWidth: 1,
                        borderColor: active ? colors.accent : colors.border,
                      }}
                    >
                      <Text style={{ color: active ? "#FFF" : colors.text, fontWeight: "600" }}>
                        {b}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {make ? (
            <View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 6 }}>
                {t.car.model}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {models.map((m) => {
                  const active = m.model === model;
                  return (
                    <Pressable
                      key={m.model}
                      onPress={() => setModel(m.model)}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: active ? colors.accent : colors.bgElevated,
                        borderWidth: 1,
                        borderColor: active ? colors.accent : colors.border,
                      }}
                    >
                      <Text style={{ color: active ? "#FFF" : colors.text, fontWeight: "600" }}>
                        {m.model}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <TextField
                label={t.car.year}
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextField
                label={t.car.displacement}
                value={displacement}
                onChangeText={setDisplacement}
                keyboardType="numeric"
                maxLength={4}
                hint="cc"
              />
            </View>
          </View>

          <View>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 6 }}>
              {t.car.fuel}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {FUELS.map((f) => {
                const active = f === fuel;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setFuel(f)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: active ? colors.accent : colors.bgElevated,
                      borderWidth: 1,
                      borderColor: active ? colors.accent : colors.border,
                    }}
                  >
                    <Text style={{ color: active ? "#FFF" : colors.text, fontWeight: "600" }}>
                      {t.car[f]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            label={`${t.car.nickname} (${t.common.optional})`}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t.car.nicknameHint}
          />

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label={t.car.saveCar} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
