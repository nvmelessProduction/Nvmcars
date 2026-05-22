import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Workshop,
  WorkshopFiscalData,
  WorkshopHours,
  WorkshopOwner,
  WorkshopStatus,
  WorkshopVacation,
  ServicePriceOverride,
  ServiceKey,
} from "@/types";
import { WORKSHOPS as MOCK_WORKSHOPS } from "@/data/workshops";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as workshopsService from "@/services/workshops";

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultHours: WorkshopHours = {
  monday: { open: "08:30", close: "18:30" },
  tuesday: { open: "08:30", close: "18:30" },
  wednesday: { open: "08:30", close: "18:30" },
  thursday: { open: "08:30", close: "18:30" },
  friday: { open: "08:30", close: "18:30" },
  saturday: { open: "08:30", close: "13:00" },
  sunday: { open: "00:00", close: "00:00", closed: true },
};

export function buildDraftWorkshop(workshopId: string, ownerId?: string): Workshop {
  return {
    id: workshopId,
    ownerId,
    name: "",
    city: "",
    address: "",
    cap: "",
    province: "",
    phone: "",
    lat: 0,
    lng: 0,
    rating: 0,
    reviewsCount: 0,
    photo: "",
    photos: [],
    description: "",
    hours: { ...defaultHours },
    services: {},
    priceOverrides: [],
    vacations: [],
    status: "draft",
    acceptingRequests: true,
    inOfficinaPayment: true,
    stripeConnected: false,
  };
}

type WorkshopState = {
  ownWorkshops: Record<string, Workshop>;
  remoteWorkshops: Workshop[]; // fetched from Supabase
  hydrating: boolean;
  hydrateAll: () => Promise<void>;
  hydrateById: (workshopId: string) => Promise<void>;
  ensureWorkshop: (workshopId: string, ownerId?: string) => Workshop;
  getWorkshop: (workshopId: string) => Workshop | null;
  updateWorkshop: (workshopId: string, patch: Partial<Workshop>) => void;
  setOwner: (workshopId: string, owner: WorkshopOwner) => void;
  setFiscal: (workshopId: string, fiscal: WorkshopFiscalData) => void;
  setHours: (workshopId: string, hours: WorkshopHours) => void;
  setServices: (workshopId: string, services: Partial<Record<ServiceKey, number>>) => void;
  addOverride: (workshopId: string, override: Omit<ServicePriceOverride, "id">) => void;
  removeOverride: (workshopId: string, overrideId: string) => void;
  addVacation: (workshopId: string, vacation: Omit<WorkshopVacation, "id">) => void;
  removeVacation: (workshopId: string, vacationId: string) => void;
  setAcceptingRequests: (workshopId: string, accepting: boolean) => void;
  setStatus: (workshopId: string, status: WorkshopStatus) => void;
  isOnboardingComplete: (workshopId: string) => boolean;
  missingOnboardingSteps: (workshopId: string) => string[];
};

export const useWorkshopStore = create<WorkshopState>()(
  persist(
    (set, get) => ({
      ownWorkshops: {},
      remoteWorkshops: [],
      hydrating: false,

      hydrateAll: async () => {
        if (!isSupabaseConfigured) return;
        set({ hydrating: true });
        try {
          const list = await workshopsService.listVisibleWorkshops();
          set({ remoteWorkshops: list });
        } finally {
          set({ hydrating: false });
        }
      },

      hydrateById: async (workshopId) => {
        if (!isSupabaseConfigured) return;
        const ws = await workshopsService.getWorkshopById(workshopId);
        if (ws) {
          const own = get().ownWorkshops[workshopId];
          if (own || ws.ownerId) {
            set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: ws } });
          } else {
            const others = get().remoteWorkshops.filter((w) => w.id !== workshopId);
            set({ remoteWorkshops: [...others, ws] });
          }
        }
      },

      ensureWorkshop: (workshopId, ownerId) => {
        const existing = get().ownWorkshops[workshopId];
        if (existing) return existing;
        const draft = buildDraftWorkshop(workshopId, ownerId);
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: draft } });
        return draft;
      },

      getWorkshop: (workshopId) => {
        const own = get().ownWorkshops[workshopId];
        if (own) return own;
        const remote = get().remoteWorkshops.find((w) => w.id === workshopId);
        if (remote) return remote;
        const mock = MOCK_WORKSHOPS.find((w) => w.id === workshopId);
        return mock ?? null;
      },

      updateWorkshop: (workshopId, patch) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const next = { ...own, ...patch };
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: next } });
        workshopsService.updateWorkshop(workshopId, patch).catch(() => undefined);
      },

      setOwner: (workshopId, owner) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, owner } } });
        workshopsService.setOwner(workshopId, owner).catch(() => undefined);
      },

      setFiscal: (workshopId, fiscalData) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, fiscalData } } });
        workshopsService.setFiscal(workshopId, fiscalData).catch(() => undefined);
      },

      setHours: (workshopId, hours) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, hours } } });
        workshopsService.setHours(workshopId, hours).catch(() => undefined);
      },

      setServices: (workshopId, services) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({ ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, services } } });
        workshopsService.setServices(workshopId, services).catch(() => undefined);
      },

      addOverride: (workshopId, override) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const newOverride: ServicePriceOverride = { id: `ov-${generateId()}`, ...override };
        const overrides = [...(own.priceOverrides ?? []), newOverride];
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, priceOverrides: overrides },
          },
        });
        workshopsService.addOverride(workshopId, override).then((res) => {
          if (res.ok && res.id) {
            // sostituisci id locale con quello del server
            const w = get().ownWorkshops[workshopId];
            if (!w) return;
            set({
              ownWorkshops: {
                ...get().ownWorkshops,
                [workshopId]: {
                  ...w,
                  priceOverrides: (w.priceOverrides ?? []).map((o) =>
                    o.id === newOverride.id ? { ...o, id: res.id! } : o
                  ),
                },
              },
            });
          }
        }).catch(() => undefined);
      },

      removeOverride: (workshopId, overrideId) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const overrides = (own.priceOverrides ?? []).filter((o) => o.id !== overrideId);
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, priceOverrides: overrides },
          },
        });
        workshopsService.removeOverride(overrideId).catch(() => undefined);
      },

      addVacation: (workshopId, vacation) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const newVacation: WorkshopVacation = { id: `vac-${generateId()}`, ...vacation };
        const vacations = [...(own.vacations ?? []), newVacation];
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, vacations } },
        });
        workshopsService.addVacation(workshopId, vacation).then((res) => {
          if (res.ok && res.id) {
            const w = get().ownWorkshops[workshopId];
            if (!w) return;
            set({
              ownWorkshops: {
                ...get().ownWorkshops,
                [workshopId]: {
                  ...w,
                  vacations: (w.vacations ?? []).map((v) =>
                    v.id === newVacation.id ? { ...v, id: res.id! } : v
                  ),
                },
              },
            });
          }
        }).catch(() => undefined);
      },

      removeVacation: (workshopId, vacationId) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const vacations = (own.vacations ?? []).filter((v) => v.id !== vacationId);
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, vacations } },
        });
        workshopsService.removeVacation(vacationId).catch(() => undefined);
      },

      setAcceptingRequests: (workshopId, accepting) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, acceptingRequests: accepting },
          },
        });
        workshopsService.updateWorkshop(workshopId, { acceptingRequests: accepting }).catch(() => undefined);
      },

      setStatus: (workshopId, status) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, status } },
        });
        workshopsService.updateWorkshop(workshopId, { status }).catch(() => undefined);
      },

      isOnboardingComplete: (workshopId) =>
        get().missingOnboardingSteps(workshopId).length === 0,

      missingOnboardingSteps: (workshopId) => {
        const w = get().ownWorkshops[workshopId];
        if (!w) return ["owner", "fiscal", "workshop", "hours", "services"];
        const missing: string[] = [];
        if (!w.owner?.firstName || !w.owner?.lastName || !w.owner?.phone) missing.push("owner");
        if (!w.fiscalData?.legalName || !w.fiscalData?.vatNumber || !w.fiscalData?.taxCode)
          missing.push("fiscal");
        if (!w.name || !w.address || !w.city || !w.cap || !w.province || (w.photos?.length ?? 0) < 1)
          missing.push("workshop");
        if (!w.hours) missing.push("hours");
        if (Object.keys(w.services ?? {}).length < 1) missing.push("services");
        return missing;
      },
    }),
    {
      name: "nvmcars-workshops",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({ ownWorkshops: state.ownWorkshops }),
    }
  )
);

export function useOwnWorkshop(workshopId: string | undefined): Workshop | null {
  return useWorkshopStore((s) => (workshopId ? s.ownWorkshops[workshopId] ?? null : null));
}

export function useResolvedWorkshop(workshopId: string | undefined): Workshop | null {
  return useWorkshopStore((s) => {
    if (!workshopId) return null;
    return (
      s.ownWorkshops[workshopId] ??
      s.remoteWorkshops.find((w) => w.id === workshopId) ??
      MOCK_WORKSHOPS.find((w) => w.id === workshopId) ??
      null
    );
  });
}
