import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightColors, DarkColors } from '@/constants/colors';

const THEME_KEY = 'app_theme_preference';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme() ?? 'light';
  const [themePreference, setThemePreference] = useState<Theme>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored) {
        setThemePreference(stored as Theme);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveThemePreference = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
      setThemePreference(theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const activeColorScheme: ColorScheme = 
    themePreference === 'system' ? systemColorScheme : themePreference;

  const colors = activeColorScheme === 'dark' ? DarkColors : LightColors;
  const isDark = activeColorScheme === 'dark';

  return {
    theme: themePreference,
    setTheme: saveThemePreference,
    colors,
    isDark,
    isLoaded,
  };
});
