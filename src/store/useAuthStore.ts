import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthUser, CustomerUser, ProfessionalUser } from "@/types";
import { consumeInviteCode, validateInviteCode } from "@/data/inviteCodes";

type AuthState = {
  user: AuthUser | null;
  hasOnboarded: boolean;
  finishOnboarding: () => void;
  loginAs: (user: AuthUser) => void;
  registerCustomer: (data: Omit<CustomerUser, "id" | "role">) => CustomerUser;
  registerProfessional: (
    data: Omit<ProfessionalUser, "id" | "role" | "workshopId">
  ) => { ok: true; user: ProfessionalUser } | { ok: false; reason: string };
  logout: () => void;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasOnboarded: false,
      finishOnboarding: () => set({ hasOnboarded: true }),
      loginAs: (user) => set({ user }),
      registerCustomer: (data) => {
        const newUser: CustomerUser = {
          id: generateId(),
          role: "customer",
          ...data,
        };
        set({ user: newUser });
        return newUser;
      },
      registerProfessional: (data) => {
        const result = validateInviteCode(data.inviteCode);
        if (!result.ok) {
          return { ok: false, reason: result.reason ?? "Codice non valido." };
        }
        consumeInviteCode(data.inviteCode);
        const newUser: ProfessionalUser = {
          id: generateId(),
          role: "professional",
          workshopId: `workshop-${generateId()}`,
          ...data,
        };
        set({ user: newUser });
        return { ok: true, user: newUser };
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "nvmcars-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasOnboarded: state.hasOnboarded,
      }),
    }
  )
);
