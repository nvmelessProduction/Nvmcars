import { useState } from "react";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Alert, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { KeyboardAwareScrollView } from "@/components/KAV";
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
      Alert.alert(t.common.error, t.reviews.commentTooShort);
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
    Alert.alert(t.reviews.thanksTitle, t.reviews.thanksBody, [
      { text: t.common.ok, onPress: () => navigation.goBack() },
    ]);
  };

  const ratingLabel = (r: number) =>
    r === 5
      ? t.reviews.rating5
      : r === 4
        ? t.reviews.rating4
        : r === 3
          ? t.reviews.rating3
          : r === 2
            ? t.reviews.rating2
            : t.reviews.rating1;

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 80 }}>
          <Card>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{t.reviews.youAreReviewing}</Text>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 4 }}>
              {workshop?.name ?? t.pro.customerLabel}
            </Text>
          </Card>

          <Card>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>
              {t.reviews.yourRating}
            </Text>
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
              <RatingStars value={rating} onChange={setRating} size={42} />
              <Text style={{ marginTop: 10, fontSize: 14, color: colors.textMuted }}>
                {ratingLabel(rating)}
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
      </KeyboardAwareScrollView>
    </ScreenContainer>
  );
}
