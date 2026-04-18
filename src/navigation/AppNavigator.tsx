import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
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
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          fontFamily: typography.families.semibold,
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
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.semibold,
          fontFamily: typography.families.semibold,
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
        options={{ title: 'Verify OTP' }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator with Splash Screen Logic
export const AppNavigator = () => {
  const { colors, isDarkMode, typography } = useTheme();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<String | null>(null);

  // Create custom navigation theme
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
    fonts: {
      regular: {
        fontFamily: typography.families.regular,
        fontWeight: typography.weights.normal,
      },
      medium: {
        fontFamily: typography.families.medium,
        fontWeight: typography.weights.medium,
      },
      bold: {
        fontFamily: typography.families.bold,
        fontWeight: typography.weights.bold,
      },
      heavy: {
        fontFamily: typography.families.bold,
        fontWeight: typography.weights.bold,
      },
    },
  };

  useEffect(() => {
    checkRoute();
  }, []);

  const checkRoute = async () => {
    try {
      // Simulate API call or check authentication status
      // You can replace this with your actual API call
      const token = await AsyncStorage.getItem('token');
      const deviceId = await AsyncStorage.getItem('deviceId');

      // Example API call (uncomment and modify as needed)
      /*
      const response = await fetch('https://yourapi.com/check-auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (response.ok && data.isAuthenticated) {
        setIsAuthenticated(true);
        setInitialRoute('Main');
      } else {
        setIsAuthenticated(false);
        setInitialRoute('Auth');
      }
      */
      console.log('token & device ', token, deviceId);

      // Simple check for demonstration
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
  };

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
