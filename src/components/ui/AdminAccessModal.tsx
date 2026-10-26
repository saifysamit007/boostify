import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LiquidGlass } from './LiquidGlass';
import { GlassButton } from './GlassButton';
import { ShieldCheck, Lock, X, AlertCircle, Loader2 } from 'lucide-react';

interface AdminAccessModalProps {
  onNavigateToAdmin?: () => void;
}

export const AdminAccessModal: React.FC<AdminAccessModalProps> = ({ onNavigateToAdmin }) => {
  const { isAccessModalOpen, closeAccessModal, loginWithBootstrapCode, loginWithGoogle, isAdmin } = useAuth();
  const [accessCode, setAccessCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isAccessModalOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          closeAccessModal();
          if (onNavigateToAdmin) {
            onNavigateToAdmin();
          } else {
            window.location.hash = '#/admin';
          }
        }, 600);
      } else {
        setErrorMsg(res.message || 'Google access verification failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during Google sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await loginWithBootstrapCode(accessCode.trim());
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setAccessCode('');
          closeAccessModal();
          if (onNavigateToAdmin) {
            onNavigateToAdmin();
          } else {
            window.location.hash = '#/admin';
          }
        }, 800);
      } else {
        setErrorMsg(res.message || 'Access verification failed.');
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={closeAccessModal}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md">
        <LiquidGlass variant="elevated" className="p-8 shadow-2xl border border-white/20">
          <button
            onClick={closeAccessModal}
            className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Close access modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-[#FF6E17]/10 border border-[#FF6E17]/30 text-[#FF6E17]">
              {isSuccess ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">System Access Verification</h3>
              <p className="text-xs text-neutral-400">Authenticated Gateway & Security Checkpoint</p>
            </div>
          </div>

          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                ✓ Administrator session is currently active.
              </div>
              <GlassButton
                className="w-full"
                onClick={() => {
                  closeAccessModal();
                  if (onNavigateToAdmin) onNavigateToAdmin();
                  else window.location.hash = '#/admin';
                }}
              >
                Go to Admin Dashboard
              </GlassButton>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Google Sign In Direct Option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || isSuccess}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign In with Google (Admin)
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono">or enter passcode</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      autoFocus
                      value={accessCode}
                      onChange={e => {
                        setAccessCode(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Enter security passcode (saify2026)..."
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6E17] focus:ring-1 focus:ring-[#FF6E17]"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {isSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verification successful. Establishing secure workspace...</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAccessModal}
                    className="px-4 py-2.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <GlassButton
                    type="submit"
                    size="sm"
                    disabled={isLoading || isSuccess || !accessCode.trim()}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                      </span>
                    ) : (
                      'Authorize'
                    )}
                  </GlassButton>
                </div>
              </form>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] text-neutral-500 font-mono">
              Boostify Secure Gateway • IP Monitored
            </span>
          </div>
        </LiquidGlass>
      </div>
    </div>
  );
};
