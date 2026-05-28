import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { youtubeAnalysisApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

// Import sub-komponen & hook baru hasil refaktor
import AnalysisTable from "../components/layout/videoAnalysis/AnalysisTable";
import AnalysisModal from "../components/layout/videoAnalysis/AnalysisModal";
import ChatDrawer from "../components/layout/videoAnalysis/ChatDrawer";
import { useAnalysisPolling } from "../components/layout/videoAnalysis/useAnalysisPolling";

export interface YoutubeAnalysis {
  id: string;
  youtubeLink: string;
  title: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  progressMessage: string;
  summary: string | null;
  improvementSuggestions: string | null;
  errorMessage: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  analysisId: string;
  role: "user" | "model";
  content: string;
  createdAt: number;
}

export default function VideoAnalysisPage() {
  return (
    <SidebarProvider>
      <VideoAnalysisInner />
    </SidebarProvider>
  );
}

function VideoAnalysisInner() {
  const { open } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Page State
  const [analyses, setAnalyses] = useState<YoutubeAnalysis[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Chat Drawer State
  const [activeChatAnalysisId, setActiveChatAnalysisId] = useState<
    string | null
  >(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Full summary modal state
  const [selectedAnalysisForModal, setSelectedAnalysisForModal] =
    useState<YoutubeAnalysis | null>(null);

  // Menggunakan polling dinamis sebagai pengganti WebSocket demi keandalan di VPS
  useAnalysisPolling(user, analyses, setAnalyses);

  // Initial fetch
  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await youtubeAnalysisApi.getAll();
      setAnalyses(data);
    } catch (err: any) {
      console.error("Gagal mengambil analisis video:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  // Trigger Analysis manually
  const handleTriggerAnalysis = async (id: string) => {
    try {
      const updated = await youtubeAnalysisApi.startAnalysis(id);
      setAnalyses((prev) =>
        prev.map((item) => (item.id === id ? updated : item)),
      );
    } catch (err: any) {
      alert(err.message || "Gagal memulai analisis video.");
    }
  };

  // Open Chat Drawer & load history
  const handleChatOpen = async (id: string) => {
    setActiveChatAnalysisId(id);
    setChats([]);
    try {
      const data = await youtubeAnalysisApi.getChats(id);
      setChats(data);
    } catch (err: any) {
      console.error("Gagal mengambil riwayat chat:", err);
    }
  };

  // Send Chat Message
  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || !activeChatAnalysisId || isSendingChat) return;

    if (!customText) setChatInput("");
    setIsSendingChat(true);

    const tempUserMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      analysisId: activeChatAnalysisId,
      role: "user",
      content: textToSend,
      createdAt: Date.now(),
    };
    setChats((prev) => [...prev, tempUserMsg]);

    try {
      const data = await youtubeAnalysisApi.sendChatMessage(
        activeChatAnalysisId,
        textToSend,
      );
      setChats((prev) =>
        prev
          .filter((c) => c.id !== tempUserMsg.id)
          .concat([data.userMessage, data.modelMessage]),
      );
    } catch (err: any) {
      alert(err.message || "Gagal mengirim pesan chat.");
    } finally {
      setIsSendingChat(false);
    }
  };

  const filteredAnalyses = analyses.filter((item) => {
    const linkMatch = item.youtubeLink
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const titleMatch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return linkMatch || titleMatch;
  });

  const activeAnalysis = analyses.find((a) => a.id === activeChatAnalysisId);

  return (
    <>
      <Sidebar />

      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${open ? "ml-64" : "ml-20"}`}
      >
        <div className="max-w-container-max mx-auto space-y-stack-lg">
          {/* Header Section */}
          <header className="flex flex-row items-center justify-between pb-stack-sm border-b border-outline-variant/30">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface select-none">
                Analisis Inklusi Video
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                Analisis kekurangan fitur inklusi (subtitle, interpreter bahasa
                isyarat, kejelasan teks) pada video YouTube.
              </p>
            </div>
          </header>

          {/* Search Bar */}
          <div className="flex items-center justify-between bg-surface-container-low rounded-2xl p-4 shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 w-1/3 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Cari link atau judul video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)]"
              />
            </div>
            <div className="font-label-md text-label-md text-on-surface-variant select-none">
              Total video:{" "}
              <span className="font-bold text-primary">
                {filteredAnalyses.length}
              </span>{" "}
              item
            </div>
          </div>

          {/* MAIN TABLE (Sekarang didelegasikan ke sub-komponen) */}
          <AnalysisTable
            isLoading={isLoading}
            filteredAnalyses={filteredAnalyses}
            onTriggerAnalysis={handleTriggerAnalysis}
            onChatOpen={handleChatOpen}
            onSelectModal={setSelectedAnalysisForModal}
          />
        </div>
      </main>

      {/* CHAT AI DRAWER */}
      <ChatDrawer
        activeAnalysis={activeAnalysis || null}
        onClose={() => setActiveChatAnalysisId(null)}
        chats={chats}
        chatInput={chatInput}
        setChatInput={setChatInput}
        isSendingChat={isSendingChat}
        onSendChat={handleSendChat}
      />

      {/* DETAIL MODAL */}
      <AnalysisModal
        analysis={selectedAnalysisForModal}
        onClose={() => setSelectedAnalysisForModal(null)}
        onOpenChat={handleChatOpen}
      />
    </>
  );
}
