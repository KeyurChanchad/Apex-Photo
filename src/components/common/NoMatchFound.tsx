import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '../../components/common/ThemedText';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const NoMatchFoundScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleTryAgain = () => {
    navigation?.goBack();
  };

  const handleBackToGallery = () => {
    navigation?.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.contentCard, { backgroundColor: colors.surface }]}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.errorCircle, { borderColor: colors.error }]}>
            <ThemedText
              variant="h1"
              style={[styles.errorIcon, { color: colors.error }]}
            >
              !
            </ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText variant="h2" style={[styles.title, { color: colors.text }]}>
          No Match Found
        </ThemedText>

        {/* Error Message */}
        <ThemedText
          variant="body1"
          style={[styles.message, { color: colors.textSecondary }]}
        >
          An error occurred during face scanning.
        </ThemedText>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            onPress={handleTryAgain}
            title="Try Again"
            type="primary"
            style={styles.tryAgainButton}
          />

          <CustomButton
            onPress={handleBackToGallery}
            title="← Back to Gallery"
            type="primary"
            style={styles.backButton}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentCard: {
    width: width * 0.85,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  tryAgainButton: {
    marginBottom: 4,
  },
  backButton: {
    borderWidth: 1.5,
  },
});

export default NoMatchFoundScreen;
