import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authApi } from "../api/api";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../components/ui/sidebar";

export default function UserInfoPage() {
  return (
    <SidebarProvider>
      <UserInfoInner />
    </SidebarProvider>
  );
}

function UserInfoInner() {
  const { open, toggleSidebar } = useSidebar();
  const { user, logout } = useAuthStore();
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
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleOpenLogoutModal = () => setIsLogoutModalOpen(true);
  const handleCloseLogoutModal = () => setIsLogoutModalOpen(false);
  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

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
      <Sidebar>
        <div
          className={`mb-6 flex items-center ${open ? "justify-between" : "justify-center"} min-h-`}
        >
          {open && (
            <div className="select-none">
              <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                Portal Guru
              </h1>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
            title={open ? "Perkecil Sidebar" : "Perluas Sidebar"}
          >
            <span className="material-symbols-outlined text-2xl font-bold">
              {open ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={false}
                    title={!open ? "Kelola Video" : undefined}
                    onClick={() => navigate("/dashboard")}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 0" }}
                    >
                      video_library
                    </span>
                    {open && <span>Kelola Video</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={true}
                    title={!open ? "Pengaturan" : undefined}
                    onClick={() => navigate("/settings")}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      settings
                    </span>
                    {open && <span>Pengaturan</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto pt-6 border-t border-outline-variant/10">
          {open ? (
            <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between gap-2 shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] border border-outline-variant/5">
              <div className="min-w-0 flex-1 select-none">
                <p className="font-label-md text-label-md text-on-surface font-bold truncate">
                  {displayUser.name}
                </p>
                <p className="font-caption text-caption text-on-surface-variant capitalize mt-0.5">
                  {displayUser.status}
                </p>
              </div>
              <button
                onClick={handleOpenLogoutModal}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold">
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleOpenLogoutModal}
                className="w-12 h-12 bg-error-container/10 text-error hover:bg-error-container/30 rounded-xl cursor-pointer border-none flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold">
                  logout
                </span>
              </button>
            </div>
          )}
        </div>
      </Sidebar>

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

      {/* Logout Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          role="dialog"
        >
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-"
            onClick={handleCloseLogoutModal}
          ></div>
          <div className="relative bg-surface-container-lowest rounded- w-full max-w-sm p-8 clay-modal z-10 shadow-2xl border border-outline-variant/10">
            <button
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none"
              onClick={handleCloseLogoutModal}
            >
              <span className="material-symbols-outlined text-">close</span>
            </button>
            <div className="mb-6 pr-8 select-none text-center">
              <div className="w-12 h-12 bg-error-container/20 rounded-2xl flex items-center justify-center text-error mx-auto mb-4 shadow-inner">
                <span
                  className="material-symbols-outlined text-"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  logout
                </span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Konfirmasi Keluar
              </h3>
              <p className="font-caption text-caption text-on-surface-variant mt-2">
                Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk
                kembali untuk mengakses halaman ini.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 mt-6 border-t border-outline-variant/10 pt-4">
              <button
                className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-semibold"
                onClick={handleCloseLogoutModal}
                type="button"
              >
                Batal
              </button>
              <button
                className="px-6 py-2.5 rounded-xl font-label-md text-label-md bg-error text-on-error hover:bg-error/90 cursor-pointer font-bold border-none"
                onClick={handleConfirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
