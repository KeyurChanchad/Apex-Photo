import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '../../components/common/ThemedText';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useDeviceInfo } from '../../hooks/useDeviceInfo';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({
  onFinish,
}) => {
  const { colors } = useTheme();
  const { registerDevice } = useAuth();
  const { getDeviceInfo } = useDeviceInfo();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize app
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Step 1: Register device
      const deviceInfo = await getDeviceInfo();
      await registerDevice(deviceInfo);

      // Small delay for smooth transition
      setTimeout(() => {
        // Finish splash screen
        onFinish();
      }, 1500);
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Failed to initialize app');
    }
  };

  return (
    <View style={[styles.container]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../assets/images/apexphoto_transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ThemedText
          variant="h1"
          weight="bold"
          style={[styles.appName, { color: '#FFFFFF' }]}
        >
          Event Face Finder
        </ThemedText>

        <ThemedText
          variant="body2"
          style={[styles.tagline, { color: '#FFFFFF' }]}
        >
          Your memories, beautifully organized
        </ThemedText>
      </Animated.View>

      <View style={styles.bottomContainer}>
        {!error && <ActivityIndicator size="large" color="#FFFFFF" />}
        {error && (
          <ThemedText style={[styles.errorText, { color: '#FFE5E5' }]}>
            {error}
          </ThemedText>
        )}
        <ThemedText
          variant="caption"
          style={[styles.versionText, { color: '#FFFFFF' }]}
        >
          Version 1.0.0
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180,
    height: 180,
  },
  appName: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    marginTop: 10,
    opacity: 0.7,
  },
});
