import type { Theme } from "#shared/domain/theme";
import { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "../lib/trpc";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps): React.JSX.Element {
  const [theme, setThemeLocal] = useState<Theme>(defaultTheme);

  // initial fetch from electron-store
  useEffect(() => {
    (async () => {
      try {
        const remote = await trpc.theme.get.query();
        if (remote) setThemeLocal(remote as Theme);
      } catch (err) {
        console.error("theme get error", err);
      }
    })();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: async (t: Theme) => {
      setThemeLocal(t);
      try {
        await trpc.theme.set.mutate(t);
      } catch (err) {
        console.error("theme set error", err);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
