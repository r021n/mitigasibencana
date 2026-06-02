import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { videoApi, interactiveQuestionApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

interface Question {
  id: string;
  videoId: string;
  timestamp: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface Video {
  id: string;
  title: string;
  youtubeLink: string;
  category: string;
}

export default function InteractiveQuestionsPage() {
  return (
    <SidebarProvider>
      <InteractiveQuestionsInner />
    </SidebarProvider>
  );
}

function InteractiveQuestionsInner() {
  const { id } = useParams<{ id: string }>();
  const { open } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const [video, setVideo] = useState<Video | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [minute, setMinute] = useState<number>(0);
  const [second, setSecond] = useState<number>(0);
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [videoData, questionsData] = await Promise.all([
        videoApi.getById(id),
        interactiveQuestionApi.getQuestions(id),
      ]);
      setVideo(videoData);
      setQuestions(questionsData);
    } catch (err: any) {
      console.error("Gagal memuat data:", err);
      setErrorMessage("Gagal memuat data video atau soal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const resetForm = () => {
    setEditingQuestionId(null);
    setMinute(0);
    setSecond(0);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setExplanation("");
    setErrorMessage("");
  };

  const handleEditClick = (q: Question) => {
    setEditingQuestionId(q.id);
    setMinute(Math.floor(q.timestamp / 60));
    setSecond(q.timestamp % 60);
    setQuestionText(q.question);
    setOptionA(q.options[0] || "");
    setOptionB(q.options[1] || "");
    setOptionC(q.options[2] || "");
    setOptionD(q.options[3] || "");
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation || "");
    setSuccessMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (questionId: string) => {
    if (!id) return;
    if (!confirm("Apakah Anda yakin ingin menghapus soal interaktif ini?")) return;

    try {
      await interactiveQuestionApi.deleteQuestion(id, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setSuccessMessage("Soal interaktif berhasil dihapus.");
      if (editingQuestionId === questionId) {
        resetForm();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menghapus soal.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setErrorMessage("Pertanyaan dan keempat opsi pilihan ganda wajib diisi.");
      return;
    }

    const totalSeconds = minute * 60 + second;
    const options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
    const payload = {
      timestamp: totalSeconds,
      question: questionText.trim(),
      options,
      correctAnswer,
      explanation: explanation.trim(),
    };

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (editingQuestionId) {
        // Edit
        const updated = await interactiveQuestionApi.editQuestion(id, editingQuestionId, payload);
        setQuestions((prev) =>
          prev
            .map((q) => (q.id === editingQuestionId ? updated : q))
            .sort((a, b) => a.timestamp - b.timestamp)
        );
        setSuccessMessage("Soal interaktif berhasil diperbarui!");
      } else {
        // Create
        const created = await interactiveQuestionApi.createQuestion(id, payload);
        setQuestions((prev) => [...prev, created].sort((a, b) => a.timestamp - b.timestamp));
        setSuccessMessage("Soal interaktif baru berhasil ditambahkan!");
      }
      resetForm();
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan soal interaktif.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-surface">
        <span className="material-symbols-outlined text-5xl text-primary animate-spin">
          sync
        </span>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto transition-all duration-300 ease-in-out ${
          open ? "ml-64" : "ml-20"
        }`}
      >
        <div className="max-w-container-max mx-auto space-y-stack-lg">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between pb-stack-sm border-b border-outline-variant/30 gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm cursor-pointer mb-1 hover:underline" onClick={() => navigate("/dashboard")}>
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali ke Manajemen Video
              </div>
              <h2 className="font-display-lg text-display-lg text-on-surface">
                Kelola Soal Interaktif
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Video: <span className="font-semibold text-primary">{video?.title}</span>
              </p>
            </div>
          </header>

          {/* Alert Messages */}
          {successMessage && (
            <div className="p-4 bg-secondary-container/20 border border-secondary text-on-secondary-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">check_circle</span>
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-error-container/20 border border-error text-on-error-container rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-error">error</span>
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Split Content: Form on Left, List on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm space-y-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {editingQuestionId ? "edit_note" : "add_circle"}
                </span>
                {editingQuestionId ? "Edit Pertanyaan" : "Tambah Pertanyaan Baru"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Timestamp Row */}
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">
                    Waktu Muncul Soal (Menit & Detik) <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={minute}
                          onChange={(e) => setMinute(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-full pl-4 pr-12 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-inner"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">Min</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={second}
                          onChange={(e) => setSecond(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          className="w-full pl-4 pr-12 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md shadow-inner"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-on-surface-variant">Detik</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1.5">
                    Soal akan muncul pada format waktu: {minute.toString().padStart(2, "0")}:{second.toString().padStart(2, "0")}
                  </p>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">
                    Pertanyaan <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tulis pertanyaan interaktif di sini..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md resize-none shadow-inner"
                  />
                </div>

                {/* Options Input A-D */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-on-surface-variant mb-1">
                    Pilihan Ganda <span className="text-error">*</span>
                  </label>
                  
                  {/* Option A */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">A</span>
                    <input
                      type="text"
                      placeholder="Ketik opsi pilihan A"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      required
                      className="flex-grow px-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-sm shadow-inner"
                    />
                  </div>

                  {/* Option B */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">B</span>
                    <input
                      type="text"
                      placeholder="Ketik opsi pilihan B"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      required
                      className="flex-grow px-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-sm shadow-inner"
                    />
                  </div>

                  {/* Option C */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">C</span>
                    <input
                      type="text"
                      placeholder="Ketik opsi pilihan C"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      required
                      className="flex-grow px-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-sm shadow-inner"
                    />
                  </div>

                  {/* Option D */}
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">D</span>
                    <input
                      type="text"
                      placeholder="Ketik opsi pilihan D"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      required
                      className="flex-grow px-4 py-2 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-sm shadow-inner"
                    />
                  </div>
                </div>

                {/* Correct Answer Selection */}
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">
                    Jawaban yang Benar <span className="text-error">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["A", "B", "C", "D"].map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border cursor-pointer font-bold text-sm transition-all select-none ${
                          correctAnswer === opt
                            ? "bg-secondary-container border-secondary text-on-secondary-container shadow-inner"
                            : "bg-surface border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant"
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={opt}
                          checked={correctAnswer === opt}
                          onChange={(e) => setCorrectAnswer(e.target.value)}
                          className="hidden"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-bold text-on-surface-variant mb-2">
                    Pembahasan / Penjelasan Jawaban (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tulis alasan jawaban benar atau informasi edukatif terkait soal ini..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none text-body-md resize-none shadow-inner"
                  />
                </div>

                {/* Submit Row */}
                <div className="flex gap-3 pt-2">
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 py-3 px-4 border border-outline rounded-xl font-label-md text-label-md font-semibold text-center text-on-surface hover:bg-surface-container-low active:scale-95 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow py-3 px-4 bg-primary text-on-primary rounded-xl font-label-md text-label-md clay-btn cursor-pointer font-bold border-none active:scale-95 transition-all text-center disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Menyimpan..."
                      : editingQuestionId
                      ? "Update Soal"
                      : "Simpan Soal"}
                  </button>
                </div>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-between border border-outline-variant/10">
                <span className="font-label-md text-label-md text-on-surface-variant font-bold">
                  Daftar Pertanyaan Interaktif ({questions.length})
                </span>
                <span className="text-xs text-on-surface-variant italic">
                  Urut berdasarkan waktu pemutaran video
                </span>
              </div>

              {questions.length === 0 ? (
                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl py-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-6xl opacity-30 mb-3 block">
                    live_help
                  </span>
                  <p className="font-body-lg text-body-lg font-semibold">Belum Ada Soal Interaktif</p>
                  <p className="text-sm mt-1 max-w-sm mx-auto px-4">
                    Gunakan formulir di sebelah kiri untuk menambahkan kuis pilihan ganda yang akan muncul di sela-sela pemutaran video.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className={`bg-surface-container-lowest border rounded-2xl p-5 shadow-sm hover:shadow transition-shadow ${
                        editingQuestionId === q.id ? "border-primary ring-2 ring-primary/10" : "border-outline-variant/15"
                      }`}
                    >
                      {/* Card Header: Timestamp & Aksi */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full font-bold text-xs">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          Muncul di {formatTime(q.timestamp)} ({q.timestamp}s)
                        </span>

                        <div className="flex gap-2">
                          <button
                            aria-label="Edit Soal"
                            onClick={() => handleEditClick(q)}
                            className="p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center transition-colors"
                            title="Edit Soal"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            aria-label="Hapus Soal"
                            onClick={() => handleDeleteClick(q.id)}
                            className="p-1.5 text-outline hover:text-error hover:bg-error-container/10 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center transition-colors"
                            title="Hapus Soal"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-on-surface text-body-md whitespace-pre-wrap">
                          {q.question}
                        </h4>

                        {/* Options Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((optText, idx) => {
                            const letter = ["A", "B", "C", "D"][idx];
                            const isCorrect = q.correctAnswer === letter;
                            return (
                              <div
                                key={letter}
                                className={`flex items-start gap-2 p-2.5 rounded-xl border ${
                                  isCorrect
                                    ? "bg-secondary-container/20 border-secondary text-on-secondary-container font-semibold"
                                    : "bg-surface border-outline-variant/20 text-on-surface-variant"
                                }`}
                              >
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCorrect ? "bg-secondary text-on-secondary" : "bg-primary/10 text-primary"
                                }`}>
                                  {letter}
                                </span>
                                <span className="line-clamp-2 mt-0.5">{optText}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Preview */}
                        {q.explanation && (
                          <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant">
                            <span className="font-bold text-on-surface flex items-center gap-1 mb-1">
                              <span className="material-symbols-outlined text-xs text-primary">lightbulb</span>
                              Pembahasan:
                            </span>
                            <p className="whitespace-pre-wrap leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
