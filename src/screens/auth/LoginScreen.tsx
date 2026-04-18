import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { useTheme } from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';
import { CountryPicker } from 'react-native-country-codes-picker';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export const LoginScreen: React.FC = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { verifyMobileNo, loginLoading, error, clearError } = useAuth();
  const [show, setShow] = useState(false);
  const [countryCode, setCountryCode] = useState('+91'); // Default to India
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryFlag, setCountryFlag] = useState('🇮🇳');
  const [disabledBtn, setDisabledBtn] = useState(true);

  // Handle OTP send
  const handleSendOTP = async () => {
    // Validate mobile number
    if (!mobileNumber.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your mobile number',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (mobileNumber.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid 10-digit mobile number',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    try {
      // Calling OTP send API
      const refId = await verifyMobileNo(countryCode, mobileNumber);

      if (!refId) {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: `Fail to send otp on ${countryCode} ${mobileNumber}`,
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'OTP Sent!',
        text2: `OTP sent to ${countryCode} ${mobileNumber}`,
        position: 'top',
        visibilityTime: 3000,
      });

      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        countryCode,
        mobileNumber,
        refId,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Send OTP',
        text2: err.message || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <ThemedText variant="h1" weight="bold" style={styles.title}>
              EventFaceFinder
            </ThemedText>
            <ThemedText variant="body2" style={styles.subtitle}>
              Your memories, beautifully organized
            </ThemedText>
          </View>

          {/* Error Message */}
          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.errorLight },
              ]}
            >
              <ThemedText style={[styles.errorText, { color: colors.error }]}>
                {error}
              </ThemedText>
              <TouchableOpacity onPress={clearError}>
                <ThemedText style={{ color: colors.primary }}>
                  Dismiss
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.mobileInputContainer}>
              {/* Country Code Picker Button */}
              <TouchableOpacity
                onPress={() => setShow(true)}
                style={[
                  styles.countryCodeButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <ThemedText style={styles.countryFlag}>
                  {countryFlag}
                </ThemedText>
                <ThemedText style={styles.countryCodeText}>
                  {countryCode}
                </ThemedText>
                <ThemedText style={styles.dropdownIcon}>▼</ThemedText>
              </TouchableOpacity>

              {/* Vertical Divider */}
              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              {/* Mobile Number Input */}
              <TextInput
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor={colors.textSecondary}
                style={[
                  styles.mobileInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                value={mobileNumber}
                onChangeText={text => {
                  setMobileNumber(text);
                  text.length < 10
                    ? setDisabledBtn(true)
                    : setDisabledBtn(false);
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Send OTP Button */}
            <TouchableOpacity
              style={[
                styles.sendOtpButton,
                {
                  backgroundColor: disabledBtn
                    ? colors.textTertiary
                    : colors.primary,
                },
                loginLoading && styles.buttonDisabled,
              ]}
              onPress={handleSendOTP}
              disabled={disabledBtn || loginLoading}
            >
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                {loginLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <MaterialIcons
                    name="send"
                    size={20}
                    color={disabledBtn ? colors.textSecondary : colors.white}
                  />
                )}
                <ThemedText
                  style={[
                    styles.buttonText,
                    {
                      color: disabledBtn ? colors.textSecondary : colors.white,
                    },
                  ]}
                >
                  {loginLoading ? 'Sending...' : 'Send OTP'}
                </ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <ThemedText variant="caption" style={styles.termsText}>
              By continuing, you agree to our{' '}
              <ThemedText
                variant="caption"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Terms of Service
              </ThemedText>{' '}
              and{' '}
              <ThemedText
                variant="caption"
                style={[styles.linkText, { color: colors.primary }]}
              >
                Privacy Policy
              </ThemedText>
            </ThemedText>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <CountryPicker
        lang="en"
        show={show}
        pickerButtonOnPress={item => {
          setCountryCode(item.dial_code);
          setCountryFlag(item.flag || '🏳️');
          setShow(false);
        }}
        style={{
          modal: {
            height: '80%',
            backgroundColor: colors.backgroundSecondary,
          },
          searchMessageText: {
            color: colors.text,
            backgroundColor: colors.background,
          },
          countryButtonStyles: {
            backgroundColor: colors.background,
            alignItems: 'flex-start',
          },
          textInput: {
            backgroundColor: colors.background,
            color: colors.text,
          },
          countryName: {
            color: colors.text,
          },
          dialCode: { color: colors.text },
          countryMessageContainer: {
            backgroundColor: colors.background,
          },
          modalInner: { backgroundColor: 'red' },
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    flex: 1,
    marginRight: 8,
    fontSize: 14,
  },
  form: {
    gap: 20,
  },
  mobileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 56,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    gap: 6,
    borderRightWidth: 0,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 12,
    marginLeft: 2,
  },
  divider: {
    width: 1,
    height: '60%',
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    height: '100%',
    borderWidth: 0,
  },
  sendOtpButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
  },
  linkText: {
    fontWeight: '600',
  },
});
