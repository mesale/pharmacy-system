import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './theme';

const STORAGE_KEY = 'theme_mode';

// mode: 'light' | 'dark' | 'system'  — what the user picked.
// scheme: 'light' | 'dark'           — the resolved appearance.
const ThemeContext = createContext({
  colors: lightColors,
  scheme: 'light',
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }) {
  const osScheme = useColorScheme();
  const [mode, setModeState] = useState('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } catch (e) {
        // ignore — fall back to 'system'
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setMode = (next) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const scheme = mode === 'system' ? (osScheme || 'light') : mode;
  const colors = scheme === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({ colors, scheme, mode, setMode, loaded }),
    [colors, scheme, mode, loaded]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

// Rebuild a StyleSheet only when the palette changes.
// factory: (colors) => StyleSheet.create({...})
export function useThemedStyles(factory) {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
