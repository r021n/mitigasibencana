import { create } from "zustand";

interface AccessibilityState {
  fontSizeScale: number;
  lineHeightScale: number;
  buttonPosition: { x: number; y: number } | null;
  showReadingLine: boolean;
  showReadingMask: boolean;
  useLargeCursor: boolean;
  setFontSizeScale: (scale: number) => void;
  setLineHeightScale: (scale: number) => void;
  setButtonPosition: (pos: { x: number; y: number } | null) => void;
  setShowReadingLine: (val: boolean) => void;
  setShowReadingMask: (val: boolean) => void;
  setUseLargeCursor: (val: boolean) => void;
  resetSettings: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => {
  // Ambil data awal dari localStorage jika tersedia
  const savedFontScale = localStorage.getItem("acc_font_scale");
  const savedLineHeightScale = localStorage.getItem("acc_line_height_scale");
  const savedPosition = localStorage.getItem("acc_button_position");
  const savedReadingLine = localStorage.getItem("acc_reading_line");
  const savedReadingMask = localStorage.getItem("acc_reading_mask");
  const savedLargeCursor = localStorage.getItem("acc_large_cursor");

  const initialFontScale = savedFontScale !== null ? parseFloat(savedFontScale) : 1.0;
  const initialLineHeightScale = savedLineHeightScale !== null ? parseFloat(savedLineHeightScale) : 1.0;
  const initialPosition = savedPosition !== null ? JSON.parse(savedPosition) : null;
  const initialReadingLine = savedReadingLine === "true";
  const initialReadingMask = savedReadingMask === "true";
  const initialLargeCursor = savedLargeCursor === "true";

  return {
    fontSizeScale: initialFontScale,
    lineHeightScale: initialLineHeightScale,
    buttonPosition: initialPosition,
    showReadingLine: initialReadingLine,
    showReadingMask: initialReadingMask,
    useLargeCursor: initialLargeCursor,

    setFontSizeScale: (scale) => {
      localStorage.setItem("acc_font_scale", String(scale));
      set({ fontSizeScale: scale });
    },

    setLineHeightScale: (scale) => {
      localStorage.setItem("acc_line_height_scale", String(scale));
      set({ lineHeightScale: scale });
    },

    setButtonPosition: (pos) => {
      if (pos === null) {
        localStorage.removeItem("acc_button_position");
      } else {
        localStorage.setItem("acc_button_position", JSON.stringify(pos));
      }
      set({ buttonPosition: pos });
    },

    setShowReadingLine: (val) => {
      localStorage.setItem("acc_reading_line", String(val));
      set({ showReadingLine: val });
    },

    setShowReadingMask: (val) => {
      localStorage.setItem("acc_reading_mask", String(val));
      set({ showReadingMask: val });
    },

    setUseLargeCursor: (val) => {
      localStorage.setItem("acc_large_cursor", String(val));
      set({ useLargeCursor: val });
    },

    resetSettings: () => {
      localStorage.removeItem("acc_font_scale");
      localStorage.removeItem("acc_line_height_scale");
      localStorage.removeItem("acc_reading_line");
      localStorage.removeItem("acc_reading_mask");
      localStorage.removeItem("acc_large_cursor");
      set({
        fontSizeScale: 1.0,
        lineHeightScale: 1.0,
        showReadingLine: false,
        showReadingMask: false,
        useLargeCursor: false,
      });
    },
  };
});
