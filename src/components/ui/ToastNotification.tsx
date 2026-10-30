import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Server,
  Database
} from 'lucide-react';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  backendError?: string;
  serverSynced?: boolean;
  firestoreSynced?: boolean;
  timestamp?: Date | number;
  duration?: number; // ms, default 5000 (0 for persistent)
  onRetry?: () => void;
}

interface ToastNotificationProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastNotificationContainer: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      aria-live="polite"
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map(toast => (
        <SingleToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(100);

  const duration = toast.duration ?? (toast.type === 'error' ? 8000 : 5000);

  useEffect(() => {
    if (duration <= 0) return;

    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return Math.max(0, prev - step);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, onDismiss]);

  const styleConfig = {
    success: {
      border: 'border-emerald-500/40 hover:border-emerald-500/60',
      bg: 'bg-neutral-950/95',
      glow: 'shadow-[0_10px_30px_rgba(16,185,129,0.15)]',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />,
      accent: 'text-emerald-400',
      progressBar: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    error: {
      border: 'border-red-500/50 hover:border-red-500/70',
      bg: 'bg-neutral-950/95',
      glow: 'shadow-[0_10px_30px_rgba(239,68,68,0.22)]',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />,
      accent: 'text-red-400',
      progressBar: 'bg-red-500',
      badge: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
    warning: {
      border: 'border-amber-500/40 hover:border-amber-500/60',
      bg: 'bg-neutral-950/95',
      glow: 'shadow-[0_10px_30px_rgba(245,158,11,0.15)]',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      accent: 'text-amber-400',
      progressBar: 'bg-amber-500',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    info: {
      border: 'border-[#FF6E17]/40 hover:border-[#FF6E17]/60',
      bg: 'bg-neutral-950/95',
      glow: 'shadow-[0_10px_30px_rgba(255,110,23,0.15)]',
      icon: <Info className="w-5 h-5 text-[#FF6E17] shrink-0 mt-0.5" />,
      accent: 'text-[#FF6E17]',
      progressBar: 'bg-[#FF6E17]',
      badge: 'bg-[#FF6E17]/10 text-[#FF6E17] border-[#FF6E17]/30',
    },
  }[toast.type];

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-2xl p-4 transition-all duration-300 ${styleConfig.border} ${styleConfig.bg} ${styleConfig.glow} animate-in fade-in slide-in-from-top-3`}
    >
      {/* Top auto-dismiss progress line */}
      {duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${styleConfig.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {styleConfig.icon}

        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h5 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{toast.title}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${styleConfig.badge}`}>
                {toast.type}
              </span>
            </h5>
            <span className="text-[10px] font-mono text-neutral-500 shrink-0">
              {toast.timestamp ? new Date(toast.timestamp).toLocaleTimeString() : 'Just now'}
            </span>
          </div>

          <p className="text-xs text-neutral-300 leading-relaxed font-sans">
            {toast.message}
          </p>

          {/* Sync status pills if available */}
          {(toast.serverSynced !== undefined || toast.firestoreSynced !== undefined) && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {toast.serverSynced !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  toast.serverSynced 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-red-500/10 text-red-400 border-red-500/30'
                }`}>
                  <Server className="w-3 h-3" />
                  <span>Server Disk: {toast.serverSynced ? 'Synced' : 'Failed'}</span>
                </span>
              )}

              {toast.firestoreSynced !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  toast.firestoreSynced 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-neutral-800 text-neutral-400 border-white/10'
                }`}>
                  <Database className="w-3 h-3" />
                  <span>Firestore: {toast.firestoreSynced ? 'Synced' : 'Local Master'}</span>
                </span>
              )}
            </div>
          )}

          {/* Expandable Technical Backend Error details if present */}
          {(toast.backendError || toast.details) && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                <span>{isExpanded ? 'Hide Technical Details' : 'View Technical Diagnostics'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {isExpanded && (
                <div className="mt-2 p-2.5 rounded-lg bg-black/80 border border-white/10 font-mono text-[11px] text-red-300 leading-relaxed break-all select-all animate-in fade-in duration-200">
                  {toast.backendError && (
                    <div className="mb-1">
                      <strong className="text-red-400">Backend Response:</strong> {toast.backendError}
                    </div>
                  )}
                  {toast.details && (
                    <div>
                      <strong className="text-neutral-400">Context:</strong> {toast.details}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action buttons (Retry, etc.) */}
          {toast.onRetry && (
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toast.onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retry Save</span>
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss Notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
