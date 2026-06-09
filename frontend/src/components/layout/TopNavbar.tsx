import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function TopNavbar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isVideos = location.pathname.startsWith("/videos");
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isAbout = location.pathname.startsWith("/about");

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-margin-desktop h-16 max-w-container-max mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight"
        >
          MitigasiBencana
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="flex items-center gap-gutter">
          <Link
            to="/dashboard"
            className={`font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 ${
              isDashboard
                ? "text-primary bg-surface-container-low"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/materi"
            className={`font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname.startsWith("/materi")
                ? "text-primary bg-surface-container-low"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Materi
          </Link>
          <Link
            to="/videos"
            className={`font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 ${
              isVideos
                ? "text-primary bg-surface-container-low"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Kumpulan Video
          </Link>
          
          <Link
            to="/about"
            className={`font-label-md text-label-md px-3 py-2 rounded-lg transition-all duration-200 ${
              isAbout
                ? "text-primary bg-surface-container-low"
                : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
            }`}
          >
            Tentang Kami
          </Link>
        </nav>

        {/* Trailing Action */}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="font-label-md text-on-surface select-none">
              Halo, {user.name}
            </span>
          </div>
        ) : (
          <Link
            to={location.pathname === "/register" ? "/login" : "/register"}
            className="block font-label-md text-label-md bg-primary text-on-primary rounded-full px-6 py-2 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] hover:brightness-105 active:scale-95 active:translate-y-0.5 active:shadow-none font-semibold text-center transition-all duration-200"
          >
            {location.pathname === "/register" ? "Login" : "Register"}
          </Link>
        )}
      </div>
    </header>
  );
}
