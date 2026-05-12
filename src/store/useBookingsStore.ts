import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Booking, BookingSlot, BookingStatus } from "@/types";

type BookingsState = {
  bookings: Booking[];
  createBooking: (data: Omit<Booking, "id" | "status" | "createdAt">) => Booking;
  updateStatus: (id: string, status: BookingStatus) => void;
  proposeSlots: (id: string, slots: BookingSlot[], note?: string) => void;
  selectSlot: (id: string, slotId: string) => void;
  startWork: (id: string) => void;
  completeWork: (id: string) => void;
  rejectBooking: (id: string, reason?: string) => void;
  cancelByCustomer: (id: string, reason?: string) => void;
  cancelByPro: (id: string, reason?: string) => void;
  byCustomer: (customerId: string) => Booking[];
  byWorkshop: (workshopId: string) => Booking[];
  getById: (id: string) => Booking | null;
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
    completedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "bk-seed-2",
    customerId: "demo-customer",
    workshopId: "w3",
    service: "carrozzeria",
    carId: "car-seed",
    estimatedPrice: 250,
    status: "confirmed",
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
    status: "requested",
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
          status: "requested",
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
      proposeSlots: (id, slots, note) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "slot_proposed",
                  proposedSlots: slots,
                  proposedAt: Date.now(),
                  proposedNote: note,
                }
              : b
          ),
        }),
      selectSlot: (id, slotId) =>
        set({
          bookings: get().bookings.map((b) => {
            if (b.id !== id) return b;
            const slot = b.proposedSlots?.find((s) => s.id === slotId);
            if (!slot) return b;
            return {
              ...b,
              status: "confirmed",
              selectedSlotId: slotId,
              scheduledAt: slot.startAt,
            };
          }),
        }),
      startWork: (id) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: "in_progress", startedAt: Date.now() } : b
          ),
        }),
      completeWork: (id) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: "completed", completedAt: Date.now() } : b
          ),
        }),
      rejectBooking: (id, reason) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? { ...b, status: "rejected", cancelledAt: Date.now(), cancellationReason: reason }
              : b
          ),
        }),
      cancelByCustomer: (id, reason) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "cancelled_by_customer",
                  cancelledAt: Date.now(),
                  cancellationReason: reason,
                }
              : b
          ),
        }),
      cancelByPro: (id, reason) =>
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: "cancelled_by_pro",
                  cancelledAt: Date.now(),
                  cancellationReason: reason,
                }
              : b
          ),
        }),
      byCustomer: (customerId) => get().bookings.filter((b) => b.customerId === customerId),
      byWorkshop: (workshopId) => get().bookings.filter((b) => b.workshopId === workshopId),
      getById: (id) => get().bookings.find((b) => b.id === id) ?? null,
    }),
    {
      name: "nvmcars-bookings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (state, version) => {
        const s = state as { bookings?: Booking[] } | undefined;
        if (!s || !Array.isArray(s.bookings)) return s as BookingsState;
        if (version < 2) {
          s.bookings = s.bookings.map((b) => {
            if ((b.status as string) === "pending") return { ...b, status: "requested" };
            if ((b.status as string) === "accepted") return { ...b, status: "confirmed" };
            if ((b.status as string) === "cancelled") return { ...b, status: "cancelled_by_customer" };
            return b;
          });
        }
        return s as BookingsState;
      },
    }
  )
);

export function isActiveBooking(status: BookingStatus): boolean {
  return (
    status === "requested" ||
    status === "slot_proposed" ||
    status === "confirmed" ||
    status === "in_progress" ||
    status === "pending" ||
    status === "accepted"
  );
}

export function isOpenForPro(status: BookingStatus): boolean {
  return status === "requested" || status === "slot_proposed" || status === "pending";
}
