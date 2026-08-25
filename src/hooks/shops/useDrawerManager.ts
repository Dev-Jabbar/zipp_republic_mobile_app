import { useRef, useState } from "react";

export type DrawerName = "cart" | "search" | "menu" | "filter" | null;

const DRAWER_SWITCH_DELAY = 300;

export function useDrawerManager() {
  const [activeDrawer, setActiveDrawer] = useState<DrawerName>(null);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = (name: DrawerName) => {
    if (switchTimer.current) clearTimeout(switchTimer.current);

    if (activeDrawer && activeDrawer !== name) {
      setActiveDrawer(null);
      switchTimer.current = setTimeout(
        () => setActiveDrawer(name),
        DRAWER_SWITCH_DELAY,
      );
    } else {
      setActiveDrawer(name);
    }
  };

  const closeDrawer = () => {
    if (switchTimer.current) clearTimeout(switchTimer.current);
    setActiveDrawer(null);
  };

  const toggleDrawer = (name: DrawerName) => {
    if (activeDrawer === name) {
      closeDrawer();
    } else {
      openDrawer(name);
    }
  };

  return { activeDrawer, openDrawer, closeDrawer, toggleDrawer };
}
