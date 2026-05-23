import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/api";
import { SidebarProvider, useSidebar } from "../components/ui/sidebar";
import Sidebar from "../components/layout/Sidebar";

export default function UserInfoPage() {
  return (
    <SidebarProvider>
      <UserInfoInner />
    </SidebarProvider>
  );
}

function UserInfoInner() {
  const { open } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const displayUser = user || {
    name: "User",
    status: "student",
    email: "user@example.com",
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi kata sandi tidak cocok." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Kata sandi baru minimal 6 karakter.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.changePassword({ oldPassword, newPassword });
      setMessage({
        type: "success",
        text: res.message || "Kata sandi berhasil diubah.",
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Gagal mengubah kata sandi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Sidebar />

      <main
        className={`flex-grow w-full p-margin-desktop overflow-y-auto ${open ? "ml-64" : "ml-20"}`}
      >
        <div className="max-w-3xl mx-auto space-y-8">
          <header className="flex flex-row items-center justify-between pb-stack-sm border-b border-outline-variant/30">
            <div>
              <h2 className="font-display-lg text-display-lg text-on-surface select-none">
                Pengaturan Akun
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 select-none">
                Kelola informasi profil dan keamanan akun Anda.
              </p>
            </div>
          </header>

          {/* CARD 1 - INFORMASI PROFIL */}
          <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 clay-card border border-outline-variant/10">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-6">
              Informasi Profil
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-2">
                  Nama Lengkap
                </label>
                <div className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body-md text-on-surface">
                  {displayUser.name}
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-2">
                  Alamat Email
                </label>
                <div className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body-md text-on-surface">
                  {displayUser.email}
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-2">
                  Peran / Status
                </label>
                <div className="w-full rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 font-body-md text-on-surface capitalize">
                  {displayUser.status}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 - UBAH KATA SANDI */}
          <div className="bg-surface-container-lowest rounded-[1.5rem] p-8 clay-card border border-outline-variant/10">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-6">
              Ubah Kata Sandi
            </h3>

            {message.text && (
              <div
                className={`p-4 rounded-xl mb-6 font-body-md ${message.type === "error" ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"}`}
              >
                {message.text}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="space-y-5 max-w-md"
            >
              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2"
                  htmlFor="oldPassword"
                >
                  Kata Sandi Lama
                </label>
                <div className="relative">
                  <input
                    id="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 pr-12"
                    placeholder="Masukkan kata sandi saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showOldPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2"
                  htmlFor="newPassword"
                >
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 pr-12"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showNewPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label
                  className="block font-label-md text-label-md text-on-surface font-semibold mb-2"
                  htmlFor="confirmPassword"
                >
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-outline-variant/50 bg-surface focus:border-primary focus:outline-none shadow-inner font-body-md text-body-md px-4 py-3 pr-12"
                    placeholder="Ulangi kata sandi baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-primary bg-transparent border-none cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-auto px-6 py-3 rounded-xl font-label-md text-label-md bg-primary text-on-primary clay-btn cursor-pointer font-bold border-none disabled:opacity-70"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Kata Sandi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

    </>
  );
}
