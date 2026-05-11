import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { RatingStars } from "@/components/RatingStars";
import { Card } from "@/components/Card";
import { useReviewsStore } from "@/store/useReviewsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useColors } from "@/store/useThemeStore";
import { useT } from "@/i18n";
import { WORKSHOPS } from "@/data/workshops";
import type { HomeStackParamList } from "@/navigation/types";

type Nav = NativeStackNavigationProp<HomeStackParamList, "AddReview">;
type Route = RouteProp<HomeStackParamList, "AddReview">;

export function AddReviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { workshopId, bookingId } = route.params;
  const t = useT();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const addReview = useReviewsStore((s) => s.add);
  const workshop = WORKSHOPS.find((w) => w.id === workshopId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!user) return;
    if (comment.trim().length < 5) {
      Alert.alert(t.common.error, "Scrivi almeno qualche parola sulla tua esperienza.");
      return;
    }
    addReview({
      customerId: user.id,
      customerName: user.name,
      workshopId,
      bookingId,
      rating,
      comment: comment.trim(),
    });
    Alert.alert("Grazie!", "La tua recensione è stata pubblicata.", [
      { text: t.common.ok, onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
          <Card>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>Stai recensendo</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 4 }}>
              {workshop?.name ?? "Officina"}
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>
              {t.reviews.yourRating}
            </Text>
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <RatingStars value={rating} onChange={setRating} size={42} />
              <Text style={{ marginTop: 10, fontSize: 14, color: colors.textMuted }}>
                {rating === 5
                  ? "Eccellente"
                  : rating === 4
                  ? "Molto buono"
                  : rating === 3
                  ? "Discreto"
                  : rating === 2
                  ? "Insufficiente"
                  : "Pessimo"}
              </Text>
            </View>
          </Card>

          <TextField
            label={t.reviews.yourComment}
            value={comment}
            onChangeText={setComment}
            placeholder={t.reviews.commentPlaceholder}
            multiline
            numberOfLines={5}
            style={{ minHeight: 120, textAlignVertical: "top" }}
          />

          <View style={{ marginTop: 8 }}>
            <PrimaryButton label={t.reviews.submit} onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
