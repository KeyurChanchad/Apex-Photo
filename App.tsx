import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
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
