import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Notification } from "@/types";

type NotificationsState = {
  notifications: Notification[];
  unreadCount: (userId: string) => number;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
};

const generateId = () => `nt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedNotifications: Notification[] = [
  {
    id: "nt-seed-1",
    userId: "demo-customer",
    type: "booking_accepted",
    title: "Prenotazione confermata 🎉",
    body: "Carrozzeria Tirrenica ha accettato la tua prenotazione.",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    relatedId: "bk-seed-2",
  },
  {
    id: "nt-seed-2",
    userId: "demo-customer",
    type: "promo",
    title: "Sconto del 10% sul tagliando",
    body: "Valido fino a fine mese presso le officine partner di Cerveteri.",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
  },
  {
    id: "nt-seed-3",
    userId: "demo-customer",
    type: "booking_completed",
    title: "Servizio completato",
    body: "Lascia una recensione su Autofficina Aurelia.",
    read: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    relatedId: "bk-seed-1",
  },
  {
    id: "nt-seed-pro-1",
    userId: "demo-pro",
    type: "new_review",
    title: "Nuova richiesta",
    body: "Hai ricevuto una richiesta di Tagliando.",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 10,
  },
];

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      unreadCount: (userId) =>
        get().notifications.filter((n) => n.userId === userId && !n.read).length,
      markRead: (id) =>
        set({
          notifications: get().notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }),
      markAllRead: (userId) =>
        set({
          notifications: get().notifications.map((n) =>
            n.userId === userId ? { ...n, read: true } : n
          ),
        }),
      push: (data) =>
        set({
          notifications: [
            {
              id: generateId(),
              createdAt: Date.now(),
              read: false,
              ...data,
            },
            ...get().notifications,
          ],
        }),
    }),
    {
      name: "nvmcars-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
