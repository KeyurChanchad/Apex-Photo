import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { TextVariant, FontWeight } from '../../theme/typography';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'inverse'
    | 'error'
    | 'success'
    | 'warning'
    | 'info';
  weight?: FontWeight;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'auto',
  style,
  ...props
}) => {
  const { colors, typography } = useTheme();

  // Get color based on color prop
  const getColor = () => {
    switch (color) {
      case 'primary':
        return colors.text;
      case 'secondary':
        return colors.textSecondary;
      case 'tertiary':
        return colors.textMuted;
      case 'inverse':
        return colors.text;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'info':
        return colors.info;
      default:
        return colors.text;
    }
  };

  // Get variant styles
  const variantStyles =
    typography.variants[variant] || typography.variants.body1;

  // Apply weight override if provided
  const getFontFamily = () => {
    if (weight) {
      // Map weight to appropriate font family
      switch (weight) {
        case 'light':
          return typography.families.interLight;
        case 'regular':
          return typography.families.interRegular;
        case 'medium':
          return typography.families.interMedium;
        case 'bold':
          return typography.families.interBold;
        default:
          return variantStyles.fontFamily;
      }
    }
    return variantStyles.fontFamily;
  };

  // Combine styles
  const textStyle = {
    ...variantStyles,
    color: getColor(),
    textAlign: align,
    fontFamily: getFontFamily(),
    ...(weight && { fontWeight: typography.weights[weight] }),
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
