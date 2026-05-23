import { Link, useLocation } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <>
      {/* TopNavBar Shared Component */}
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
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Kumpulan Video
            </Link>
            <Link
              to="/"
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg"
            >
              Tentang Kami
            </Link>
          </nav>

          {/* Trailing Action */}
          <Link
            to={isLogin ? "/register" : "/login"}
            className="block font-label-md text-label-md bg-primary text-on-primary rounded-full px-6 py-2 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:scale-95 active:translate-y-0.5 active:shadow-none font-semibold text-center"
          >
            {isLogin ? "Register" : "Login"}
          </Link>
        </div>
      </header>

      {/* Main Content (Centered Form Card both Vertically & Horizontally below the h-16 Navbar, No Footer) */}
      <main className="flex-grow min-h-[calc(100vh-4rem)] mt-16 flex items-center justify-center relative overflow-hidden py-8">
        {/* Soft background decorative blobs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-container rounded-full blur-3xl opacity-10 -z-10"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-secondary-container rounded-full blur-3xl opacity-15 -z-10"></div>

        {/* Auth Card Container */}
        <div className="w-full max-w-[500px] mx-auto px-margin-mobile md:px-0 z-10">
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-[0_16px_40px_rgba(0,74,198,0.08),inset_2px_2px_6px_rgba(255,255,255,1)] border border-outline-variant/10 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="font-headline-md text-headline-md text-on-surface">
                {isLogin ? "Masuk" : "Daftar Akun"}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {isLogin ? (
                  <>
                    Belum punya akun?{" "}
                    <Link
                      to="/register"
                      className="text-primary hover:underline font-semibold"
                    >
                      Daftar di sini
                    </Link>
                  </>
                ) : (
                  <>
                    Sudah punya akun?{" "}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-semibold"
                    >
                      Masuk di sini
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Render dynamically depending on active path */}
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </div>
        </div>
      </main>
    </>
  );
}
