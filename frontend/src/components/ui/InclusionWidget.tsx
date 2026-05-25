import React, { useState, useEffect, useRef } from "react";
import { useAccessibilityStore } from "../../store/accessibilityStore";

export default function InclusionWidget() {
  const {
    fontSizeScale,
    lineHeightScale,
    buttonPosition,
    showReadingLine,
    showReadingMask,
    useLargeCursor,
    setFontSizeScale,
    setLineHeightScale,
    setButtonPosition,
    setShowReadingLine,
    setShowReadingMask,
    setUseLargeCursor,
    resetSettings,
  } = useAccessibilityStore();

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [activeDrag, setActiveDrag] = useState(false);
  const [mouseY, setMouseY] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  
  const widgetRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Lebar dan tinggi tombol melayang
  const BUTTON_SIZE = 64;

  // Ukuran dropdown card (diperbesar secara signifikan sesuai permintaan agar lebih mudah dibaca)
  const CARD_WIDTH = 360;
  const CARD_HEIGHT = 310;

  // Inisialisasi posisi tombol melayang di layar
  useEffect(() => {
    const initX = buttonPosition?.x ?? (window.innerWidth - BUTTON_SIZE - 24);
    const initY = buttonPosition?.y ?? (window.innerHeight - BUTTON_SIZE - 24);
    
    // Pastikan posisi berada dalam batas layar awal
    const x = Math.max(16, Math.min(initX, window.innerWidth - BUTTON_SIZE - 16));
    const y = Math.max(16, Math.min(initY, window.innerHeight - BUTTON_SIZE - 16));
    
    setPosition({ x, y });
    setIsMounted(true);
  }, []);

  // Simpan posisi ke Zustand jika koordinat tombol valid dan sudah mounted
  useEffect(() => {
    if (isMounted && position.x > 0 && position.y > 0) {
      setButtonPosition(position);
    }
  }, [position, isMounted]);

  // Tangani perubahan ukuran jendela (resize) agar tombol tetap dalam layar
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const x = Math.max(16, Math.min(prev.x, window.innerWidth - BUTTON_SIZE - 16));
        const y = Math.max(16, Math.min(prev.y, window.innerHeight - BUTTON_SIZE - 16));
        return { x, y };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // pointerdown klik-luar untuk menutup dropdown secara otomatis
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: PointerEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.target as Node) &&
        widgetRef.current &&
        !widgetRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [isOpen]);

  // Event handler pergerakan mouse global untuk reading line & reading mask
  useEffect(() => {
    if (!showReadingLine && !showReadingMask) return;

    const handlePointerMoveGlobal = (e: PointerEvent) => {
      setMouseY(e.clientY);
    };

    window.addEventListener("pointermove", handlePointerMoveGlobal);
    return () => window.removeEventListener("pointermove", handlePointerMoveGlobal);
  }, [showReadingLine, showReadingMask]);

  // Pointer drag event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!widgetRef.current) return;
    
    widgetRef.current.setPointerCapture(e.pointerId);
    startX.current = e.clientX;
    startY.current = e.clientY;
    startPos.current = { x: position.x, y: position.y };
    isDragging.current = false;
    setActiveDrag(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!activeDrag) return;
    
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Deteksi jika pergerakan melebihi 5px (berarti sedang menyeret, bukan mengklik)
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      const nextX = startPos.current.x + dx;
      const nextY = startPos.current.y + dy;

      // Batasi agar tombol tidak keluar dari viewport
      const boundedX = Math.max(8, Math.min(nextX, window.innerWidth - BUTTON_SIZE - 8));
      const boundedY = Math.max(8, Math.min(nextY, window.innerHeight - BUTTON_SIZE - 8));

      setPosition({ x: boundedX, y: boundedY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!activeDrag) return;
    
    if (widgetRef.current) {
      widgetRef.current.releasePointerCapture(e.pointerId);
    }
    
    setActiveDrag(false);

    // Jika bukan menyeret, berarti aksi ini adalah KLIK
    if (!isDragging.current) {
      setIsOpen((prev) => !prev);
    }
  };

  if (!isMounted) return null;

  // Kalkulasi penempatan dropdown card secara dinamis menyesuaikan letak tombol
  const isLeft = position.x <= window.innerWidth / 2;
  const isTop = position.y <= window.innerHeight / 2;

  const cardLeft = isLeft 
    ? position.x // Sejajar sisi kiri tombol
    : position.x + BUTTON_SIZE - CARD_WIDTH; // Sejajar sisi kanan tombol

  const cardTop = isTop
    ? position.y + BUTTON_SIZE + 12 // Di bawah tombol
    : position.y - CARD_HEIGHT - 12; // Di atas tombol

  return (
    <>
      {/* Floating Action Button (FAB) Draggable */}
      <button
        ref={widgetRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: "none",
        }}
        className={`fixed z-50 w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-primary-container text-on-primary flex items-center justify-center cursor-grab active:cursor-grabbing select-none shadow-[0_12px_24px_rgba(0,74,198,0.35),inset_2px_2px_4px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_32px_rgba(0,74,198,0.45),inset_2px_2px_4px_rgba(255,255,255,0.5)] transition-shadow duration-200 focus:outline-none group`}
        title="Fitur Aksesibilitas"
      >
        <span
          className="material-symbols-outlined text-3xl font-bold transition-transform duration-300 group-hover:scale-110"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          accessibility_new
        </span>
        
        {/* Tooltip melayang */}
        <span 
          style={{ fontSize: "14px", lineHeight: "20px" }}
          className="absolute right-20 bg-inverse-surface text-inverse-on-surface font-semibold py-1.5 px-3 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-outline-variant/10"
        >
          Aksesibilitas
        </span>
      </button>

      {/* Dropdown Card Aksesibilitas */}
      {isOpen && (
        <div
          ref={cardRef}
          style={{
            left: `${cardLeft}px`,
            top: `${cardTop}px`,
            width: `${CARD_WIDTH}px`,
            height: `${CARD_HEIGHT}px`,
            
            // ISOLASI MUTLAK: Gunakan px absolut untuk seluruh layout, padding, margin, border, & radius
            padding: "24px",
            borderRadius: "28px",
            gap: "20px",
            border: "1px solid rgba(195, 198, 215, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            backgroundColor: "rgba(255, 255, 255, 0.99)",

            // Isolasi CSS custom property skala di tingkat CSS
            "--accessibility-font-scale": "1",
            "--accessibility-line-height-scale": "1",
            
            // Reset dasar font-size dan line-height dalam PIXEL mutlak agar tidak terpengaruh rem atau warisan line-height global
            fontSize: "16px",
            lineHeight: "24px",
          } as React.CSSProperties}
          className="clay-card backdrop-blur-md shadow-2xl fixed z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              userSelect: "none",
              fontSize: "18px",
              lineHeight: "26px",
              height: "36px",
              boxSizing: "border-box",
            }}
          >
            <span 
              style={{ 
                color: "#0b1c30", 
                fontWeight: "700", 
                display: "flex", 
                alignItems: "center", 
                gap: "8px", 
                fontSize: "18px",
                lineHeight: "26px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px", lineHeight: "1", color: "#004ac6" }}>settings_accessibility</span>
              Aksesibilitas Teks
            </span>
            
            <button
              onClick={resetSettings}
              title="Reset ke Default"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#eff4ff", 
                color: "#434655", 
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dce9ff";
                e.currentTarget.style.color = "#004ac6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#eff4ff";
                e.currentTarget.style.color = "#434655";
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", lineHeight: "1" }}>restart_alt</span>
            </button>
          </div>

          {/* Kontrol Slider */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", boxSizing: "border-box" }}>
            
            {/* Slider 1: Ukuran Teks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  fontWeight: "600", 
                  color: "#434655", 
                  userSelect: "none", 
                  fontSize: "14px",
                  lineHeight: "20px", // Kunci tinggi baris absolut
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", lineHeight: "20px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", lineHeight: "1" }}>format_size</span>
                  Ukuran Teks
                </span>
                <span style={{ color: "#004ac6", fontWeight: "700", fontSize: "14px", lineHeight: "20px" }}>{Math.round(fontSizeScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.0"
                step="0.05"
                value={fontSizeScale}
                onChange={(e) => setFontSizeScale(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  accentColor: "#004ac6",
                  outline: "none",
                  backgroundColor: "#e5eeff", 
                  margin: "0px",
                  padding: "0px",
                }}
              />
            </div>

            {/* Slider 2: Jarak Baris */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", boxSizing: "border-box" }}>
              <div 
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  fontWeight: "600", 
                  color: "#434655", 
                  userSelect: "none", 
                  fontSize: "14px",
                  lineHeight: "20px", // Kunci tinggi baris absolut
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", lineHeight: "20px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", lineHeight: "1" }}>format_line_spacing</span>
                  Jarak Baris
                </span>
                <span style={{ color: "#006c4a", fontWeight: "700", fontSize: "14px", lineHeight: "20px" }}>{Math.round(lineHeightScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={lineHeightScale}
                onChange={(e) => setLineHeightScale(parseFloat(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "9999px",
                  cursor: "pointer",
                  accentColor: "#006c4a",
                  outline: "none",
                  backgroundColor: "#e5eeff",
                  margin: "0px",
                  padding: "0px",
                }}
              />
            </div>

          </div>

          {/* Fitur Tambahan (Reading Line, Reading Mask, Large Cursor) */}
          <div 
            style={{ 
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
              borderTop: "1px solid rgba(195, 198, 215, 0.4)",
              paddingTop: "16px",
              boxSizing: "border-box",
            }}
          >
            {/* Toggle 1: Garis Baca */}
            <button
              onClick={() => setShowReadingLine(!showReadingLine)}
              style={{
                padding: "10px 6px",
                borderRadius: "14px",
                border: showReadingLine ? "1px solid #004ac6" : "1px solid rgba(195, 198, 215, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                userSelect: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: showReadingLine ? "rgba(0, 74, 198, 0.08)" : "#f8f9ff",
                color: showReadingLine ? "#004ac6" : "#434655",
                fontWeight: showReadingLine ? "700" : "500",
                boxSizing: "border-box",
                fontSize: "12px",
                lineHeight: "16px", // Kunci tinggi baris absolut
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", lineHeight: "1" }}>horizontal_rule</span>
              <span style={{ fontSize: "12px", lineHeight: "16px", textAlign: "center" }}>Garis Baca</span>
            </button>

            {/* Toggle 2: Masker Baca */}
            <button
              onClick={() => setShowReadingMask(!showReadingMask)}
              style={{
                padding: "10px 6px",
                borderRadius: "14px",
                border: showReadingMask ? "1px solid #004ac6" : "1px solid rgba(195, 198, 215, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                userSelect: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: showReadingMask ? "rgba(0, 74, 198, 0.08)" : "#f8f9ff",
                color: showReadingMask ? "#004ac6" : "#434655",
                fontWeight: showReadingMask ? "700" : "500",
                boxSizing: "border-box",
                fontSize: "12px",
                lineHeight: "16px", // Kunci tinggi baris absolut
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", lineHeight: "1" }}>menu</span>
              <span style={{ fontSize: "12px", lineHeight: "16px", textAlign: "center" }}>Masker Baca</span>
            </button>

            {/* Toggle 3: Kursor Besar */}
            <button
              onClick={() => setUseLargeCursor(!useLargeCursor)}
              style={{
                padding: "10px 6px",
                borderRadius: "14px",
                border: useLargeCursor ? "1px solid #004ac6" : "1px solid rgba(195, 198, 215, 0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                userSelect: "none",
                cursor: "pointer",
                transition: "all 0.15s ease",
                backgroundColor: useLargeCursor ? "rgba(0, 74, 198, 0.08)" : "#f8f9ff",
                color: useLargeCursor ? "#004ac6" : "#434655",
                fontWeight: useLargeCursor ? "700" : "500",
                boxSizing: "border-box",
                fontSize: "12px",
                lineHeight: "16px", // Kunci tinggi baris absolut
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px", lineHeight: "1" }}>near_me</span>
              <span style={{ fontSize: "12px", lineHeight: "16px", textAlign: "center" }}>Kursor Besar</span>
            </button>
          </div>

        </div>
      )}

      {/* Reading Line Element */}
      {showReadingLine && (
        <div
          style={{
            top: `${mouseY}px`,
          }}
          className="fixed left-0 w-full h-1 bg-primary pointer-events-none z-[9999] shadow-[0_0_8px_rgba(0,74,198,0.6)] transition-[top] duration-75 ease-out"
        ></div>
      )}

      {/* Reading Mask Elements */}
      {showReadingMask && (
        <>
          {/* Top dim area */}
          <div
            style={{
              height: `${Math.max(0, mouseY - 60)}px`,
            }}
            className="fixed top-0 left-0 w-full bg-black/40 pointer-events-none z-[9997] transition-[height] duration-75 ease-out"
          ></div>
          {/* Bottom dim area */}
          <div
            style={{
              top: `${mouseY + 60}px`,
            }}
            className="fixed bottom-0 left-0 w-full bg-black/40 pointer-events-none z-[9997] transition-[top] duration-75 ease-out"
          ></div>
        </>
      )}
    </>
  );
}
