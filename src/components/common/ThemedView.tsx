import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'card';
}

export const ThemedView: React.FC<ThemedViewProps> = ({ 
  children, 
  variant = 'primary',
  style, 
  ...props 
}) => {
  const { colors } = useTheme();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.background;
      case 'secondary':
        return colors.backgroundSecondary;
      case 'card':
        return colors.card;
      default:
        return colors.background;
    }
  };
  
  return (
    <View 
      style={[
        { backgroundColor: getBackgroundColor() },
        styles.container,
        style
      ]} 
      {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});