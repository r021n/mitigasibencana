import React, { useEffect, useRef } from "react";
import type {
  YoutubeAnalysis,
  ChatMessage,
} from "../../../pages/VideoAnalysisPage"; // Sesuaikan path
import CustomMarkdownRenderer from "./CustomMarkdownRenderer";

interface ChatDrawerProps {
  activeAnalysis: YoutubeAnalysis | null;
  onClose: () => void;
  chats: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  isSendingChat: boolean;
  onSendChat: (e?: React.FormEvent, customText?: string) => void;
}

export default function ChatDrawer({
  activeAnalysis,
  onClose,
  chats,
  chatInput,
  setChatInput,
  isSendingChat,
  onSendChat,
}: ChatDrawerProps) {
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat ke bawah ketika ada pesan baru
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats]);

  if (!activeAnalysis) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex justify-end">
      {/* Overlay background */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer container */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest border-l border-outline-variant/40 shadow-2xl h-screen flex flex-col z-10 transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low select-none">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl font-bold">
                psychology
              </span>
            </div>
            <div>
              <h3 className="font-bold text-on-surface text-sm line-clamp-1 leading-snug">
                Tanya Jawab Inklusi
              </h3>
              <p className="text-[10px] text-on-surface-variant max-w-[280px] truncate">
                {activeAnalysis.title || "Video YouTube"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Chats content area */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-surface/30">
          {/* Introduction card */}
          <div className="bg-secondary/5 rounded-xl p-3 border border-secondary/15 text-xs text-on-surface-variant leading-relaxed select-none mb-2">
            <span className="font-bold text-secondary block mb-1">
              💡 Tips Bertanya:
            </span>
            Anda bisa menanyakan panduan detail langkah demi langkah untuk
            memperbaiki video ini, meminta template subtitle, atau konsultasi
            seputar inklusi disabilitas.
          </div>

          {chats.length === 0 && (
            <div className="py-12 text-center text-on-surface-variant/40 select-none">
              <span className="material-symbols-outlined text-5xl mb-2 animate-bounce">
                chat_bubble
              </span>
              <p className="text-xs font-semibold">
                Mulai percakapan Anda dengan AI pakar inklusi di bawah!
              </p>
            </div>
          )}

          {chats.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col max-w-[85%] ${c.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <span className="text-[9px] text-on-surface-variant/50 font-bold mb-1 select-none uppercase tracking-wide">
                {c.role === "user" ? "Anda" : "Gemini AI Pakar"}
              </span>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm shadow-[1px_2px_4px_rgba(0,0,0,0.05)] leading-relaxed ${
                  c.role === "user"
                    ? "bg-primary text-on-primary rounded-tr-none whitespace-pre-line"
                    : "bg-surface-container border border-outline-variant/15 text-on-surface rounded-tl-none w-full"
                }`}
              >
                {c.role === "user" ? (
                  c.content
                ) : (
                  <CustomMarkdownRenderer
                    text={c.content}
                    className="text-on-surface font-normal text-sm"
                  />
                )}
              </div>
            </div>
          ))}

          {/* Pulsing loading skeleton */}
          {isSendingChat && (
            <div className="flex flex-col items-start max-w-[80%] mr-auto">
              <span className="text-[9px] text-on-surface-variant/50 font-bold mb-1 select-none">
                Gemini AI Pakar sedang mengetik...
              </span>
              <div className="rounded-2xl rounded-tl-none px-4 py-3 bg-surface-container border border-outline-variant/15 w-[200px] space-y-2 animate-pulse">
                <div className="h-2 bg-on-surface-variant/20 rounded w-full" />
                <div className="h-2 bg-on-surface-variant/20 rounded w-5/6" />
                <div className="h-2 bg-on-surface-variant/20 rounded w-2/3" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 py-2 border-t border-outline-variant/10 bg-surface-container-lowest flex gap-2 overflow-x-auto select-none custom-scrollbar flex-nowrap shrink-0">
          <button
            disabled={isSendingChat}
            onClick={(e) =>
              onSendChat(
                e,
                "Bagaimana cara membuat subtitle yang mudah dibaca anak-anak?",
              )
            }
            className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
          >
            Tanya cara bikin subtitle
          </button>
          <button
            disabled={isSendingChat}
            onClick={(e) =>
              onSendChat(
                e,
                "Berapa kontras warna yang ideal untuk teks di layar?",
              )
            }
            className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
          >
            Kontras warna ideal
          </button>
          <button
            disabled={isSendingChat}
            onClick={(e) =>
              onSendChat(
                e,
                "Bagaimana cara menyertakan interpreter bahasa isyarat ke video?",
              )
            }
            className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
          >
            Panduan Juru Isyarat
          </button>
        </div>

        {/* Chat input footer */}
        <form
          onSubmit={onSendChat}
          className="p-3 border-t border-outline-variant/20 bg-surface-container-low flex gap-2 items-center"
        >
          <input
            type="text"
            disabled={isSendingChat}
            placeholder="Tanyakan perbaikan aksesibilitas..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-grow px-4 py-3 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-secondary focus:outline-none text-sm shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)]"
          />
          <button
            type="submit"
            disabled={isSendingChat || !chatInput.trim()}
            className="w-11 h-11 bg-secondary text-on-secondary rounded-xl flex items-center justify-center border-none cursor-pointer shadow-md hover:brightness-105 active:scale-[0.95] disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all flex-shrink-0"
          >
            <span className="material-symbols-outlined font-bold">send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
