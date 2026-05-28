import { Alert, Linking, Platform } from "react-native";

export async function openWhatsApp(phone: string, message: string): Promise<void> {
  const cleaned = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  const text = encodeURIComponent(message);
  const appUrl = `whatsapp://send?phone=${cleaned}&text=${text}`;
  const webUrl = `https://wa.me/${cleaned}?text=${text}`;

  try {
    const canOpenApp = await Linking.canOpenURL(appUrl);
    if (canOpenApp) {
      await Linking.openURL(appUrl);
      return;
    }
    await Linking.openURL(webUrl);
  } catch {
    Alert.alert(
      "Impossibile aprire WhatsApp",
      Platform.OS === "ios"
        ? "Verifica di avere WhatsApp installato."
        : "Riprova tra qualche istante."
    );
  }
}
