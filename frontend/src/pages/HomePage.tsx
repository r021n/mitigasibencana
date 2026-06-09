import { Link } from "react-router-dom";
import mitigationImg from "../assets/mitigation.png";
import TopNavbar from "../components/layout/TopNavbar";

export default function HomePage() {
  return (
    <>
      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg">
        {/* Hero Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-row items-center gap-stack-lg">
          {/* Left Content */}
          <div className="flex-1 space-y-stack-sm text-left z-10">
            <h1 className="font-display-lg text-display-lg text-on-surface">
              Mempersiapkan Guru Sains Masa Depan untuk{" "}
              <span className="text-primary">Ketahanan Bencana</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-0">
              Memajukan Tujuan Pembangunan Berkelanjutan (SDG) 4 & 10 melalui
              pendidikan berkualitas dan inklusif dalam mitigasi bencana.
              Lingkungan yang interaktif untuk penguasaan materi pedagogis
              tingkat tinggi.
            </p>
            <div className="pt-base flex flex-row gap-base justify-start">
              <button className="font-label-md text-label-md bg-primary text-on-primary rounded-full px-8 py-4 shadow-[0_8px_20px_rgba(0,74,198,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)] active:scale-95 active:translate-y-1 active:shadow-none transition-all duration-200">
                Tonton Video
              </button>
              <button className="font-label-md text-label-md bg-surface-container-highest text-on-surface rounded-full px-8 py-4 shadow-[0_4px_12px_rgba(11,28,48,0.05),inset_2px_2px_4px_rgba(255,255,255,0.8)] active:scale-95 active:translate-y-1 active:shadow-none transition-all duration-200">
                Baca Materi
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <img
            className="flex-1 w-full max-w-lg mx-auto h-auto object-contain"
            alt="Mitigasi Bencana"
            src={mitigationImg}
          />
        </section>

        {/* Our Mission Section (Asymmetric Bento Card) */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
          <div className="bg-surface-container-lowest rounded-[2rem] p-margin-desktop shadow-[0_12px_30px_rgba(0,74,198,0.08),inset_2px_2px_6px_rgba(255,255,255,1)] relative overflow-hidden flex flex-row items-center gap-gutter">
            {/* Decorative element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-30"></div>

            <div className="flex-1 space-y-base z-10">
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Misi Kami
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Kami percaya bahwa ilmu mitigasi bencana yang komprehensif harus
                dapat diakses dan menarik. Platform kami mengubah konsep
                mitigasi bencana yang kompleks menjadi pengalaman belajar yang
                interaktif. Dengan mengelola beban kognitif melalui desain
                minimalis yang lembut, kami memberdayakan calon guru untuk
                menguasai materi subjek berisiko tinggi dengan percaya diri dan
                kejelasan.
              </p>
            </div>

            {/* Stylized abstract 'clay' shapes representing data/learning */}
            <div className="flex-1 flex justify-center gap-4 z-10">
              <div className="w-24 h-32 bg-primary rounded-[1.5rem] shadow-[0_8px_20px_rgba(0,74,198,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)] translate-y-4"></div>
              <div className="w-24 h-40 bg-secondary rounded-[1.5rem] shadow-[0_8px_20px_rgba(0,108,74,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)] -translate-y-4"></div>
              <div className="w-24 h-24 bg-tertiary rounded-full shadow-[0_8px_20px_rgba(142,60,0,0.3),inset_2px_2px_4px_rgba(255,255,255,0.4)] self-center"></div>
            </div>
          </div>
        </section>

        {/* Key Learning Areas Section */}
        <section className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
          <h2 className="font-headline-md text-headline-md text-on-surface text-center mb-stack-md">
            Cakupan Bencana Alam
          </h2>
          <div className="grid grid-cols-3 gap-gutter">
            {/* Card 1: Longsor */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-primary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-primary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  landslide
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Tanah Longsor
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Memahami faktor pemicu pergerakan tanah, tanda-tanda awal
                ketidakstabilan lereng, serta langkah mitigasi vegetatif dan
                struktural.
              </p>
            </div>

            {/* Card 2: Angin Puting Beliung */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-secondary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(130,245,193,0.3),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-secondary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  cyclone
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Angin Puting Beliung
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Mengenali pola cuaca ekstrem, sistem peringatan dini angin
                kencang, dan protokol perlindungan diri saat berada di dalam
                maupun luar ruangan.
              </p>
            </div>

            {/* Card 3: Gempa Bumi */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-tertiary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(181,78,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.5)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-tertiary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  earthquake
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Gempa Bumi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Modul praktis untuk memahami aktivitas tektonik, integritas
                struktural bangunan tahan gempa, dan instruksi simulasi protokol
                darurat.
              </p>
            </div>

            {/* Card 4: Banjir */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-primary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-primary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  flood
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Banjir
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Pelajari manajemen risiko banjir bandang, pemetaan daerah aliran
                sungai (DAS), serta kesiapan logistik dan evakuasi mandiri
                komunitas.
              </p>
            </div>

            {/* Card 5: Tsunami */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-secondary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(130,245,193,0.3),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-secondary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  tsunami
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Tsunami
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Mengenali tanda alam pasca-gempa besar, memahami metode evakuasi
                berbasis zona ketinggian, dan pentingnya sistem tata ruang
                pesisir.
              </p>
            </div>

            {/* Card 6: Letusan Gunung Berapi */}
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-gutter shadow-[0_8px_24px_rgba(11,28,48,0.06),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10">
              <div className="w-16 h-16 bg-tertiary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(181,78,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.5)] mb-stack-sm">
                <span
                  className="material-symbols-outlined text-on-tertiary-container text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  volcano
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-base">
                Letusan Gunung Berapi
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Edukasi mengenai tingkatan status gunung api, bahaya aliran
                piroklastik (wedhus gembel), serta panduan keselamatan
                menghadapi abu vulkanik.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shared Component */}
      <footer className="w-full py-stack-lg px-margin-desktop flex flex-row justify-between items-start gap-base bg-surface-container-highest border-t border-outline-variant mt-auto">
        {/* Brand / Copyright */}
        <div className="flex flex-col items-start gap-1">
          <span className="font-label-md text-label-md font-bold text-primary">
            Mitigasi Bencana
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            © 2026 Mitigasi Bencana Ed. All rights reserved.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="#"
            className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Kebijakan Privasi
          </Link>
          <Link
            to="#"
            className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Ketentuan Layanan
          </Link>
          <Link
            to="#"
            className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Bantuan
          </Link>
          <Link
            to="#"
            className="font-caption text-caption text-on-surface-variant hover:text-primary transition-colors opacity-80 hover:opacity-100"
          >
            Penelitian Akademik
          </Link>
        </div>
      </footer>
    </>
  );
}
