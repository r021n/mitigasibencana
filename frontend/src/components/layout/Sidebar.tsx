import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSidebar } from "../ui/sidebar";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "../ui/sidebar";
import LogoutModal from "./LogoutModal";

export default function Sidebar() {
  const { open, toggleSidebar } = useSidebar();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const displayUser = user || {
    name: "Dr. Sarah Adams",
    status: "teacher" as const,
    email: "sarah.adams@mitigasibencana.edu",
  };

  const isDashboardActive = location.pathname === "/dashboard";
  const isAnalysisActive = location.pathname === "/analysis";
  const isSettingsActive = location.pathname === "/settings";

  return (
    <>
      <BaseSidebar>
        {/* Sidebar Toggle and Brand Header (Portal Guru added when expanded) */}
        <div
          className={`mb-6 flex flex-col gap-3`}
        >
          <div className={`flex items-center ${
            open ? "justify-between" : "justify-center"
          } min-h-[40px]`}>
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

          {/* Back to Home Link */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-2 text-on-surface-variant hover:text-primary hover:bg-surface-container/50 px-3 py-2 rounded-lg cursor-pointer border-none bg-transparent transition-all duration-200 text-left font-label-md text-label-md ${
              open ? "w-full justify-start" : "w-10 h-10 justify-center p-0 mx-auto"
            }`}
            title="Kembali ke Beranda"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            {open && <span>Kembali ke Beranda</span>}
          </button>
        </div>

        {/* Compound Sidebar Navigations */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isDashboardActive}
                    title={!open ? "Kelola Video" : undefined}
                    onClick={() => navigate("/dashboard")}
                  >
                    <span
                      className="material-symbols-outlined flex items-center justify-center"
                      style={{
                        fontVariationSettings: `'FILL' ${
                          isDashboardActive ? 1 : 0
                        }`,
                      }}
                    >
                      video_library
                    </span>
                    {open && <span>Kelola Video</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isAnalysisActive}
                    title={!open ? "Analisis Inklusi" : undefined}
                    onClick={() => navigate("/analysis")}
                  >
                    <span
                      className="material-symbols-outlined flex items-center justify-center"
                      style={{
                        fontVariationSettings: `'FILL' ${
                          isAnalysisActive ? 1 : 0
                        }`,
                      }}
                    >
                      interpreter_mode
                    </span>
                    {open && <span>Analisis Inklusi</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {displayUser.status === "admin" && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={location.pathname.startsWith("/admin/materi")}
                      title={!open ? "Kelola Materi" : undefined}
                      onClick={() => navigate("/admin/materi")}
                    >
                      <span
                        className="material-symbols-outlined flex items-center justify-center"
                        style={{
                          fontVariationSettings: `'FILL' ${
                            location.pathname.startsWith("/admin/materi") ? 1 : 0
                          }`,
                        }}
                      >
                        menu_book
                      </span>
                      {open && <span>Kelola Materi</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isSettingsActive}
                    title={!open ? "Pengaturan" : undefined}
                    onClick={() => navigate("/settings")}
                  >
                    <span
                      className="material-symbols-outlined flex items-center justify-center"
                      style={{
                        fontVariationSettings: `'FILL' ${
                          isSettingsActive ? 1 : 0
                        }`,
                      }}
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

        {/* Sidebar Footer: User profile information & Logout Button */}
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
                onClick={() => setIsLogoutModalOpen(true)}
                className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg cursor-pointer border-none bg-transparent flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold flex items-center justify-center">
                  logout
                </span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-12 h-12 bg-error-container/10 text-error hover:bg-error-container/30 rounded-xl cursor-pointer border-none flex items-center justify-center"
                title="Keluar dari Akun"
              >
                <span className="material-symbols-outlined text-xl font-semibold flex items-center justify-center">
                  logout
                </span>
              </button>
            </div>
          )}
        </div>
      </BaseSidebar>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
