import { create } from "zustand";

interface SidebarState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => {
  // Ambil state awal dari localStorage jika ada, default ke true
  const savedState = localStorage.getItem("sidebar_open");
  const initialOpen = savedState !== null ? savedState === "true" : true;

  return {
    open: initialOpen,
    setOpen: (open) => {
      localStorage.setItem("sidebar_open", String(open));
      set({ open });
    },
    toggleSidebar: () =>
      set((state) => {
        const nextOpen = !state.open;
        localStorage.setItem("sidebar_open", String(nextOpen));
        return { open: nextOpen };
      }),
  };
});
