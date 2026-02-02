// Theme colors for dark and light modes
export const colors = {
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    surfacePressed: '#252527',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    buttonText: '#FFFFFF',
    functionButton: '#505055',
    functionButtonText: '#FFFFFF',
    shadowLight: '#3A3A3E',
    shadowDark: '#141416',
  },
  light: {
    background: '#E8ECEF',
    surface: '#F0F4F8',
    surfacePressed: '#E0E4E8',
    text: '#1C1C1E',
    textSecondary: '#6B7280',
    buttonText: '#1C1C1E',
    functionButton: '#D5D9DC',
    functionButtonText: '#1C1C1E',
    shadowLight: '#FFFFFF',
    shadowDark: '#C8CDD3',
  },
  accent: {
    orange: '#F5A623',
    orangeLight: '#FFBA47',
    orangeDark: '#E89A1C',
    orangeText: '#FFFFFF',
  },
};

export type ThemeType = 'dark' | 'light';
export type ColorScheme = typeof colors.dark | typeof colors.light;
