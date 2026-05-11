import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Car } from "@/types";

type CarState = {
  cars: Car[];
  activeCarId: string | null;
  addCar: (car: Omit<Car, "id">) => Car;
  updateCar: (id: string, patch: Partial<Car>) => void;
  removeCar: (id: string) => void;
  setActiveCar: (id: string | null) => void;
};

const generateId = () => `car-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export const useCarStore = create<CarState>()(
  persist(
    (set, get) => ({
      cars: [],
      activeCarId: null,
      addCar: (data) => {
        const newCar: Car = { id: generateId(), ...data };
        set({ cars: [...get().cars, newCar], activeCarId: newCar.id });
        return newCar;
      },
      updateCar: (id, patch) =>
        set({
          cars: get().cars.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }),
      removeCar: (id) => {
        const remaining = get().cars.filter((c) => c.id !== id);
        const activeId =
          get().activeCarId === id ? remaining[0]?.id ?? null : get().activeCarId;
        set({ cars: remaining, activeCarId: activeId });
      },
      setActiveCar: (id) => set({ activeCarId: id }),
    }),
    {
      name: "nvmcars-cars",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function useActiveCar(): Car | null {
  const cars = useCarStore((s) => s.cars);
  const activeCarId = useCarStore((s) => s.activeCarId);
  return cars.find((c) => c.id === activeCarId) ?? null;
}
