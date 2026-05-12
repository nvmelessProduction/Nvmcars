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
        const mock = MOCK_WORKSHOPS.find((w) => w.id === workshopId);
        return mock ?? null;
      },
      updateWorkshop: (workshopId, patch) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, ...patch } },
        });
      },
      setOwner: (workshopId, owner) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, owner } },
        });
      },
      setFiscal: (workshopId, fiscalData) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, fiscalData } },
        });
      },
      setHours: (workshopId, hours) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, hours } },
        });
      },
      setServices: (workshopId, services) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: { ...get().ownWorkshops, [workshopId]: { ...own, services } },
        });
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
      },
      addVacation: (workshopId, vacation) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const newVacation: WorkshopVacation = { id: `vac-${generateId()}`, ...vacation };
        const vacations = [...(own.vacations ?? []), newVacation];
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, vacations },
          },
        });
      },
      removeVacation: (workshopId, vacationId) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        const vacations = (own.vacations ?? []).filter((v) => v.id !== vacationId);
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, vacations },
          },
        });
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
      },
      setStatus: (workshopId, status) => {
        const own = get().ownWorkshops[workshopId];
        if (!own) return;
        set({
          ownWorkshops: {
            ...get().ownWorkshops,
            [workshopId]: { ...own, status },
          },
        });
      },
      isOnboardingComplete: (workshopId) => {
        return get().missingOnboardingSteps(workshopId).length === 0;
      },
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
    }
  )
);

export function useOwnWorkshop(workshopId: string | undefined): Workshop | null {
  return useWorkshopStore((s) => (workshopId ? s.ownWorkshops[workshopId] ?? null : null));
}

export function useResolvedWorkshop(workshopId: string | undefined): Workshop | null {
  return useWorkshopStore((s) => {
    if (!workshopId) return null;
    return s.ownWorkshops[workshopId] ?? MOCK_WORKSHOPS.find((w) => w.id === workshopId) ?? null;
  });
}
