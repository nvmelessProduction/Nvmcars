import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Review } from "@/types";

type ReviewsState = {
  reviews: Review[];
  byWorkshop: (workshopId: string) => Review[];
  add: (data: Omit<Review, "id" | "createdAt">) => Review;
};

const generateId = () => `rv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedReviews: Review[] = [
  {
    id: "rv-1",
    customerId: "anon",
    customerName: "Marco R.",
    workshopId: "w1",
    rating: 5,
    comment: "Veloci e professionali. Ottimo rapporto qualità prezzo.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    id: "rv-2",
    customerId: "anon",
    customerName: "Giulia S.",
    workshopId: "w1",
    rating: 4,
    comment: "Bene il tagliando, ma un po' di attesa per il preventivo.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    id: "rv-3",
    customerId: "anon",
    customerName: "Luca P.",
    workshopId: "w3",
    rating: 5,
    comment: "Lavoro di carrozzeria impeccabile, sembra un'auto nuova.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: "rv-4",
    customerId: "anon",
    customerName: "Sara M.",
    workshopId: "w2",
    rating: 4,
    comment: "Bravo gommista, prezzi onesti.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    id: "rv-5",
    customerId: "anon",
    customerName: "Davide L.",
    workshopId: "w4",
    rating: 5,
    comment: "Mi hanno salvato in giornata, super disponibili.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
];

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: seedReviews,
      byWorkshop: (workshopId) =>
        get()
          .reviews.filter((r) => r.workshopId === workshopId)
          .sort((a, b) => b.createdAt - a.createdAt),
      add: (data) => {
        const newReview: Review = {
          id: generateId(),
          createdAt: Date.now(),
          ...data,
        };
        set({ reviews: [newReview, ...get().reviews] });
        return newReview;
      },
    }),
    {
      name: "nvmcars-reviews",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
