import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      aria-labelledby="logout-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
    >
      {/* Dialog Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-[20px]"
        onClick={onClose}
      ></div>

      {/* Modal Content Panel */}
      <div className="relative bg-surface-container-lowest rounded-[2rem] w-full max-w-sm p-8 clay-modal z-10 shadow-2xl border border-outline-variant/10">
        {/* Close Button */}
        <button
          aria-label="Tutup modal"
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container cursor-pointer clay-btn border-none"
          onClick={onClose}
        >
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[20px] flex items-center justify-center"
          >
            close
          </span>
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8 select-none text-center">
          <div className="w-12 h-12 bg-error-container/20 rounded-2xl flex items-center justify-center text-error mx-auto mb-4 shadow-inner">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[28px] flex items-center justify-center"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              logout
            </span>
          </div>
          <h3
            className="font-headline-sm text-headline-sm text-on-surface"
            id="logout-modal-title"
          >
            Konfirmasi Keluar
          </h3>
          <p className="font-caption text-caption text-on-surface-variant mt-2">
            Apakah Anda yakin ingin keluar dari akun Anda? Anda harus masuk
            kembali untuk mengakses halaman ini.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-6 border-t border-outline-variant/10 pt-4">
          <button
            className="px-5 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container cursor-pointer border-none bg-transparent font-semibold"
            onClick={onClose}
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
  );
}
