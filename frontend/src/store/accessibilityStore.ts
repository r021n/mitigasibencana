import { create } from "zustand";

interface AccessibilityState {
  fontSizeScale: number;
  lineHeightScale: number;
  letterSpacing: number;
  buttonPosition: { x: number; y: number } | null;
  showReadingLine: boolean;
  showReadingMask: boolean;
  useLargeCursor: boolean;
  fontBold: boolean;
  readableFont: boolean;
  ttsOnHover: boolean;
  monochrome: boolean;
  highlightInteractive: boolean;
  setFontSizeScale: (scale: number) => void;
  setLineHeightScale: (scale: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setButtonPosition: (pos: { x: number; y: number } | null) => void;
  setShowReadingLine: (val: boolean) => void;
  setShowReadingMask: (val: boolean) => void;
  setUseLargeCursor: (val: boolean) => void;
  setFontBold: (val: boolean) => void;
  setReadableFont: (val: boolean) => void;
  setTtsOnHover: (val: boolean) => void;
  setMonochrome: (val: boolean) => void;
  setHighlightInteractive: (val: boolean) => void;
  resetSettings: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => {
  // Ambil data awal dari localStorage jika tersedia
  const savedFontScale = localStorage.getItem("acc_font_scale");
  const savedLineHeightScale = localStorage.getItem("acc_line_height_scale");
  const savedLetterSpacing = localStorage.getItem("acc_letter_spacing");
  const savedPosition = localStorage.getItem("acc_button_position");
  const savedReadingLine = localStorage.getItem("acc_reading_line");
  const savedReadingMask = localStorage.getItem("acc_reading_mask");
  const savedLargeCursor = localStorage.getItem("acc_large_cursor");
  const savedFontBold = localStorage.getItem("acc_font_bold");
  const savedReadableFont = localStorage.getItem("acc_readable_font");
  const savedTtsOnHover = localStorage.getItem("acc_tts_on_hover");
  const savedMonochrome = localStorage.getItem("acc_monochrome");
  const savedHighlightInteractive = localStorage.getItem("acc_highlight_interactive");

  const initialFontScale = savedFontScale !== null ? parseFloat(savedFontScale) : 1.0;
  const initialLineHeightScale = savedLineHeightScale !== null ? parseFloat(savedLineHeightScale) : 1.0;
  const initialLetterSpacing = savedLetterSpacing !== null ? parseFloat(savedLetterSpacing) : 0;
  const initialPosition = savedPosition !== null ? JSON.parse(savedPosition) : null;
  const initialReadingLine = savedReadingLine === "true";
  const initialReadingMask = savedReadingMask === "true";
  const initialLargeCursor = savedLargeCursor === "true";
  const initialFontBold = savedFontBold === "true";
  const initialReadableFont = savedReadableFont === "true";
  const initialTtsOnHover = savedTtsOnHover === "true";
  const initialMonochrome = savedMonochrome === "true";
  const initialHighlightInteractive = savedHighlightInteractive === "true";

  return {
    fontSizeScale: initialFontScale,
    lineHeightScale: initialLineHeightScale,
    letterSpacing: initialLetterSpacing,
    buttonPosition: initialPosition,
    showReadingLine: initialReadingLine,
    showReadingMask: initialReadingMask,
    useLargeCursor: initialLargeCursor,
    fontBold: initialFontBold,
    readableFont: initialReadableFont,
    ttsOnHover: initialTtsOnHover,
    monochrome: initialMonochrome,
    highlightInteractive: initialHighlightInteractive,

    setFontSizeScale: (scale) => {
      localStorage.setItem("acc_font_scale", String(scale));
      set({ fontSizeScale: scale });
    },

    setLineHeightScale: (scale) => {
      localStorage.setItem("acc_line_height_scale", String(scale));
      set({ lineHeightScale: scale });
    },

    setLetterSpacing: (spacing) => {
      localStorage.setItem("acc_letter_spacing", String(spacing));
      set({ letterSpacing: spacing });
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

    setFontBold: (val) => {
      localStorage.setItem("acc_font_bold", String(val));
      set({ fontBold: val });
    },

    setReadableFont: (val) => {
      localStorage.setItem("acc_readable_font", String(val));
      set({ readableFont: val });
    },

    setTtsOnHover: (val) => {
      localStorage.setItem("acc_tts_on_hover", String(val));
      set({ ttsOnHover: val });
    },

    setMonochrome: (val) => {
      localStorage.setItem("acc_monochrome", String(val));
      set({ monochrome: val });
    },

    setHighlightInteractive: (val) => {
      localStorage.setItem("acc_highlight_interactive", String(val));
      set({ highlightInteractive: val });
    },

    resetSettings: () => {
      localStorage.removeItem("acc_font_scale");
      localStorage.removeItem("acc_line_height_scale");
      localStorage.removeItem("acc_letter_spacing");
      localStorage.removeItem("acc_reading_line");
      localStorage.removeItem("acc_reading_mask");
      localStorage.removeItem("acc_large_cursor");
      localStorage.removeItem("acc_font_bold");
      localStorage.removeItem("acc_readable_font");
      localStorage.removeItem("acc_tts_on_hover");
      localStorage.removeItem("acc_monochrome");
      localStorage.removeItem("acc_highlight_interactive");
      set({
        fontSizeScale: 1.0,
        lineHeightScale: 1.0,
        letterSpacing: 0,
        showReadingLine: false,
        showReadingMask: false,
        useLargeCursor: false,
        fontBold: false,
        readableFont: false,
        ttsOnHover: false,
        monochrome: false,
        highlightInteractive: false,
      });
    },
  };
});
