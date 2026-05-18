import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

// StatusBar manager component to handle theme changes
const StatusBarManager: React.FC = () => {
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    // Update status bar based on theme
    StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colors.background);
  }, [isDarkMode, colors]);

  return null;
};

// Main app content with theme context
const AppContent: React.FC = () => {
  return (
    <>
      <StatusBarManager />
      <AppNavigator />
      <Toast />
    </>
  );
};

// Root App component
const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;

const styles = StyleSheet.create({
  root: { flex: 1 },
});
