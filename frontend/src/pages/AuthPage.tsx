import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import TopNavbar from "../components/layout/TopNavbar";

export default function AuthPage() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <>
      <TopNavbar />

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
