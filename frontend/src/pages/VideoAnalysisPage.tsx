import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { youtubeAnalysisApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface YoutubeAnalysis {
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

interface ChatMessage {
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
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [youtubeLinkInput, setYoutubeLinkInput] = useState("");
  const [isSubmittingLink, setIsSubmittingLink] = useState(false);

  // Chat Drawer State
  const [activeChatAnalysisId, setActiveChatAnalysisId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Initial fetch
  const fetchAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await youtubeAnalysisApi.getAll();
      setAnalyses(data);
    } catch (err: any) {
      console.error("Gagal mengambil analisis video:", err);
      setErrorMsg(err.message || "Gagal memuat data dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalyses();
    }
  }, [user]);

  // Auto-scroll chat drawer to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeChatAnalysisId]);

  // Establish WebSocket Connection
  useEffect(() => {
    if (!user) return;

    const connectWebSocket = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      // Convert http/https to ws/wss (tanpa titik dua tambahan)
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = API_URL.startsWith("http")
        ? API_URL.replace(/^http(s?)/, wsProtocol) + "/ws"
        : `${wsProtocol}://${window.location.host}/ws`;

      console.log("[WS] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("[WS] Connected. Sending authentication token...");
        ws.send(JSON.stringify({ type: "auth", token }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "auth_success") {
            console.log("[WS] Authentication successful!");
            return;
          }

          // Handle real-time analysis progress broadcast
          if (message.type === "progress") {
            const { analysisId, status, progress, progressMessage, summary, improvementSuggestions, errorMessage } = message;
            
            setAnalyses((prevAnalyses) =>
              prevAnalyses.map((item) => {
                if (item.id === analysisId) {
                  return {
                    ...item,
                    status,
                    progress,
                    progressMessage,
                    summary: summary || item.summary,
                    improvementSuggestions: improvementSuggestions || item.improvementSuggestions,
                    errorMessage: errorMessage || item.errorMessage,
                    updatedAt: Date.now(),
                  };
                }
                return item;
              })
            );
          }
        } catch (err) {
          console.error("[WS] Error parsing message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("[WS] Connection closed. Code:", event.code, "Reason:", event.reason);
        // Attempt reconnection after 5 seconds if still logged in
        setTimeout(() => {
          if (localStorage.getItem("auth_token")) {
            console.log("[WS] Reconnecting...");
            connectWebSocket();
          }
        }, 5000);
      };

      ws.onerror = (err) => {
        console.error("[WS] Socket encountered error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);

  // Handle addition of a new link
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeLinkInput.trim()) return;

    // Minimal validation for YouTube Link format
    const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!ytRegex.test(youtubeLinkInput)) {
      alert("Format link YouTube tidak valid. Contoh: https://www.youtube.com/watch?v=xxxx");
      return;
    }

    setIsSubmittingLink(true);
    try {
      const newJob = await youtubeAnalysisApi.create(youtubeLinkInput);
      setAnalyses((prev) => [newJob, ...prev]);
      setYoutubeLinkInput("");
      setIsAddModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menambahkan link untuk dianalisis.");
    } finally {
      setIsSubmittingLink(false);
    }
  };

  // Trigger Analysis manually (e.g. for failed jobs or new analyses)
  const handleTriggerAnalysis = async (id: string) => {
    try {
      const updated = await youtubeAnalysisApi.startAnalysis(id);
      setAnalyses((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
    } catch (err: any) {
      alert(err.message || "Gagal memulai analisis video.");
    }
  };

  // Delete Analysis
  const handleDeleteClick = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus catatan analisis video ini?")) {
      return;
    }

    try {
      await youtubeAnalysisApi.delete(id);
      setAnalyses((prev) => prev.filter((item) => item.id !== id));
      if (activeChatAnalysisId === id) {
        setActiveChatAnalysisId(null);
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus analisis.");
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

    // Optimistically add user chat bubble
    const tempUserMsg: ChatMessage = {
      id: "temp-" + Date.now(),
      analysisId: activeChatAnalysisId,
      role: "user",
      content: textToSend,
      createdAt: Date.now(),
    };
    setChats((prev) => [...prev, tempUserMsg]);

    try {
      const data = await youtubeAnalysisApi.sendChatMessage(activeChatAnalysisId, textToSend);
      // Replace optimistic message and append model response
      setChats((prev) =>
        prev.filter((c) => c.id !== tempUserMsg.id).concat([data.userMessage, data.modelMessage])
      );
    } catch (err: any) {
      alert(err.message || "Gagal mengirim pesan chat.");
    } finally {
      setIsSendingChat(false);
    }
  };

  // Filter analyses list based on search bar
  const filteredAnalyses = analyses.filter((item) => {
    const linkMatch = item.youtubeLink.toLowerCase().includes(searchQuery.toLowerCase());
    const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    return linkMatch || titleMatch;
  });

  const activeAnalysis = analyses.find((a) => a.id === activeChatAnalysisId);

  return (
    <>
      <Sidebar />

      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <div className="max-w-container-max mx-auto space-y-stack-lg">
          
          {/* Header Section */}
          <header className="flex flex-row items-center justify-between pb-stack-sm border-b border-outline-variant/30">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface select-none">
                Analisis Inklusi Video
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                Analisis kekurangan fitur inklusi (subtitle, interpreter bahasa isyarat, kejelasan teks) pada video YouTube.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md py-3 px-6 rounded-xl clay-btn cursor-pointer font-bold border-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                add_circle
              </span>
              Tambah Video YouTube
            </button>
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
              Total link:{" "}
              <span className="font-bold text-primary">{filteredAnalyses.length}</span> item
            </div>
          </div>

          {/* Main Table section */}
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 clay-card overflow-hidden border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/50">
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-1/4">
                      Judul & Tautan Video
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-1/6">
                      Status & Progres
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase select-none w-5/12">
                      Hasil Ringkasan & Saran Inklusi
                    </th>
                    <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase text-right select-none w-1/6">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-on-surface-variant select-none">
                        <span className="material-symbols-outlined text-5xl text-primary block mb-2 animate-spin">
                          sync
                        </span>
                        Sedang memuat data analisis...
                      </td>
                    </tr>
                  ) : filteredAnalyses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-on-surface-variant select-none">
                        <span className="material-symbols-outlined text-5xl text-outline-variant/50 block mb-2">
                          analytics
                        </span>
                        Belum ada video YouTube yang ditambahkan untuk dianalisis.
                      </td>
                    </tr>
                  ) : (
                    filteredAnalyses.map((item) => (
                      <tr key={item.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 align-top">
                        
                        {/* Video info */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-red-500 font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                                play_circle
                              </span>
                              <span className="font-semibold text-on-surface line-clamp-2 leading-tight">
                                {item.title || "Mengambil metadata..."}
                              </span>
                            </div>
                            <a
                              className="text-primary hover:underline inline-flex items-center gap-1 font-medium cursor-pointer text-xs truncate max-w-[240px]"
                              href={item.youtubeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.youtubeLink.replace(/^(https?:\/\/)?(www\.)?/, "")}
                              <span className="material-symbols-outlined text-[14px]">
                                open_in_new
                              </span>
                            </a>
                            <span className="text-[10px] text-on-surface-variant opacity-75 mt-1 select-none">
                              Dibuat: {new Date(item.createdAt).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </td>

                        {/* Status & Progress */}
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2 w-full pr-2">
                            
                            {/* Badges */}
                            <div>
                              {item.status === "pending" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-variant text-on-surface-variant animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant" />
                                  Dalam Antrean
                                </span>
                              )}
                              {item.status === "processing" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                  Menganalisis
                                </span>
                              )}
                              {item.status === "completed" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-success/20 text-success">
                                  <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                                  Selesai
                                </span>
                              )}
                              {item.status === "failed" && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-error/20 text-error">
                                  <span className="material-symbols-outlined text-[14px] font-bold">error</span>
                                  Gagal
                                </span>
                              )}
                            </div>

                            {/* Linear Progress Bar */}
                            {(item.status === "pending" || item.status === "processing") && (
                              <div className="w-full space-y-1">
                                <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium">
                                  <span className="truncate max-w-[120px]">{item.progressMessage}</span>
                                  <span>{item.progress}%</span>
                                </div>
                                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${item.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Failure Message */}
                            {item.status === "failed" && (
                              <p className="text-xs text-error font-medium leading-tight mt-1">
                                {item.errorMessage || "Terjadi kesalahan tidak diketahui."}
                              </p>
                            )}

                          </div>
                        </td>

                        {/* Summary & Suggestions Column */}
                        <td className="py-4 px-4 border-r border-outline-variant/10">
                          {item.status === "completed" ? (
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                              
                              {/* Summary Card */}
                              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/5">
                                <h4 className="font-bold text-xs text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
                                  <span className="material-symbols-outlined text-[16px]">summarize</span>
                                  Ringkasan Alur & Konten
                                </h4>
                                <CustomMarkdownRenderer text={item.summary || ""} className="text-on-surface-variant font-medium text-sm leading-relaxed" />
                              </div>

                              {/* Improvement Suggestions Card */}
                              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/5">
                                <h4 className="font-bold text-xs text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
                                  <span className="material-symbols-outlined text-[16px]">accessibility_new</span>
                                  Rekomendasi Inklusi & Aksesibilitas
                                </h4>
                                <CustomMarkdownRenderer text={item.improvementSuggestions || ""} className="text-on-surface-variant font-medium text-sm leading-relaxed" />
                              </div>

                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant/40 select-none">
                              <span className="material-symbols-outlined text-4xl mb-1 animate-pulse">
                                hourglass_empty
                              </span>
                              <span className="text-xs font-medium">
                                {item.status === "pending" && "Menunggu giliran antrean..."}
                                {item.status === "processing" && "AI sedang merumuskan inklusi..."}
                                {item.status === "failed" && "Analisis gagal. Silakan coba lagi."}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {/* Analyze / Re-analyze Button */}
                            {(item.status === "pending" || item.status === "failed" || item.status === "completed") && (
                              <button
                                onClick={() => handleTriggerAnalysis(item.id)}
                                title={item.status === "completed" ? "Analisis Ulang" : "Mulai Analisis"}
                                className={`p-2 rounded-lg cursor-pointer border-none flex items-center justify-center transition-all ${
                                  item.status === "completed"
                                    ? "text-outline hover:text-primary bg-surface-container hover:bg-primary/10"
                                    : "text-primary bg-primary/15 hover:bg-primary hover:text-on-primary font-bold shadow-sm"
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  {item.status === "completed" ? "autorenew" : "play_arrow"}
                                </span>
                              </button>
                            )}

                            {/* Chat Button (Only when completed) */}
                            <button
                              disabled={item.status !== "completed"}
                              onClick={() => handleChatOpen(item.id)}
                              title="Tanya Jawab / Chat Lanjutan"
                              className={`p-2 rounded-lg border-none flex items-center justify-center transition-all ${
                                item.status === "completed"
                                  ? "text-secondary bg-secondary/15 hover:bg-secondary hover:text-on-secondary cursor-pointer font-bold shadow-sm"
                                  : "text-outline bg-surface-container-low opacity-40 cursor-not-allowed"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                chat
                              </span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              title="Hapus Catatan"
                              className="p-2 text-outline hover:text-error bg-error-container/10 hover:bg-error-container/40 rounded-lg cursor-pointer border-none flex items-center justify-center transition-all"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                delete
                              </span>
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      {/* MODAL: Tambah Link YouTube */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl max-w-md w-full shadow-2xl p-6 relative clay-card">
            
            {/* Close button */}
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <h3 className="font-display-md text-display-md text-on-surface mb-2 select-none">
              Analisis Video Baru
            </h3>
            <p className="text-sm text-on-surface-variant mb-5 select-none leading-relaxed">
              Daftarkan tautan video YouTube edukasi Anda untuk dianalisis oleh AI. Maksimal durasi video adalah **6 menit** agar proses antrean efisien.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-primary select-none">
                  Tautan Video YouTube
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/70 text-lg">
                    link
                  </span>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeLinkInput}
                    onChange={(e) => setYoutubeLinkInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-sm shadow-[inset_1px_1px_2px_rgba(11,28,48,0.02)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-sm font-semibold border-none cursor-pointer text-on-surface-variant"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLink}
                  className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-bold border-none cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {isSubmittingLink ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      Kirim Ke Antrean
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DRAWER: Chat / Tanya Jawab Lanjutan */}
      {activeChatAnalysisId && activeAnalysis && (
        <div className="fixed inset-0 z-[10000] flex justify-end">
          
          {/* Overlay background */}
          <div
            onClick={() => setActiveChatAnalysisId(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-lg bg-surface-container-lowest border-l border-outline-variant/40 shadow-2xl h-screen flex flex-col z-10 transition-transform duration-300">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low select-none">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl font-bold">psychology</span>
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
                onClick={() => setActiveChatAnalysisId(null)}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Chats content area */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-surface/30">
              
              {/* Introduction card */}
              <div className="bg-secondary/5 rounded-xl p-3 border border-secondary/15 text-xs text-on-surface-variant leading-relaxed select-none mb-2">
                <span className="font-bold text-secondary block mb-1">💡 Tips Bertanya:</span>
                Anda bisa menanyakan panduan detail langkah demi langkah untuk memperbaiki video ini, meminta template subtitle, atau konsultasi seputar inklusi disabilitas.
              </div>

              {chats.length === 0 && (
                <div className="py-12 text-center text-on-surface-variant/40 select-none">
                  <span className="material-symbols-outlined text-5xl mb-2 animate-bounce">chat_bubble</span>
                  <p className="text-xs font-semibold">Mulai percakapan Anda dengan AI pakar inklusi di bawah!</p>
                </div>
              )}

              {chats.map((c) => (
                <div
                  key={c.id}
                  className={`flex flex-col max-w-[85%] ${
                    c.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
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
                      <CustomMarkdownRenderer text={c.content} className="text-on-surface font-normal text-sm" />
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
                onClick={(e) => handleSendChat(e, "Bagaimana cara membuat subtitle yang mudah dibaca anak-anak?")}
                className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
              >
                Tanya cara bikin subtitle
              </button>
              <button
                disabled={isSendingChat}
                onClick={(e) => handleSendChat(e, "Berapa kontras warna yang ideal untuk teks di layar?")}
                className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
              >
                Kontras warna ideal
              </button>
              <button
                disabled={isSendingChat}
                onClick={(e) => handleSendChat(e, "Bagaimana cara menyertakan interpreter bahasa isyarat ke video?")}
                className="text-[10px] bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/15 rounded-full px-3 py-1 cursor-pointer font-semibold whitespace-nowrap flex-shrink-0"
              >
                Panduan Juru Isyarat
              </button>
            </div>

            {/* Chat input footer */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-outline-variant/20 bg-surface-container-low flex gap-2 items-center">
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
      )}
    </>
  );
}

// Custom Premium Markdown Renderer for Suggestions, summaries, and chat messages using react-markdown
interface CustomMarkdownRendererProps {
  text: string;
  className?: string;
}

function CustomMarkdownRenderer({ text, className = "" }: CustomMarkdownRendererProps) {
  if (!text) return null;

  return (
    <div className={`max-w-none text-on-surface-variant leading-relaxed select-text ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="font-display-md text-base font-bold text-on-surface mt-4 mb-2 select-none border-b border-outline-variant/20 pb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="font-display-md text-sm font-bold text-on-surface mt-3 mb-2 select-none">{children}</h2>,
          h3: ({ children }) => <h3 className="font-display-md text-xs font-bold text-on-surface mt-2 mb-1 select-none">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0 text-inherit leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-inherit">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-inherit">{children}</ol>,
          li: ({ children }) => <li className="text-inherit leading-normal text-sm">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-on-surface">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-3 py-1 my-3 bg-primary/5 rounded-r-lg italic text-xs text-on-surface-variant">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-surface-container-high px-1.5 py-0.5 rounded font-mono text-xs text-secondary-container-on select-text">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface-container rounded-xl p-3.5 my-3 overflow-x-auto font-mono text-[11px] text-on-surface border border-outline-variant/20 select-text custom-scrollbar">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto w-full my-3 rounded-lg border border-outline-variant/20">
              <table className="w-full text-left border-collapse text-xs select-text">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-surface-container-low border-b border-outline-variant/30 font-bold text-on-surface">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-outline-variant/10">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-surface-container-low/20 transition-none">{children}</tr>,
          th: ({ children }) => <th className="py-2 px-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="py-2 px-3 text-on-surface-variant font-normal leading-normal">{children}</td>,
          input: ({ checked }) => (
            <span className="inline-flex items-center align-middle mr-1.5 select-none">
              <span
                className={`material-symbols-outlined text-[18px] leading-none ${
                  checked ? "text-success font-bold" : "text-on-surface-variant/40"
                }`}
              >
                {checked ? "check_box" : "check_box_outline_blank"}
              </span>
            </span>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
