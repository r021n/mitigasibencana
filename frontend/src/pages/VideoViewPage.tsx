import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { videoApi, commentApi } from "../api/api";
import { useAuthStore } from "../store/authStore";

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

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [videoRes, commentsRes] = await Promise.all([
        videoApi.getPublicById(id),
        commentApi.getByVideoId(id),
      ]);
      setVideo(videoRes);
      setComments(commentsRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const ytId = getYoutubeId(video.youtubeLink);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-margin-desktop h-16 max-w-container-max mx-auto">
          <Link
            to="/"
            className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight"
          >
            MitigasiBencana
          </Link>
          <nav className="flex items-center gap-gutter">
            <Link
              to="/dashboard"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/videos"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Kumpulan Video
            </Link>
            <Link
              to="#"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Tentang Kami
            </Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="font-label-md text-on-surface">
                Halo, {user.name}
              </span>
            </div>
          ) : (
            <Link
              to="/register"
              className="block font-label-md text-label-md bg-primary text-on-primary rounded-full px-6 py-2 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:scale-95 active:translate-y-0.5 active:shadow-none font-semibold text-center"
            >
              Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Content - 2 Columns */}
      <main className="pt-16 lg:h-screen lg:overflow-hidden bg-surface flex flex-col">
        <div className="max-w-container-max w-full mx-auto flex flex-col lg:flex-row gap-8 items-stretch flex-grow lg:overflow-hidden px-margin-desktop py-6">
          {/* Left Column (Video & Details) - Static on Desktop */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4 self-start">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
              {ytId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  Invalid YouTube Link
                </div>
              )}
            </div>
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
          <div className="w-full lg:w-1/3 flex flex-col h-[550px] lg:h-full bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
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
