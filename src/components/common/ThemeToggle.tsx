import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from './ThemedText';

export const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode, colors, isDarkMode } = useTheme();

  const getIconName = () => {
    if (themeMode === 'system') return 'phone-portrait-outline';
    return isDarkMode ? 'moon' : 'sunny';
  };

  const getNextMode = () => {
    if (themeMode === 'light') return 'dark';
    if (themeMode === 'dark') return 'system';
    return 'light';
  };

  const getModeLabel = () => {
    if (themeMode === 'light') return 'Light';
    if (themeMode === 'dark') return 'Dark';
    return 'System';
  };

  const handlePress = () => {
    const nextMode = getNextMode();
    setThemeMode(nextMode as any);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <MaterialIcon name={getIconName()} size={24} color={colors.primary} />
      <View style={styles.textContainer}>
        <ThemedText color="secondary" variant="body3">
          Theme
        </ThemedText>
        <ThemedText weight="semibold">{getModeLabel()}</ThemedText>
      </View>
      <MaterialIcon
        name="chevron-right"
        size={20}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
});
