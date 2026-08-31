'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

export type ThemeColors = {
  background: string; backgroundText: string; backgroundHover: string;
  navbar: string; navbarText: string; navbarHover: string;
  header: string; headerText: string; headerHover: string;
  name?: string;
};

export const defaultTheme: ThemeColors = {
  background: '#F0F7FF', backgroundText: '#0f172a', backgroundHover: '#e2e8f0',
  navbar: '#0B4F6C', navbarText: '#ffffff', navbarHover: '#1E88E5',
  header: '#1E88E5', headerText: '#ffffff', headerHover: '#0B4F6C',
};

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement;
  const map: Record<string, string> = {
    '--app-background': colors.background,
    '--app-background-text': colors.backgroundText,
    '--app-background-hover': colors.backgroundHover,
    '--app-navbar': colors.navbar,
    '--app-navbar-text': colors.navbarText,
    '--app-navbar-hover': colors.navbarHover,
    '--app-header': colors.header,
    '--app-header-text': colors.headerText,
    '--app-header-hover': colors.headerHover,
  };
  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
}

type ThemeContextType = {
  colors: ThemeColors;
  setColors: (c: ThemeColors) => void;
  saveTheme: (c: ThemeColors) => Promise<void>;
  resetTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [colors, setColorsState] = useState<ThemeColors>(defaultTheme);
  const appliedForUser = useRef<number | null | 'guest'>(null);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // login แล้ว: ใช้ theme จาก user object ตรงๆ ไม่ fetch เพิ่ม
      if (appliedForUser.current === user.id) return;
      appliedForUser.current = user.id;

      const theme = user.themeSettings
        ? { ...defaultTheme, ...user.themeSettings }
        : defaultTheme;
      setColorsState(theme);
      applyTheme(theme);
    } else {
      // guest: fallback localStorage
      if (appliedForUser.current === 'guest') return;
      appliedForUser.current = 'guest';

      const saved = localStorage.getItem('roomify-theme');
      if (saved) {
        try {
          const parsed = { ...defaultTheme, ...JSON.parse(saved) };
          setColorsState(parsed);
          applyTheme(parsed);
          return;
        } catch {}
      }
      applyTheme(defaultTheme);
    }
  }, [user, authLoading]);

  const setColors = (c: ThemeColors) => {
    setColorsState(c);
    applyTheme(c);
  };

  const saveTheme = async (c: ThemeColors) => {
    if (user) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ themeSettings: c }),
      });
    } else {
      localStorage.setItem('roomify-theme', JSON.stringify(c));
    }
  };

  const resetTheme = async () => {
    setColors(defaultTheme);
    if (user) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/theme`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ themeSettings: null }),
      });
    } else {
      localStorage.removeItem('roomify-theme');
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, setColors, saveTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};