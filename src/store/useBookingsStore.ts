import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Booking, BookingStatus } from "@/types";

type BookingsState = {
  bookings: Booking[];
  createBooking: (data: Omit<Booking, "id" | "status" | "createdAt">) => Booking;
  updateStatus: (id: string, status: BookingStatus) => void;
  byCustomer: (customerId: string) => Booking[];
  byWorkshop: (workshopId: string) => Booking[];
};

const generateId = () => `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedBookings: Booking[] = [
  {
    id: "bk-seed-1",
    customerId: "demo-customer",
    workshopId: "w1",
    service: "tagliando",
    carId: "car-seed",
    estimatedPrice: 89,
    status: "completed",
    message: "Vorrei prenotare un tagliando completo.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
    scheduledAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "bk-seed-2",
    customerId: "demo-customer",
    workshopId: "w3",
    service: "carrozzeria",
    carId: "car-seed",
    estimatedPrice: 250,
    status: "accepted",
    message: "Ho un piccolo graffio sulla portiera.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    scheduledAt: Date.now() + 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "bk-seed-3",
    customerId: "demo-customer",
    workshopId: "w2",
    service: "cambioGomme",
    carId: "car-seed",
    estimatedPrice: 39,
    status: "pending",
    message: "Treno gomme estive 205/55 R16.",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
];

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: seedBookings,
      createBooking: (data) => {
        const newBooking: Booking = {
          id: generateId(),
          status: "pending",
          createdAt: Date.now(),
          ...data,
        };
        set({ bookings: [newBooking, ...get().bookings] });
        return newBooking;
      },
      updateStatus: (id, status) =>
        set({
          bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b)),
        }),
      byCustomer: (customerId) =>
        get().bookings.filter((b) => b.customerId === customerId),
      byWorkshop: (workshopId) =>
        get().bookings.filter((b) => b.workshopId === workshopId),
    }),
    {
      name: "nvmcars-bookings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
