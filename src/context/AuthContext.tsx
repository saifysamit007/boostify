import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/dataService';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

interface AuthSession {
  token: string;
  role: 'superadmin' | 'editor';
  email: string;
  expiresAt: number;
}

interface AuthContextType {
  isAdmin: boolean;
  role: 'superadmin' | 'editor' | null;
  session: AuthSession | null;
  loginWithBootstrapCode: (code: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAccessModalOpen: boolean;
  openAccessModal: () => void;
  closeAccessModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem('boostify_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthSession;
        if (parsed.expiresAt > Date.now()) {
          return parsed;
        } else {
          localStorage.removeItem('boostify_admin_session');
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  // Hidden Keyboard Shortcut listener:
  // Robust support for:
  // 1. Ctrl/Cmd + Shift + A then B (sequential)
  // 2. Ctrl/Cmd + Shift + A + B (pressed simultaneously)
  // 3. Ctrl/Cmd + Shift + A (direct)
  // 4. Ctrl/Cmd + Shift + B (direct fallback)
  // 5. Ctrl/Cmd + Alt + A / B
  // 6. Typing the secret word "admin" anywhere on the page
  // 7. Window custom event 'boostify_open_admin_modal' or window.openBoostifyAdmin()
  useEffect(() => {
    let aPressed = false;
    let chordTimer: NodeJS.Timeout | null = null;
    let keyBuffer = '';
    let bufferTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;
      const keyLower = (e.key || '').toLowerCase();
      const code = e.code || '';

      const isKeyA = code === 'KeyA' || keyLower === 'a' || e.keyCode === 65;
      const isKeyB = code === 'KeyB' || keyLower === 'b' || e.keyCode === 66;

      // 1. Simultaneous or direct chord: Ctrl+Shift+A or Ctrl+Shift+B or Ctrl+Alt+A/B
      if (isCmdOrCtrl && (isShift || isAlt) && (isKeyA || isKeyB)) {
        e.preventDefault();
        e.stopPropagation();
        setIsAccessModalOpen(true);
        return;
      }

      // 2. Sequential chord: Ctrl/Cmd + Shift + A, followed by B within 4 seconds
      if (isCmdOrCtrl && isShift && isKeyA) {
        e.preventDefault();
        e.stopPropagation();
        aPressed = true;
        if (chordTimer) clearTimeout(chordTimer);
        chordTimer = setTimeout(() => {
          aPressed = false;
        }, 4000);
        return;
      }

      if (aPressed && isKeyB) {
        e.preventDefault();
        e.stopPropagation();
        aPressed = false;
        if (chordTimer) clearTimeout(chordTimer);
        setIsAccessModalOpen(true);
        return;
      }

      // 3. Secret keyword typing fallback: typing 'admin' or 'saify'
      if (/^[a-zA-Z]$/.test(e.key)) {
        keyBuffer += keyLower;
        if (bufferTimer) clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => {
          keyBuffer = '';
        }, 3000);

        if (keyBuffer.endsWith('admin') || keyBuffer.endsWith('saify')) {
          keyBuffer = '';
          setIsAccessModalOpen(true);
        }
      }
    };

    // Global window trigger function for emergency access
    (window as unknown as { openBoostifyAdmin: () => void }).openBoostifyAdmin = () => {
      setIsAccessModalOpen(true);
    };

    const handleCustomTrigger = () => {
      setIsAccessModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('boostify_open_admin_modal', handleCustomTrigger);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('boostify_open_admin_modal', handleCustomTrigger);
      if (chordTimer) clearTimeout(chordTimer);
      if (bufferTimer) clearTimeout(bufferTimer);
    };
  }, []);

  const loginWithBootstrapCode = async (code: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = code.trim();

    // 1. Attempt server-side validation via /api/auth/bootstrap
    try {
      const res = await fetch('/api/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.token) {
          const newSession: AuthSession = {
            token: data.token,
            role: data.role || 'superadmin',
            email: 'admin@boostify.agency',
            expiresAt: data.expiresAt || Date.now() + 8 * 60 * 60 * 1000,
          };
          setSession(newSession);
          localStorage.setItem('boostify_admin_session', JSON.stringify(newSession));
          setIsAccessModalOpen(false);
          return { success: true };
        } else {
          return { success: false, message: data.message || 'Invalid authorization credential.' };
        }
      }
    } catch {
      console.info('[Boostify Auth] Backend API call failed, falling back to local validation');
    }

    // 2. Client verification fallback (matches requested credential 'saify2026')
    const attemptsKey = 'boostify_auth_attempts';
    const rawAttempts = localStorage.getItem(attemptsKey);
    const now = Date.now();
    let attemptsData = rawAttempts ? JSON.parse(rawAttempts) : { count: 0, lockoutUntil: 0 };

    if (attemptsData.lockoutUntil > now) {
      const secondsLeft = Math.ceil((attemptsData.lockoutUntil - now) / 1000);
      return { 
        success: false, 
        message: `Too many failed attempts. Cooldown active for ${secondsLeft} seconds.` 
      };
    }

    if (trimmed === 'saify2026') {
      localStorage.removeItem(attemptsKey);
      const newSession: AuthSession = {
        token: 'boostify_token_' + Date.now() + '_' + Math.random().toString(36).substring(2),
        role: 'superadmin',
        email: 'saifysamit456@gmail.com',
        expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
      };
      setSession(newSession);
      localStorage.setItem('boostify_admin_session', JSON.stringify(newSession));
      setIsAccessModalOpen(false);
      return { success: true };
    } else {
      attemptsData.count = (attemptsData.count || 0) + 1;
      if (attemptsData.count >= 5) {
        attemptsData.lockoutUntil = now + 3 * 60 * 1000; // 3 minute lockout
      }
      localStorage.setItem(attemptsKey, JSON.stringify(attemptsData));
      return { 
        success: false, 
        message: attemptsData.count >= 5 
          ? 'Too many failed attempts. Account locked for 3 minutes.' 
          : `Invalid access credential. Attempt ${attemptsData.count} of 5.` 
      };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    if (!auth) {
      return { success: false, message: 'Firebase authentication is not initialized.' };
    }
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userEmail = (user.email || '').toLowerCase().trim();
      const authorizedEmails = ['saifysamit123@gmail.com', 'saifysamit456@gmail.com'];

      if (authorizedEmails.includes(userEmail) || userEmail.endsWith('@boostify.agency')) {
        const newSession: AuthSession = {
          token: 'boostify_google_' + user.uid,
          role: 'superadmin',
          email: userEmail,
          expiresAt: Date.now() + 8 * 60 * 60 * 1000,
        };
        setSession(newSession);
        localStorage.setItem('boostify_admin_session', JSON.stringify(newSession));
        setIsAccessModalOpen(false);
        return { success: true };
      } else {
        await signOut(auth);
        return {
          success: false,
          message: `Access denied for ${userEmail}. Only authorized administrators can access this console.`
        };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Google sign-in was cancelled or encountered an issue.' };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('boostify_admin_session');
    if (auth) {
      signOut(auth).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin: Boolean(session && session.expiresAt > Date.now()),
        role: session ? session.role : null,
        session,
        loginWithBootstrapCode,
        loginWithGoogle,
        logout,
        isAccessModalOpen,
        openAccessModal: () => setIsAccessModalOpen(true),
        closeAccessModal: () => setIsAccessModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
