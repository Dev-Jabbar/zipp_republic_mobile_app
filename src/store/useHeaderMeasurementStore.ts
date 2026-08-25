import { create } from "zustand";

interface HeaderMeasurementState {
  headerHeight: number;
  setHeaderHeight: (height: number) => void;
}

export const useHeaderMeasurementStore = create<HeaderMeasurementState>(
  (set) => ({
    headerHeight: 0,
    setHeaderHeight: (height) => set({ headerHeight: height }),
  }),
);
