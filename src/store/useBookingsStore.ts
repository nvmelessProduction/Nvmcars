import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Booking, BookingSlot, BookingStatus } from "@/types";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as bookingsService from "@/services/bookings";

type BookingsState = {
  bookings: Booking[];
  hydratedFor: string | null;
  realtimeUnsub: (() => void) | null;
  hydrate: (filter: { customerId?: string; workshopId?: string }) => Promise<void>;
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

function upsert(list: Booking[], b: Booking): Booking[] {
  const i = list.findIndex((x) => x.id === b.id);
  if (i === -1) return [b, ...list];
  const out = [...list];
  out[i] = b;
  return out;
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      // In modalità Supabase live: niente seed (i bookings vengono dal DB).
      // In modalità mock: usa seed per dare un'app già "popolata" alla demo.
      bookings: isSupabaseConfigured ? [] : seedBookings,
      hydratedFor: null,
      realtimeUnsub: null,

      hydrate: async (filter) => {
        const key = filter.customerId
          ? `c:${filter.customerId}`
          : filter.workshopId
            ? `w:${filter.workshopId}`
            : "";
        if (!isSupabaseConfigured || key === "" || get().hydratedFor === key) return;
        const list = filter.customerId
          ? await bookingsService.listMyBookingsAsCustomer(filter.customerId)
          : await bookingsService.listMyBookingsAsWorkshop(filter.workshopId!);
        // mantieni solo i bookings esterni allo scope (delle altre persone) + i remote
        const otherScope = get().bookings.filter((b) =>
          filter.customerId
            ? b.customerId !== filter.customerId
            : b.workshopId !== filter.workshopId
        );
        set({ bookings: [...otherScope, ...list], hydratedFor: key });

        // realtime
        get().realtimeUnsub?.();
        const unsub = bookingsService.subscribeToBookings(filter, (b) => {
          set({ bookings: upsert(get().bookings, b) });
        });
        set({ realtimeUnsub: unsub });
      },

      createBooking: (data) => {
        const newBooking: Booking = {
          id: generateId(),
          status: "requested",
          createdAt: Date.now(),
          ...data,
        };
        set({ bookings: [newBooking, ...get().bookings] });
        if (isSupabaseConfigured) {
          bookingsService.createBookingRemote(data).then((res) => {
            if (res.ok && res.booking) {
              set({
                bookings: get().bookings.map((b) =>
                  b.id === newBooking.id ? res.booking! : b
                ),
              });
            }
          }).catch(() => undefined);
        }
        return newBooking;
      },

      updateStatus: (id, status) => {
        set({ bookings: get().bookings.map((b) => (b.id === id ? { ...b, status } : b)) });
        bookingsService.updateBookingStatus(id, status).catch(() => undefined);
      },

      proposeSlots: (id, slots, note) => {
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
        });
        bookingsService.proposeSlotsRemote(id, slots, note).catch(() => undefined);
      },

      selectSlot: (id, slotId) => {
        const booking = get().bookings.find((b) => b.id === id);
        const slot = booking?.proposedSlots?.find((s) => s.id === slotId);
        if (!slot) return;
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? { ...b, status: "confirmed", selectedSlotId: slotId, scheduledAt: slot.startAt }
              : b
          ),
        });
        bookingsService.selectSlotRemote(id, slotId, slot.startAt).catch(() => undefined);
      },

      startWork: (id) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: "in_progress", startedAt: Date.now() } : b
          ),
        });
        bookingsService.updateBookingStatus(id, "in_progress").catch(() => undefined);
        bookingsService.setBookingTimestamps(id, { startedAt: Date.now() }).catch(() => undefined);
      },

      completeWork: (id) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id ? { ...b, status: "completed", completedAt: Date.now() } : b
          ),
        });
        bookingsService.updateBookingStatus(id, "completed").catch(() => undefined);
        bookingsService.setBookingTimestamps(id, { completedAt: Date.now() }).catch(() => undefined);
      },

      rejectBooking: (id, reason) => {
        set({
          bookings: get().bookings.map((b) =>
            b.id === id
              ? { ...b, status: "rejected", cancelledAt: Date.now(), cancellationReason: reason }
              : b
          ),
        });
        bookingsService.updateBookingStatus(id, "rejected").catch(() => undefined);
        bookingsService
          .setBookingTimestamps(id, { cancelledAt: Date.now(), cancellationReason: reason })
          .catch(() => undefined);
      },

      cancelByCustomer: (id, reason) => {
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
        });
        bookingsService.updateBookingStatus(id, "cancelled_by_customer").catch(() => undefined);
        bookingsService
          .setBookingTimestamps(id, { cancelledAt: Date.now(), cancellationReason: reason })
          .catch(() => undefined);
      },

      cancelByPro: (id, reason) => {
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
        });
        bookingsService.updateBookingStatus(id, "cancelled_by_pro").catch(() => undefined);
        bookingsService
          .setBookingTimestamps(id, { cancelledAt: Date.now(), cancellationReason: reason })
          .catch(() => undefined);
      },

      byCustomer: (customerId) => get().bookings.filter((b) => b.customerId === customerId),
      byWorkshop: (workshopId) => get().bookings.filter((b) => b.workshopId === workshopId),
      getById: (id) => get().bookings.find((b) => b.id === id) ?? null,
    }),
    {
      name: "nvmcars-bookings",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      partialize: (state) => ({ bookings: state.bookings }),
      migrate: (state, version) => {
        const s = state as { bookings?: Booking[] } | undefined;
        if (!s || !Array.isArray(s.bookings)) return s as BookingsState;
        if (version < 2) {
          s.bookings = s.bookings.map((b) => {
            if ((b.status as string) === "pending") return { ...b, status: "requested" };
            if ((b.status as string) === "accepted") return { ...b, status: "confirmed" };
            if ((b.status as string) === "cancelled")
              return { ...b, status: "cancelled_by_customer" };
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
