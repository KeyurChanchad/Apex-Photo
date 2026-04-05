import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
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
    | 'success';
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
        return colors.textTertiary;
      case 'inverse':
        return colors.textInverse;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      default:
        return colors.text;
    }
  };

  // Get variant styles
  const variantStyles =
    typography.variants[variant] || typography.variants.body1;

  // Combine styles
  const textStyle = {
    ...variantStyles,
    color: getColor(),
    textAlign: align,
    fontFamily: typography.families.regular,
    ...(weight && { fontWeight: typography.weights[weight] }),
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
