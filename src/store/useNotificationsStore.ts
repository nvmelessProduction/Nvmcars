import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Notification, NotificationType } from "@/types";

type NotificationsState = {
  notifications: Notification[];
  unreadCount: (userId: string) => number;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  push: (n: Omit<Notification, "id" | "createdAt" | "read">) => Notification;
  remove: (id: string) => void;
  byUser: (userId: string) => Notification[];
};

const generateId = () => `nt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedNotifications: Notification[] = [
  {
    id: "nt-seed-1",
    userId: "demo-customer",
    type: "booking_confirmed",
    title: "Prenotazione confermata",
    body: "Carrozzeria Tirrenica ha confermato il tuo appuntamento.",
    read: false,
    createdAt: Date.now() - 1000 * 60 * 30,
    relatedId: "bk-seed-2",
    relatedKind: "booking",
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
    relatedKind: "booking",
  },
  {
    id: "nt-seed-pro-1",
    userId: "demo-pro",
    type: "booking_requested",
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
      push: (data) => {
        const n: Notification = {
          id: generateId(),
          createdAt: Date.now(),
          read: false,
          ...data,
        };
        set({ notifications: [n, ...get().notifications] });
        return n;
      },
      remove: (id) =>
        set({ notifications: get().notifications.filter((n) => n.id !== id) }),
      byUser: (userId) =>
        get().notifications.filter((n) => n.userId === userId),
    }),
    {
      name: "nvmcars-notifications",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function notifyEvent(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;
  relatedKind?: Notification["relatedKind"];
}) {
  return useNotificationsStore.getState().push(input);
}
