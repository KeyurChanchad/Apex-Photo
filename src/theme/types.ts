import { lightColors } from './colors';
import { textVariants, fontFamilies, fontSizes, fontWeights, lineHeights, letterSpacing} from './typography'

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = typeof import('./colors').lightColors;

export interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof lightColors;
  typography: {
    variants: typeof textVariants;
    families: typeof fontFamilies;
    sizes: typeof fontSizes;
    weights: typeof fontWeights;
    lineHeights: typeof lineHeights;
    letterSpacing: typeof letterSpacing;
  };
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => void;
  isDarkMode: boolean;
}