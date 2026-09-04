'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useAuth } from '@/app/hooks/Authcontext';

export type ThemeColors = {
  background: string;
  backgroundText: string;
  backgroundHover: string;

  navbar: string;
  navbarText: string;
  navbarHover: string;

  header: string;
  headerText: string;
  headerHover: string;

  name?: string;
};

export const defaultTheme: ThemeColors = {
  background: '#F0F7FF',
  backgroundText: '#0f172a',
  backgroundHover: '#e2e8f0',

  navbar: '#0B4F6C',
  navbarText: '#ffffff',
  navbarHover: '#1E88E5',

  header: '#1E88E5',
  headerText: '#ffffff',
  headerHover: '#0B4F6C',
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

  Object.entries(map).forEach(([k, v]) => {
    root.style.setProperty(k, v);
  });
}

type ThemeContextType = {
  colors: ThemeColors;
  setColors: (c: ThemeColors) => void;
  saveTheme: (c: ThemeColors) => Promise<void>;
  resetTheme: () => Promise<void>;
  isThemeLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: authLoading, refetchAuth, setUser } = useAuth();

  const [colors, setColorsState] =
    useState<ThemeColors>(defaultTheme);

  const [isThemeLoading, setIsThemeLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      const theme = user.themeSettings
        ? { ...defaultTheme, ...user.themeSettings }
        : defaultTheme;

      setColorsState(theme);
      applyTheme(theme);
    } else {
      const saved = localStorage.getItem('roomify-theme');

      if (saved) {
        try {
          const parsed = {
            ...defaultTheme,
            ...JSON.parse(saved),
          };

          setColorsState(parsed);
          applyTheme(parsed);
          setIsThemeLoading(false);
          return;
        } catch {}
      }

      setColorsState(defaultTheme);
      applyTheme(defaultTheme);
    }

    setIsThemeLoading(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user?.id,
    JSON.stringify(user?.themeSettings),
    authLoading,
  ]);

  const setColors = (c: ThemeColors) => {
    setColorsState(c);
    applyTheme(c);
  };

  const saveTheme = async (c: ThemeColors) => {
    // 1. บันทึกสำรองลง localStorage ทันที (ให้สีแสดงถูกต้องตลอดเวลา)
    localStorage.setItem(
      'roomify-theme',
      JSON.stringify(c),
    );

    // 2. ถ้าล็อกอินอยู่ ให้ส่งไปบันทึกลง Database ผ่าน Next.js Proxy
    if (user) {
      try {
        const res = await fetch(
          `/api/auth/users/me/theme`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              themeSettings: c,
            }),
          },
        );

        if (res.ok) {
          // อัปเดต state user ทันที สีจะได้ไม่ดีดกลับ
          setUser({
            ...user,
            themeSettings: c as any,
          });
          if (refetchAuth) await refetchAuth();
        }
      } catch (err) {
        console.error("Save theme error:", err);
      }
    }
  };

  const resetTheme = async () => {
    setColors(defaultTheme);
    localStorage.removeItem('roomify-theme');

    if (user) {
      try {
        const res = await fetch(
          `/api/auth/users/me/theme`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              themeSettings: null,
            }),
          },
        );

        if (res.ok) {
          setUser({
            ...user,
            themeSettings: null,
          });
          if (refetchAuth) await refetchAuth();
        }
      } catch (err) {
        console.error("Reset theme error:", err);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colors,
        setColors,
        saveTheme,
        resetTheme,
        isThemeLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error(
      'useTheme must be used within ThemeProvider',
    );
  }

  return ctx;
};