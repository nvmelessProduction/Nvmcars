import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AdminUser, AuthUser, CustomerUser, ProfessionalUser } from "@/types";
import { consumeInviteCode, validateInviteCode } from "@/data/inviteCodes";
import { isAdminEmail, isValidAdminPassword } from "@/data/admins";
import { isSupabaseConfigured } from "@/lib/supabase";
import * as authService from "@/services/auth";

type AuthState = {
  user: AuthUser | null;
  hasOnboarded: boolean;
  authLoading: boolean;
  /** Snapshot dell'utente "vero" (admin) quando sta impersonando un cliente/pro */
  switchSnapshot: AuthUser | null;
  finishOnboarding: () => void;
  loginAs: (user: AuthUser) => void;
  setUser: (user: AuthUser | null) => void;
  loginAsAdmin: () => void;
  impersonateCustomer: () => void;
  impersonatePro: () => void;
  restoreAdmin: () => void;
  isImpersonating: () => boolean;
  signupCustomer: (
    data: { email: string; password: string; name: string; phone: string }
  ) => Promise<{ ok: true; user: CustomerUser; needsEmailVerification?: boolean } | { ok: false; reason: string }>;
  signupProfessional: (
    data: {
      email: string;
      password: string;
      name: string;
      phone: string;
      vatNumber: string;
      inviteCode: string;
    }
  ) => Promise<{ ok: true; user: ProfessionalUser; needsEmailVerification?: boolean } | { ok: false; reason: string }>;
  loginWithPassword: (
    email: string,
    password: string
  ) => Promise<{ ok: true; user: AuthUser } | { ok: false; reason: string }>;
  registerCustomer: (data: Omit<CustomerUser, "id" | "role">) => CustomerUser;
  registerProfessional: (
    data: Omit<ProfessionalUser, "id" | "role" | "workshopId">
  ) => { ok: true; user: ProfessionalUser } | { ok: false; reason: string };
  logout: () => Promise<void>;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEMO_CUSTOMER: CustomerUser = {
  id: "demo-customer",
  role: "customer",
  email: "demo@cliente.it",
  name: "Marco Cliente",
  phone: "+393331110000",
};

const DEMO_PRO: ProfessionalUser = {
  id: "demo-pro",
  role: "professional",
  email: "demo@pro.it",
  name: "Officina Demo",
  phone: "+393331110001",
  vatNumber: "12345678901",
  workshopId: "w1",
  inviteCode: "NVM-CRV-A4F9",
};

const DEMO_ADMIN: AdminUser = {
  id: "demo-admin",
  role: "admin",
  email: "admin@nvmcars.it",
  name: "Admin Nvmcars",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasOnboarded: false,
      authLoading: false,
      switchSnapshot: null,
      finishOnboarding: () => set({ hasOnboarded: true }),
      loginAs: (user) => set({ user, switchSnapshot: null }),
      setUser: (user) => set({ user }),
      loginAsAdmin: () => set({ user: DEMO_ADMIN, switchSnapshot: null }),
      impersonateCustomer: () => {
        const current = get().user;
        const snapshot = current?.role === "admin" ? current : get().switchSnapshot;
        set({ user: DEMO_CUSTOMER, switchSnapshot: snapshot });
      },
      impersonatePro: () => {
        const current = get().user;
        const snapshot = current?.role === "admin" ? current : get().switchSnapshot;
        set({ user: DEMO_PRO, switchSnapshot: snapshot });
      },
      restoreAdmin: () => {
        const snap = get().switchSnapshot;
        if (snap && snap.role === "admin") {
          set({ user: snap, switchSnapshot: null });
        } else {
          set({ user: DEMO_ADMIN, switchSnapshot: null });
        }
      },
      isImpersonating: () => {
        const snap = get().switchSnapshot;
        return Boolean(snap && snap.role === "admin");
      },

      signupCustomer: async (data) => {
        set({ authLoading: true });
        try {
          const res = await authService.signupCustomer(data);
          if (res.ok && res.user.role === "customer") {
            set({ user: res.user });
            return { ok: true, user: res.user, needsEmailVerification: res.needsEmailVerification };
          }
          if (!res.ok) return { ok: false, reason: res.reason };
          return { ok: false, reason: "Unexpected role" };
        } finally {
          set({ authLoading: false });
        }
      },

      signupProfessional: async (data) => {
        set({ authLoading: true });
        try {
          if (!isSupabaseConfigured) {
            const result = validateInviteCode(data.inviteCode);
            if (!result.ok) {
              return { ok: false, reason: result.reason ?? "Codice non valido." };
            }
            consumeInviteCode(data.inviteCode);
          }
          const res = await authService.signupProfessional(data);
          if (res.ok && res.user.role === "professional") {
            set({ user: res.user });
            return { ok: true, user: res.user, needsEmailVerification: res.needsEmailVerification };
          }
          if (!res.ok) return { ok: false, reason: res.reason };
          return { ok: false, reason: "Unexpected role" };
        } finally {
          set({ authLoading: false });
        }
      },

      loginWithPassword: async (email, password) => {
        set({ authLoading: true });
        try {
          // ADMIN PATH (bypassa Supabase): email in whitelist + password locale.
          // Non serve avere l'account nel DB Supabase. Canale interno operativo.
          if (isAdminEmail(email)) {
            if (!isValidAdminPassword(password)) {
              return { ok: false, reason: "Password admin errata" };
            }
            const cleanEmail = email.trim().toLowerCase();
            const adminUser: AdminUser = {
              id: "admin-" + cleanEmail,
              role: "admin",
              email: cleanEmail,
              name: cleanEmail.split("@")[0] ?? "Admin",
            };
            set({ user: adminUser, switchSnapshot: null });
            return { ok: true, user: adminUser };
          }

          // Utenti normali: passano per Supabase (o mock).
          const res = await authService.login({ email, password });
          if (res.ok) {
            set({ user: res.user });
            return { ok: true, user: res.user };
          }
          return { ok: false, reason: res.reason };
        } finally {
          set({ authLoading: false });
        }
      },

      // Legacy sync APIs (mock mode) - mantieni per retrocompat con screens vecchie
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

      logout: async () => {
        await authService.logout();
        set({ user: null });
      },
    }),
    {
      name: "nvmcars-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasOnboarded: state.hasOnboarded,
        switchSnapshot: state.switchSnapshot,
      }),
    }
  )
);
