import { Link } from "react-router-dom";
import TopNavbar from "../components/layout/TopNavbar";

export default function AboutPage() {
  return (
    <>
      <TopNavbar />

      <main className="flex-grow pt-24 pb-stack-lg min-h-screen bg-surface flex flex-col relative overflow-hidden">
        {/* Background Decorative Shapes */}
        <div className="absolute top-20 left-[-10%] w-[40%] h-[40%] bg-primary-container/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-10 right-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-container-max mx-auto px-margin-desktop w-full flex-grow flex flex-col z-10">
          {/* Hero Header */}
          <section className="text-center mb-16 max-w-3xl mx-auto">
            <span className="font-label-md text-label-md bg-primary/10 text-primary px-4 py-1.5 rounded-full inline-block mb-4 font-bold select-none">
              Tentang Platform Kami
            </span>
            <h1 className="font-display-lg text-display-lg text-on-surface font-extrabold mb-6 leading-tight">
              Membangun Ketahanan Bencana Melalui{" "}
              <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pendidikan Inklusif</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Platform pembelajaran digital interaktif yang dirancang khusus untuk membekali calon guru sains masa depan dengan kompetensi mitigasi bencana tingkat tinggi, dengan mengutamakan aksesibilitas bagi semua kalangan.
            </p>
          </section>

          {/* Visi & Misi Section (Bento Grid) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-20">
            {/* Visi Card */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-gutter shadow-[0_12px_30px_rgba(0,74,198,0.05),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-primary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.15),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-6">
                <span className="material-symbols-outlined text-on-primary-container text-3xl">visibility</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Visi Kami</h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Menjadi platform rujukan utama dalam pendidikan mitigasi bencana yang mencetak pendidik sains berkualitas tinggi, adaptif, tangguh, dan mampu menciptakan inklusivitas tanpa batas di ruang kelas masa depan.
              </p>
            </div>

            {/* Misi Card */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-gutter shadow-[0_12px_30px_rgba(0,108,74,0.05),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10 relative overflow-hidden group hover:border-secondary/20 transition-all duration-300">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary/5 rounded-full group-hover:scale-125 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-secondary-container rounded-[1rem] flex items-center justify-center shadow-[0_4px_12px_rgba(130,245,193,0.15),inset_2px_2px_4px_rgba(255,255,255,0.6)] mb-6">
                <span className="material-symbols-outlined text-on-secondary-container text-3xl">my_location</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Misi Kami</h2>
              <ul className="space-y-3 font-body-md text-body-md text-on-surface-variant leading-relaxed list-none pl-0">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg mt-1 shrink-0">check_circle</span>
                  <span>Menyediakan konten pembelajaran kebencanaan yang valid, interaktif, berbasis riset, dan mudah dipahami.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg mt-1 shrink-0">check_circle</span>
                  <span>Menerapkan fitur aksesibilitas mutakhir untuk mendukung pembelajaran inklusif bagi seluruh calon guru.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg mt-1 shrink-0">check_circle</span>
                  <span>Mendorong pemahaman praktis mitigasi kebencanaan melalui simulasi pertanyaan dan integrasi audio visual.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* SDG Alignment Section */}
          <section className="bg-surface-container-low rounded-[2.5rem] p-8 md:p-12 border border-outline-variant/10 shadow-sm mb-20">
            <div className="text-center mb-10 max-w-xl mx-auto">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-3">Pilar SDG Yang Kami Dukung</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Platform ini berkontribusi aktif secara nyata terhadap pencapaian Tujuan Pembangunan Berkelanjutan (Sustainable Development Goals).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* SDG 4 */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex gap-5 items-start">
                <div className="w-16 h-16 bg-[#C5192D]/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#C5192D] text-3xl">school</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-[#C5192D] font-bold mb-2">SDG 4: Pendidikan Berkualitas</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Meningkatkan mutu pembelajaran kebencanaan dengan menyajikan konten materi ajar yang interaktif, terstruktur, dan berbasis pada kebutuhan kurikulum sains masa kini.
                  </p>
                </div>
              </div>

              {/* SDG 10 */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex gap-5 items-start">
                <div className="w-16 h-16 bg-[#1F75FE]/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1F75FE] text-3xl">groups</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-[#1F75FE] font-bold mb-2">SDG 10: Berkurangnya Kesenjangan</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    Menyediakan widget aksesibilitas inklusif (skala huruf, kursor besar, text-to-speech bahasa Indonesia, dsb) demi menjamin kesempatan belajar yang setara bagi semua individu.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action or Explore */}
          <section className="text-center py-8 mb-12 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 rounded-[2rem] p-8">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Mari Mulai Belajar Bersama Kami</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mb-8">
              Jelajahi berbagai materi teks interaktif dan kumpulan video mitigasi bencana pilihan untuk meningkatkan wawasan kegawatdaruratan Anda.
            </p>
            <div className="flex flex-row justify-center gap-4">
              <Link
                to="/materi"
                className="font-label-md text-label-md bg-primary text-on-primary rounded-full px-8 py-3.5 shadow-[0_6px_16px_rgba(0,74,198,0.2),inset_2px_2px_4px_rgba(255,255,255,0.4)] active:scale-95 transition-all duration-200"
              >
                Baca Materi
              </Link>
              <Link
                to="/videos"
                className="font-label-md text-label-md bg-surface-container-highest text-on-surface rounded-full px-8 py-3.5 shadow-[0_4px_12px_rgba(11,28,48,0.05),inset_2px_2px_4px_rgba(255,255,255,0.8)] active:scale-95 transition-all duration-200"
              >
                Tonton Video
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-desktop flex flex-row justify-between items-start gap-base bg-surface-container-highest border-t border-outline-variant">
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
