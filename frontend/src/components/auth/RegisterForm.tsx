import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, isLoading, error, success, clearMessages } = useAuthStore();
  const [localError, setLocalError] = useState("");
  const navigate = useNavigate();

  const [passwordMismatch, setPasswordMismatch] = useState(false);

  useEffect(() => {
    clearMessages();
    setLocalError("");
  }, [clearMessages]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordMismatch(true);
    } else {
      setPasswordMismatch(false);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearMessages();

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Semua kolom harus diisi!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError("Format email tidak valid!");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password minimal harus 6 karakter!");
      return;
    }

    // Blokir submit jika secara realtime password masih belum cocok
    if (password !== confirmPassword) {
      setLocalError("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    try {
      await register({ name, email, password });
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      {(localError || error) && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl font-label-md text-label-md flex items-center gap-2 border border-error/20">
          <span className="material-symbols-outlined text-xl">error</span>
          <span>{localError || error}</span>
        </div>
      )}

      {success && (
        <div className="bg-secondary-container text-on-secondary-container p-4 rounded-xl font-label-md text-label-md flex items-center gap-2 border border-secondary/20">
          <span className="material-symbols-outlined text-xl">
            check_circle
          </span>
          <span>{success}</span>
        </div>
      )}

      {/* Name Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="block font-label-md text-label-md text-on-surface font-semibold"
        >
          Nama Lengkap
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
            person
          </span>
          <input
            id="name"
            type="text"
            placeholder="Nama Lengkap Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] text-body-md"
          />
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block font-label-md text-label-md text-on-surface font-semibold"
        >
          Alamat Email
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
            mail
          </span>
          <input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface-container-low text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] text-body-md"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block font-label-md text-label-md text-on-surface font-semibold"
        >
          Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
            lock
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-11 py-3 bg-surface-container-low text-on-surface rounded-xl border border-outline-variant/30 focus:border-primary focus:outline-none shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] text-body-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-on-surface-variant hover:text-primary cursor-pointer border-none bg-transparent p-0"
          >
            <span className="material-symbols-outlined select-none text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="block font-label-md text-label-md text-on-surface font-semibold"
        >
          Konfirmasi Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-xl">
            lock_reset
          </span>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full pl-11 pr-11 py-3 bg-surface-container-low text-on-surface rounded-xl border focus:outline-none shadow-[inset_1px_1px_3px_rgba(11,28,48,0.05)] text-body-md ${
              passwordMismatch
                ? "border-error focus:border-error"
                : "border-outline-variant/30 focus:border-primary"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-on-surface-variant hover:text-primary cursor-pointer border-none bg-transparent p-0"
          >
            <span className="material-symbols-outlined select-none text-xl">
              {showConfirmPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {/* Peringatan Teks Realtime tepat di bawah input konfirmasi */}
        {passwordMismatch && (
          <p className="text-error text-xs font-medium flex items-center gap-1 mt-1 animate-fade-in">
            <span className="material-symbols-outlined text-sm">warning</span>
            Password tidak cocok!
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full block font-label-md text-label-md bg-primary text-on-primary rounded-full py-4 shadow-[0_6px_16px_rgba(0,74,198,0.25),inset_2px_2px_4px_rgba(255,255,255,0.3)] active:scale-95 active:translate-y-0.5 active:shadow-none font-bold text-center cursor-pointer mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? "Memproses..." : "Daftar Sekarang"}
      </button>
    </form>
  );
}
