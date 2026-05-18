import { TextStyle } from 'react-native';

// Font families
export const fontFamilies = {
  // Default system fonts (no custom fonts needed)
  // regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  // medium: Platform.OS === 'ios' ? 'System' : 'Roboto',
  // semibold: Platform.OS === 'ios' ? 'System' : 'Roboto',
  // bold: Platform.OS === 'ios' ? 'System' : 'Roboto',

  // If you have custom fonts, uncomment and use:
  // Inter for body text
  interLight: 'InterLight',
  interRegular: 'InterRegular',
  interMedium: 'InterMedium',
  interBold: 'InterBold',

  // Space Grotesk for headers
  spaceGroteskRegular: 'SpaceGroteskRegular',
  spaceGroteskMedium: 'SpaceGroteskMedium',
  spaceGroteskBold: 'SpaceGroteskBold',
};

// Font sizes
export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

// Line heights
export const lineHeights = {
  xs: 14,
  sm: 16,
  md: 20,
  base: 24,
  lg: 26,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 48,
};

// Font weights mapping
export type FontWeight = 'light' | 'regular' | 'medium' | 'bold' | 'semibold';

export const fontWeights: Record<FontWeight, TextStyle['fontWeight']> = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Letter spacing
export const letterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.2,
};

// Text variants
export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'button'
  | 'caption'
  | 'overline';

// Map variants to their styles (using Space Grotesk for headers, Inter for body)
export const typographyVariants: Record<TextVariant, TextStyle> = {
  // Headers - Space Grotesk Bold
  h1: {
    fontFamily: fontFamilies.spaceGroteskBold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fontFamilies.spaceGroteskBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: fontFamilies.spaceGroteskBold,
    fontSize: 24,
    lineHeight: 32,
  },
  h4: {
    fontFamily: fontFamilies.spaceGroteskBold,
    fontSize: 20,
    lineHeight: 28,
  },

  // Subtitles - Space Grotesk Medium
  subtitle1: {
    fontFamily: fontFamilies.spaceGroteskMedium,
    fontSize: 18,
    lineHeight: 26,
  },
  subtitle2: {
    fontFamily: fontFamilies.spaceGroteskMedium,
    fontSize: 16,
    lineHeight: 24,
  },

  // Body - Inter Regular/Medium
  body1: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  body3: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 12,
    lineHeight: 16,
  },

  // Button - Inter Medium
  button: {
    fontFamily: fontFamilies.interMedium,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },

  // Caption - Inter Regular
  caption: {
    fontFamily: fontFamilies.interRegular,
    fontSize: 12,
    lineHeight: 16,
  },

  // Overline - Inter Bold
  overline: {
    fontFamily: fontFamilies.interBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};

export type FontSize = keyof typeof fontSizes;

// Get variant style helper
export const getVariantStyle = (variant: TextVariant): TextStyle => {
  return typographyVariants[variant];
};
