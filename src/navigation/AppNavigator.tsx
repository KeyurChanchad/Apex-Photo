// navigation/AppNavigator.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import JoinEventScreen from '../screens/common/JoinEventScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { SplashScreen } from '../screens/common/SplashScreen';
import PhotoGalleryScreen from '../screens/photos/PhotoGalleryScreen';
import UploadPhotoScreen from '../screens/photos/UploadPhotoScreen';
import EventListScreen from '../screens/common/EventListScreen';
import NoMatchFoundScreen from '../components/common/NoMatchFound';
import EventDetailScreen from '../screens/common/EventDetailScreen';
import { navigationRef } from '../services/navigationService';

const Stack = createNativeStackNavigator();

// Main Stack Navigator (Authenticated screens)
const MainStackNavigator = () => {
  const { colors, typography } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTitleStyle: {
          color: colors.headerTitle,
          fontSize: 18, // Fixed size instead of typography.sizes.lg
          fontFamily: typography.families.spaceGroteskMedium, // Use Space Grotesk for headers
        },
        headerTintColor: colors.primary,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="EventList"
        component={EventListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="JoinEvent"
        component={JoinEventScreen}
        options={{
          headerTitle: '',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="PhotoGallery"
        component={PhotoGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadPhoto"
        component={UploadPhotoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NoMatchFound"
        component={NoMatchFoundScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Auth Stack Navigator (Login/OTP screens)
const AuthStackNavigator = () => {
  const { colors, typography } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.header,
        },
        headerTitleStyle: {
          color: colors.headerTitle,
          fontSize: 18,
          fontFamily: typography.families.spaceGroteskMedium,
        },
        headerTintColor: colors.primary,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          title: 'Verify OTP',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator with Splash Screen Logic
export const AppNavigator = () => {
  const { colors, isDarkMode, typography } = useTheme();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Create React Navigation theme based on your app's theme
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    // Optional: Add fonts for navigation (uses Inter)
    fonts: {
      regular: {
        fontFamily: typography.families.interRegular,
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: typography.families.interMedium,
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: typography.families.interBold,
        fontWeight: '700' as const,
      },
      heavy: {
        fontFamily: typography.families.interBold,
        fontWeight: '800' as const,
      },
    },
  };

  const checkRoute = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const deviceId = await AsyncStorage.getItem('deviceId');

      if (token && deviceId) {
        setTimeout(() => {
          setIsLoading(false);
          setIsAuthenticated(true);
          setInitialRoute('Main');
        }, 1500);
      } else if (!token && deviceId) {
        setTimeout(() => {
          setIsLoading(false);
          setInitialRoute('Auth');
          setIsAuthenticated(false);
        }, 1500);
      } else if (!deviceId) {
        setIsLoading(true);
        setInitialRoute(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsLoading(true);
      setInitialRoute(null);
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  useEffect(() => {
    checkRoute();
  }, [checkRoute]);

  // Show splash screen while loading
  if (isLoading || !initialRoute) {
    return (
      <SplashScreen
        onFinish={() => {
          checkRoute();
        }}
      />
    );
  }

  return (
    <NavigationContainer theme={navigationTheme} ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
