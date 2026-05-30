import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { materialApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

const MateriDetailPage = () => {
  const { id } = useParams();
  const [materi, setMateri] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMateri();
  }, [id]);

  const fetchMateri = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getById(id as string);
      setMateri(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat materi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopNavbar />
        <div className="flex justify-center items-center h-screen bg-surface">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            sync
          </span>
        </div>
      </>
    );
  }

  if (error || !materi) {
    return (
      <>
        <TopNavbar />
        <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col justify-between">
          <div className="max-w-md mx-auto px-6 py-16 text-center w-full flex-grow flex flex-col justify-center items-center">
            <div className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0_12px_30px_rgba(0,74,198,0.08),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/20 w-full">
              <span className="material-symbols-outlined text-6xl text-error mb-4 select-none">
                error
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">
                Materi Tidak Ditemukan
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                {error || "Berkas atau materi pembelajaran yang Anda cari tidak tersedia."}
              </p>
              <Link
                to="/materi"
                className="inline-flex items-center gap-2 bg-primary text-on-primary font-semibold font-label-md text-label-md px-6 py-3 rounded-full shadow-[0_6px_16px_rgba(0,74,198,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)] hover:brightness-105"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Kembali ke Daftar Materi
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Scope Typography Custom Styling for Medium Aesthetic */}
      <style>{`
        .materi-prose {
          font-family: 'Inter', sans-serif;
          color: var(--color-on-surface-variant, #434655);
          font-size: 1.125rem;
          line-height: 1.8;
          letter-spacing: -0.003em;
        }
        .materi-prose p {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }
        .materi-prose h1,
        .materi-prose h2,
        .materi-prose h3,
        .materi-prose h4 {
          font-family: 'Montserrat', sans-serif;
          color: var(--color-on-surface, #0b1c30);
          font-weight: 700;
          line-height: 1.25;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .materi-prose h1 { font-size: 2.25rem; }
        .materi-prose h2 { font-size: 1.75rem; border-bottom: 1px solid rgba(195, 198, 215, 0.2); padding-bottom: 0.5rem; }
        .materi-prose h3 { font-size: 1.4rem; }
        .materi-prose h4 { font-size: 1.2rem; }
        
        .materi-prose ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .materi-prose ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 1.5rem;
        }
        .materi-prose li {
          margin-bottom: 0.5rem;
        }
        .materi-prose blockquote {
          border-left: 4px solid var(--color-primary, #004ac6);
          padding-left: 1.5rem;
          margin-left: 0;
          margin-right: 0;
          margin-top: 2rem;
          margin-bottom: 2rem;
          font-style: italic;
          color: var(--color-on-surface, #0b1c30);
          font-size: 1.25rem;
          line-height: 1.6;
        }
        .materi-prose a {
          color: var(--color-primary, #004ac6);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .materi-prose a:hover {
          opacity: 0.8;
        }
        .materi-prose img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin-top: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
        }
        .materi-prose hr {
          border: 0;
          border-top: 1px solid var(--color-outline-variant, #c3c6d7);
          opacity: 0.3;
          margin-top: 3rem;
          margin-bottom: 3rem;
        }
        .materi-prose code {
          background-color: var(--color-surface-container-low, #eff4ff);
          color: var(--color-primary, #004ac6);
          padding: 0.2rem 0.4rem;
          border-radius: 0.375rem;
          font-size: 0.9em;
          font-family: monospace;
        }
        .materi-prose pre {
          background-color: var(--color-inverse-surface, #213145);
          color: var(--color-inverse-on-surface, #eaf1ff);
          padding: 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .materi-prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
        }
      `}</style>

      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col justify-between">
        <div className="max-w-3xl mx-auto px-6 w-full flex-grow flex flex-col">
          {/* Back Button */}
          <Link
            to="/materi"
            className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-md text-label-md mb-8"
          >
            <span className="material-symbols-outlined text-xl">
              arrow_back
            </span>
            Kembali ke Daftar Materi
          </Link>

          {/* Article Wrapper */}
          <article className="w-full">
            {/* Title */}
            <h1 className="font-display-lg text-[3rem] text-on-surface leading-tight font-extrabold tracking-tight mb-8">
              {materi.title}
            </h1>

            {/* Author / Metadata (Medium-style) */}
            <div className="flex items-center gap-4 mb-10 pb-8 border-b border-outline-variant/20">
              {/* Circular Avatar */}
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20 shadow-inner select-none shrink-0">
                {materi.author?.name
                  ? materi.author.name.charAt(0).toUpperCase()
                  : "T"}
              </div>

              {/* Meta details */}
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-label-lg font-bold text-on-surface">
                    {materi.author?.name || "Tim Edukasi"}
                  </span>
                  {materi.status === "draft" && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full select-none">
                      Draft
                    </span>
                  )}
                  <span className="bg-primary/5 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary-fixed-dim/20 select-none">
                    Materi Edukasi
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  <span>Dipublikasikan pada</span>
                  <span>•</span>
                  <span>
                    {new Date(materi.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Content (HTML from Editor) */}
            <div className="materi-prose w-full">
              <div dangerouslySetInnerHTML={{ __html: materi.content }} />
            </div>
          </article>
        </div>
      </main>
    </>
  );
};

export default MateriDetailPage;
