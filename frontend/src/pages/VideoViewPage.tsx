import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { videoApi, commentApi, interactiveQuestionApi } from "../api/api";
import { useAuthStore } from "../store/authStore";
import TopNavbar from "../components/layout/TopNavbar";

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
  description: string;
  youtubeLink: string;
  category: string;
  ownerName?: string;
}

interface CommentReply {
  id: string;
  commentId: string;
  content: string;
  authorName: string;
  createdAt: number;
}

interface Comment {
  id: string;
  content: string;
  authorName: string;
  createdAt: number;
  replies: CommentReply[];
}

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoViewPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);

  const [video, setVideo] = useState<Video | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comment Form state
  const [commentContent, setCommentContent] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reply Form state
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyGuestName, setReplyGuestName] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Interactive Video States
  const [interactiveQuestions, setInteractiveQuestions] = useState<Question[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [player, setPlayer] = useState<any>(null);
  const [playerState, setPlayerState] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const ytId = video ? getYoutubeId(video.youtubeLink) : null;

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [videoRes, commentsRes, questionsRes] = await Promise.all([
        videoApi.getPublicById(id),
        commentApi.getByVideoId(id),
        interactiveQuestionApi.getPublicQuestions(id),
      ]);
      setVideo(videoRes);
      setComments(commentsRes);
      setInteractiveQuestions(questionsRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // YouTube Player Initializer
  useEffect(() => {
    if (!ytId || isLoading) return;

    let ytPlayer: any = null;

    const initYTPlayer = () => {
      const win = window as any;
      if (!win.YT || !win.YT.Player) return;
      
      try {
        ytPlayer = new win.YT.Player("youtube-player", {
          videoId: ytId,
          playerVars: {
            autoplay: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onStateChange: (event: any) => {
              setPlayerState(event.data);
            },
          },
        });
        setPlayer(ytPlayer);
      } catch (err) {
        console.error("Gagal menginisialisasi pemutar YouTube:", err);
      }
    };

    const win = window as any;
    if (win.YT && win.YT.Player) {
      initYTPlayer();
    } else {
      if (!document.getElementById("youtube-iframe-api")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const checkYT = setInterval(() => {
        const win = window as any;
        if (win.YT && win.YT.Player) {
          initYTPlayer();
          clearInterval(checkYT);
        }
      }, 100);

      return () => {
        clearInterval(checkYT);
        if (ytPlayer && ytPlayer.destroy) {
          try {
            ytPlayer.destroy();
          } catch (e) {}
        }
      };
    }

    return () => {
      if (ytPlayer && ytPlayer.destroy) {
        try {
          ytPlayer.destroy();
        } catch (e) {}
      }
    };
  }, [ytId, isLoading]);

  // 1. General Time Poller (Always updates currentTime and duration when playing)
  useEffect(() => {
    if (!player) return;

    try {
      const dur = player.getDuration();
      if (dur > 0) setDuration(dur);
    } catch (e) {}

    if (playerState !== 1) return;

    const interval = setInterval(() => {
      try {
        const time = player.getCurrentTime();
        setCurrentTime(time);
        
        const dur = player.getDuration();
        if (dur > 0) setDuration(dur);
      } catch (e) {}
    }, 250);

    return () => clearInterval(interval);
  }, [player, playerState]);

  // 2. Trigger Question Overlay when currentTime hits a question timestamp
  useEffect(() => {
    if (!player || activeQuestion || !interactiveQuestions.length) return;

    const currentSec = Math.floor(currentTime);
    const question = interactiveQuestions.find(
      (q) => q.timestamp === currentSec && !answeredQuestionIds.has(q.id)
    );

    if (question) {
      try {
        player.pauseVideo();
      } catch (e) {}
      setActiveQuestion(question);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    }
  }, [currentTime, player, interactiveQuestions, answeredQuestionIds, activeQuestion]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentContent.trim() || (!user && !guestName.trim())) return;

    setIsSubmitting(true);
    try {
      await commentApi.createComment({
        videoId: id,
        content: commentContent,
        guestName: !user ? guestName : undefined,
      });
      setCommentContent("");
      // Refresh comments
      const commentsRes = await commentApi.getByVideoId(id);
      setComments(commentsRes);
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || (!user && !replyGuestName.trim())) return;

    setIsReplying(true);
    try {
      await commentApi.createReply({
        commentId,
        content: replyContent,
        guestName: !user ? replyGuestName : undefined,
      });
      setReplyContent("");
      setReplyingTo(null);
      // Refresh comments
      const commentsRes = await commentApi.getByVideoId(id!);
      setComments(commentsRes);
    } catch (error) {
      console.error("Failed to post reply:", error);
    } finally {
      setIsReplying(false);
    }
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

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface text-on-surface-variant">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-50">
          error
        </span>
        <p className="font-body-lg text-body-lg">Video tidak ditemukan.</p>
        <Link to="/videos" className="mt-4 text-primary hover:underline">
          Kembali ke Kumpulan Video
        </Link>
      </div>
    );
  }

  return (
    <>
      <TopNavbar />

      {/* Main Content - 2 Columns */}
      <main className="pt-16 min-h-screen bg-surface flex flex-col">
        <div className="max-w-container-max w-full mx-auto flex flex-col lg:flex-row gap-8 items-stretch px-margin-desktop py-6">
          {/* Left Column (Video & Details) - Static on Desktop */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4 self-start">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md relative">
              {ytId ? (
                <div className="w-full h-full relative">
                  <div id="youtube-player" className="w-full h-full"></div>
                  {activeQuestion && (
                    <div className="absolute inset-0 bg-inverse-surface/85 backdrop-blur-md flex items-center justify-center p-6 z-30 select-none transition-all duration-300">
                      <div className="bg-surface text-on-surface rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-outline-variant/10 space-y-4 max-h-full overflow-y-auto hover-scrollbar">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                          <span className="material-symbols-outlined text-base">quiz</span>
                          <span>Pertanyaan Interaktif</span>
                        </div>
                        
                        <h3 className="font-semibold text-on-surface text-body-lg whitespace-pre-wrap leading-snug">
                          {activeQuestion.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-2.5">
                          {activeQuestion.options.map((optText, idx) => {
                            const letter = ["A", "B", "C", "D"][idx];
                            const isSelected = selectedAnswer === letter;
                            const isCorrect = activeQuestion.correctAnswer === letter;
                            
                            let btnStyle = "bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low";
                            let badgeStyle = "bg-primary/10 text-primary";

                            if (isAnswerSubmitted) {
                              if (isCorrect) {
                                btnStyle = "bg-secondary-container border-secondary text-on-secondary-container font-semibold ring-2 ring-secondary/20";
                                badgeStyle = "bg-secondary text-on-secondary";
                              } else if (isSelected) {
                                btnStyle = "bg-error-container/40 border-error text-on-error-container font-semibold ring-2 ring-error/20";
                                badgeStyle = "bg-error text-on-error";
                              } else {
                                btnStyle = "bg-surface-container-low/50 border-outline-variant/10 text-on-surface-variant/40 opacity-60";
                                badgeStyle = "bg-outline-variant/20 text-on-surface-variant/50";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-primary-container/30 border-primary text-primary font-semibold ring-2 ring-primary/20";
                              badgeStyle = "bg-primary text-on-primary";
                            }

                            return (
                              <button
                                key={letter}
                                disabled={isAnswerSubmitted}
                                onClick={() => setSelectedAnswer(letter)}
                                className={`flex items-start text-left gap-3 p-3 rounded-xl border transition-all cursor-pointer ${btnStyle}`}
                              >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${badgeStyle}`}>
                                  {letter}
                                </span>
                                <span className="text-sm mt-0.5">{optText}</span>
                              </button>
                            );
                          })}
                        </div>

                        {isAnswerSubmitted && (
                          <div className="space-y-3 pt-1 border-t border-outline-variant/25">
                            <div className="flex items-center gap-2 font-bold text-sm">
                              {selectedAnswer === activeQuestion.correctAnswer ? (
                                <div className="flex items-center gap-1.5 text-secondary">
                                  <span className="material-symbols-outlined">check_circle</span>
                                  <span>Jawaban Anda Benar!</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-error">
                                  <span className="material-symbols-outlined">cancel</span>
                                  <span>Jawaban Salah (Benar: {activeQuestion.correctAnswer})</span>
                                </div>
                              )}
                            </div>

                            {activeQuestion.explanation && (
                              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant">
                                <span className="font-bold text-on-surface flex items-center gap-1 mb-1">
                                  <span className="material-symbols-outlined text-xs text-primary">lightbulb</span>
                                  Pembahasan:
                                </span>
                                <p className="whitespace-pre-wrap leading-relaxed">{activeQuestion.explanation}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          {!isAnswerSubmitted ? (
                            <button
                              disabled={!selectedAnswer}
                              onClick={() => setIsAnswerSubmitted(true)}
                              className="px-6 py-2.5 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-xl clay-btn cursor-pointer transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                            >
                              Kirim Jawaban
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setAnsweredQuestionIds((prev) => {
                                  const next = new Set(prev);
                                  next.add(activeQuestion.id);
                                  return next;
                                });
                                setActiveQuestion(null);
                                if (player) {
                                  player.playVideo();
                                }
                              }}
                              className="px-6 py-2.5 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-xl clay-btn cursor-pointer transition-all active:scale-95"
                            >
                              Lanjutkan Video
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Invalid YouTube Link
                </div>
              )}
            </div>

            {/* Interactive Progress Bar & Question Markers */}
            {ytId && duration > 0 && (
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 select-none">
                <div className="flex items-center justify-between text-xs text-on-surface-variant font-semibold mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">play_circle</span>
                    <span>Waktu Putar</span>
                  </div>
                  <div className="font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div 
                  onClick={(e) => {
                    if (!player || duration === 0) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                    const targetTime = percentage * duration;
                    player.seekTo(targetTime, true);
                    setCurrentTime(targetTime);
                  }}
                  className="relative h-2.5 bg-outline-variant/30 rounded-full cursor-pointer hover:h-3 transition-all duration-200 group flex items-center"
                >
                  {/* Active Progress Track */}
                  <div 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                    className="h-full bg-primary rounded-full relative group-hover:bg-primary-container"
                  ></div>

                  {/* Playhead Handle */}
                  <div 
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                    className="absolute w-3.5 h-3.5 bg-surface border-2 border-primary rounded-full -translate-x-1/2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  ></div>

                  {/* Question Markers / Dots */}
                  {interactiveQuestions.map((q) => {
                    const percentage = (q.timestamp / duration) * 100;
                    const isAnswered = answeredQuestionIds.has(q.id);
                    return (
                      <div
                        key={q.id}
                        style={{ left: `${percentage}%` }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent trigger full bar click
                          if (player) {
                            player.seekTo(q.timestamp, true);
                            setCurrentTime(q.timestamp);
                          }
                        }}
                        className={`absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 border-2 border-surface shadow-md cursor-pointer hover:scale-130 transition-transform z-10 ${
                          isAnswered ? "bg-secondary" : "bg-tertiary-container"
                        }`}
                        title={`Soal Interaktif di ${formatTime(q.timestamp)} (${isAnswered ? "Selesai" : "Belum Dijawab"})`}
                      >
                        {!isAnswered && (
                          <span className="absolute inset-0 rounded-full animate-ping bg-tertiary-container opacity-45 pointer-events-none"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-2">
                {video.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {video.ownerName && (
                  <span className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                    <span>
                      Oleh:{" "}
                      <strong className="text-on-surface font-semibold">
                        {video.ownerName}
                      </strong>
                    </span>
                  </span>
                )}
                <span className="inline-block bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full">
                  {video.category}
                </span>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (Comments) - Fixed Form at Bottom, Scrollable List */}
          <div className="w-full lg:w-1/3 flex flex-col h-[550px] lg:h-[calc(100vh-120px)] bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm lg:sticky lg:top-24">
            {/* Header */}
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
                Komentar ({comments.length})
              </h2>
            </div>

            {/* Comments List - Scrollable */}
            <div className="flex-grow overflow-y-auto hover-scrollbar p-4 flex flex-col gap-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold">
                        {comment.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-baseline gap-2">
                        <span className="font-label-lg font-bold text-on-surface">
                          {comment.authorName}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id,
                          )
                        }
                        className="text-xs text-primary font-semibold mt-2 self-start hover:underline"
                      >
                        Balas
                      </button>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <form
                          onSubmit={(e) => handleReplySubmit(e, comment.id)}
                          className="mt-3 flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/50"
                        >
                          {!user && (
                            <input
                              type="text"
                              placeholder="Nama Anda"
                              value={replyGuestName}
                              onChange={(e) =>
                                setReplyGuestName(e.target.value)
                              }
                              required
                              className="px-3 py-1.5 bg-surface text-on-surface rounded-md border border-outline-variant/50 focus:border-primary focus:outline-none text-xs"
                            />
                          )}
                          <textarea
                            placeholder="Tulis balasan..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            required
                            rows={2}
                            className="w-full px-3 py-1.5 bg-surface text-on-surface rounded-md border border-outline-variant/50 focus:border-primary focus:outline-none text-xs resize-none"
                          ></textarea>
                          <div className="flex justify-end gap-2 mt-1">
                            <button
                              type="button"
                              onClick={() => setReplyingTo(null)}
                              className="px-3 py-1 text-xs font-semibold text-on-surface-variant hover:text-on-surface"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              disabled={isReplying}
                              className="px-3 py-1 bg-primary text-on-primary font-semibold rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors text-xs"
                            >
                              {isReplying ? "Mengirim..." : "Balas"}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Replies List */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="flex flex-col gap-3 mt-3 ml-4 pl-4 border-l-2 border-outline-variant/30">
                          {comment.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className="flex items-start gap-2"
                            >
                              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                                <span className="text-secondary font-bold text-xs">
                                  {reply.authorName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                  <span className="font-label-md font-bold text-on-surface text-sm">
                                    {reply.authorName}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant">
                                    {new Date(
                                      reply.createdAt,
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <p className="text-xs text-on-surface mt-0.5 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                    forum
                  </span>
                  <p className="text-sm">
                    Belum ada komentar. Jadilah yang pertama!
                  </p>
                </div>
              )}
            </div>

            {/* Comment Form - Sticky at Bottom */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/50 shrink-0">
              <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                {!user && (
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    className="px-4 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/50 focus:border-primary focus:outline-none text-sm"
                  />
                )}
                <textarea
                  placeholder="Tulis komentar..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-4 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/50 focus:border-primary focus:outline-none text-sm resize-none"
                ></textarea>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="self-end font-label-md text-label-md bg-primary text-on-primary rounded-full px-6 py-2 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:scale-95 active:translate-y-0.5 active:shadow-none font-semibold text-center disabled:opacity-50 disabled:scale-100 disabled:translate-y-0 disabled:shadow-none transition-all"
                >
                  {isSubmitting ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
