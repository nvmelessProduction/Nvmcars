import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ServiceLogEntry, CarReminder, CarReminderKind, ServiceKey } from "@/types";

type State = {
  entries: ServiceLogEntry[];
  reminders: CarReminder[];
  byCar: (carId: string) => ServiceLogEntry[];
  remindersByCar: (carId: string) => CarReminder[];
  addEntry: (entry: Omit<ServiceLogEntry, "id">) => ServiceLogEntry;
  removeEntry: (id: string) => void;
  setReminder: (carId: string, kind: CarReminderKind, dueAt: number, note?: string) => void;
  removeReminder: (id: string) => void;
};

const generateId = () => `sl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const seedEntries: ServiceLogEntry[] = [
  {
    id: "sl-seed-1",
    carId: "car-seed",
    workshopId: "w1",
    workshopName: "Autofficina Aurelia",
    service: "tagliando" as ServiceKey,
    description: "Tagliando completo: olio + filtri + check generale",
    cost: 89,
    km: 78000,
    performedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
];

export const useServiceLogStore = create<State>()(
  persist(
    (set, get) => ({
      entries: seedEntries,
      reminders: [],
      byCar: (carId) =>
        get()
          .entries.filter((e) => e.carId === carId)
          .sort((a, b) => b.performedAt - a.performedAt),
      remindersByCar: (carId) =>
        get()
          .reminders.filter((r) => r.carId === carId)
          .sort((a, b) => a.dueAt - b.dueAt),
      addEntry: (entry) => {
        const e: ServiceLogEntry = { id: generateId(), ...entry };
        set({ entries: [e, ...get().entries] });
        return e;
      },
      removeEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
      setReminder: (carId, kind, dueAt, note) => {
        const existing = get().reminders.find((r) => r.carId === carId && r.kind === kind);
        if (existing) {
          set({
            reminders: get().reminders.map((r) =>
              r.id === existing.id ? { ...r, dueAt, note } : r
            ),
          });
        } else {
          set({
            reminders: [
              ...get().reminders,
              { id: `r-${generateId()}`, carId, kind, dueAt, note },
            ],
          });
        }
      },
      removeReminder: (id) => set({ reminders: get().reminders.filter((r) => r.id !== id) }),
    }),
    {
      name: "nvmcars-service-log",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
