import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const STORAGE_KEY = 'theme';

const getInitialTheme = () => {
  // 1. Check localStorage
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  // 2. Check system preference
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';

  return 'light';
};

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Sync <html> class and localStorage whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
