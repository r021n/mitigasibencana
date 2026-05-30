import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { materialApi } from "../api/api";
import TopNavbar from "../components/layout/TopNavbar";

const MateriListPage = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialApi.getAll();
      // Hanya tampilkan materi yang berstatus publish
      const published = data.filter((m: any) => m.status === "publish");
      setMaterials(published);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
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

  return (
    <>
      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col">
        <div className="max-w-container-max mx-auto px-margin-desktop flex-grow w-full flex flex-col">
          <div className="text-center mb-12">
            <h1 className="font-display-lg text-display-lg text-on-surface font-bold mb-4">
              Materi Pembelajaran
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
              Tingkatkan pemahaman Anda tentang mitigasi bencana melalui berbagai
              materi edukatif yang tersedia.
            </p>
          </div>

          {materials.length === 0 ? (
            <div className="text-center bg-surface-container-lowest rounded-[2rem] p-12 border border-outline-variant/20 shadow-[0_8px_24px_rgba(11,28,48,0.04)] max-w-lg mx-auto mt-8">
              <span
                className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 select-none opacity-60"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                book_5
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Belum Ada Materi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Materi pembelajaran sedang disiapkan dan akan segera tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-gutter">
              {materials.map((materi) => (
                <Link
                  key={materi.id}
                  to={`/materi/${materi.id}`}
                  className="group bg-surface-container-lowest rounded-[1.5rem] p-gutter border border-outline-variant/10 shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] flex flex-col h-full cursor-pointer"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 text-primary mb-4">
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        book_5
                      </span>
                      <span className="font-label-md text-label-md uppercase tracking-wider">
                        Materi Edukasi
                      </span>
                    </div>

                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 group-hover:text-primary line-clamp-2 leading-tight">
                      {materi.title}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg opacity-70">
                          person
                        </span>
                        <span>{materi.author?.name || "Tim Edukasi"}</span>
                      </div>
                      <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-lg opacity-70">
                          calendar_month
                        </span>
                        <span>
                          {new Date(materi.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MateriListPage;
