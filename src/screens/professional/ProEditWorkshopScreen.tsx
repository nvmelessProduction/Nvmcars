import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KAV } from "@/components/KAV";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";

export function ProEditWorkshopScreen() {
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const workshop = user && user.role === "professional" ? WORKSHOPS.find((w) => w.id === user.workshopId) : null;

  const [name, setName] = useState(workshop?.name ?? "");
  const [address, setAddress] = useState(workshop?.address ?? "");
  const [phone, setPhone] = useState(workshop?.phone ?? "");
  const [description, setDescription] = useState(workshop?.description ?? "");

  const handleSave = () => {
    Alert.alert("Profilo salvato", "Le modifiche saranno visibili ai clienti.", [
      { text: t.common.ok },
    ]);
  };

  return (
    <ScreenContainer>
      <KAV>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <Card>
            <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>
              Aggiorna le informazioni della tua officina. Queste sono le info che i clienti vedono.
            </Text>
          </Card>

          <TextField label="Nome officina" value={name} onChangeText={setName} />
          <TextField label="Indirizzo completo" value={address} onChangeText={setAddress} />
          <TextField
            label="Telefono"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextField
            label="Descrizione"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{ minHeight: 100, textAlignVertical: "top" }}
            hint="Spiega ai clienti cosa rende speciale la tua officina."
          />

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label={t.common.save} icon="💾" onPress={handleSave} />
          </View>
        </ScrollView>
      </KAV>
    </ScreenContainer>
  );
}
