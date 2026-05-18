import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
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
  const [fullName, setFullName] = useState('');
  const [nameError, setNameError] = useState('');
  const [showVerificationStatus, setShowVerificationStatus] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    refId?: string;
  } | null>(null);

  // Validate name field
  const validateName = (name: string) => {
    if (!name.trim()) {
      setNameError('Please enter your full name');
      return false;
    }
    if (name.trim().length < 3) {
      setNameError('Name must be at least 3 characters long');
      return false;
    }
    if (name.trim().length > 50) {
      setNameError('Name must be less than 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  // Handle name change
  const handleNameChange = (text: string) => {
    setFullName(text);
    if (text.trim()) {
      validateName(text);
    } else {
      setNameError('');
    }
    // Re-enable button validation check
    updateButtonState(text, mobileNumber);
  };

  // Update button disabled state
  const updateButtonState = (name: string, mobile: string) => {
    const isNameValid = name.trim().length >= 3 && name.trim().length <= 50;
    const isMobileValid = mobile.length === 10;
    setDisabledBtn(!(isNameValid && isMobileValid));
  };

  // Handle mobile number change
  const handleMobileChange = (text: string) => {
    setMobileNumber(text);
    updateButtonState(fullName, text);
  };

  // Handle OTP send with name validation
  const handleSendOTP = async () => {
    // Validate name
    if (!validateName(fullName)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: nameError || 'Please enter your full name',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

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
      // Calling OTP send API with name parameter
      const refId = await verifyMobileNo(countryCode, mobileNumber, fullName);

      if (!refId) {
        setVerificationResult({
          success: false,
          message: `Failed to send OTP to ${countryCode} ${mobileNumber}`,
        });
        setShowVerificationStatus(true);

        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: `Failed to send OTP to ${countryCode} ${mobileNumber}`,
          position: 'top',
          visibilityTime: 3000,
        });

        // Reset verification status after 5 seconds
        setTimeout(() => {
          setShowVerificationStatus(false);
          setVerificationResult(null);
        }, 5000);
        return;
      }

      setVerificationResult({
        success: true,
        message: `OTP sent successfully to ${countryCode} ${mobileNumber}`,
        refId,
      });
      setShowVerificationStatus(true);

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
        fullName, // Pass name to next screen
      });

      // Reset verification status after 5 seconds
      setTimeout(() => {
        setShowVerificationStatus(false);
        setVerificationResult(null);
      }, 5000);
    } catch (err: any) {
      setVerificationResult({
        success: false,
        message: err.message || 'Failed to send OTP. Please try again.',
      });
      setShowVerificationStatus(true);

      Toast.show({
        type: 'error',
        text1: 'Failed to Send OTP',
        text2: err.message || 'Please try again',
        position: 'top',
        visibilityTime: 4000,
      });

      // Reset verification status after 5 seconds
      setTimeout(() => {
        setShowVerificationStatus(false);
        setVerificationResult(null);
      }, 5000);
    }
  };

  // Reset the entire form
  const resetForm = () => {
    setFullName('');
    setMobileNumber('');
    setCountryCode('+91');
    setCountryFlag('🇮🇳');
    setDisabledBtn(true);
    setNameError('');
    setShowVerificationStatus(false);
    setVerificationResult(null);
    clearError();
  };

  // Retry verification
  const handleRetry = () => {
    resetForm();
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/apexphoto_transparent.png')}
                style={{
                  width: width / 2,
                  height: width / 2,
                  transform: [{ translateX: 10 }],
                }}
                resizeMode="contain"
              />
            </View> */}
            {/* Header Section */}
            <View style={styles.header}>
              <ThemedText variant="h1" weight="bold" style={styles.title}>
                ApexPhoto
              </ThemedText>
              <ThemedText variant="body2" style={styles.subtitle}>
                Your memories, beautifully organized
              </ThemedText>
            </View>

            {/* Error Message */}
            {error && !showVerificationStatus && (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.errorLight },
                ]}
              >
                <ThemedText
                  variant="body1"
                  style={[styles.errorText, { color: colors.error }]}
                >
                  {error}
                </ThemedText>
                <TouchableOpacity onPress={clearError}>
                  <ThemedText variant="body1" style={{ color: colors.primary }}>
                    Dismiss
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* Verification Status Display */}
            {showVerificationStatus && verificationResult && (
              <View
                style={[
                  styles.verificationContainer,
                  {
                    backgroundColor: verificationResult.success
                      ? colors.successLight || '#d4edda'
                      : colors.errorLight,
                  },
                ]}
              >
                <View style={styles.verificationHeader}>
                  <MaterialIcons
                    name={verificationResult.success ? 'check-circle' : 'error'}
                    size={24}
                    color={verificationResult.success ? '#28a745' : '#dc3545'}
                  />
                  <ThemedText
                    style={[
                      styles.verificationTitle,
                      {
                        color: verificationResult.success
                          ? colors.success
                          : colors.error,
                      },
                    ]}
                  >
                    {verificationResult.success
                      ? 'Success!'
                      : 'Verification Failed'}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.verificationMessage,
                    {
                      color: verificationResult.success
                        ? colors.success
                        : colors.error,
                    },
                  ]}
                >
                  {verificationResult.message}
                </ThemedText>
                {!verificationResult.success && (
                  <TouchableOpacity
                    style={[
                      styles.retryButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={handleRetry}
                  >
                    <ThemedText style={styles.retryButtonText}>
                      Try Again
                    </ThemedText>
                  </TouchableOpacity>
                )}
                {verificationResult.refId && (
                  <ThemedText
                    style={[styles.refIdText, { color: colors.textSecondary }]}
                  >
                    Reference ID: {verificationResult.refId}
                  </ThemedText>
                )}
              </View>
            )}

            {/* Form Section - Only show if not showing verification success (optional) */}
            {!showVerificationStatus && (
              <View style={styles.form}>
                {/* Name Input Field */}
                <View style={styles.nameInputContainer}>
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                    style={[
                      styles.nameInput,
                      {
                        color: colors.text,
                        borderColor: nameError ? colors.error : colors.border,
                        backgroundColor: colors.surface,
                      },
                    ]}
                    value={fullName}
                    onChangeText={handleNameChange}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {nameError && (
                    <ThemedText
                      style={[styles.nameErrorText, { color: colors.error }]}
                    >
                      {nameError}
                    </ThemedText>
                  )}
                </View>

                {/* Mobile Input Section */}
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
                    onChangeText={handleMobileChange}
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
                        ? colors.text
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
                        style={{
                          transform: [
                            {
                              rotate: '-45deg',
                            },
                          ],
                        }}
                        color={
                          disabledBtn ? colors.textSecondary : colors.white
                        }
                      />
                    )}
                    <ThemedText
                      variant="h4"
                      style={[
                        styles.buttonText,
                        {
                          color: disabledBtn
                            ? colors.textSecondary
                            : colors.white,
                        },
                      ]}
                    >
                      {loginLoading ? 'Sending...' : 'Send OTP'}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Terms and Conditions */}
            {!showVerificationStatus && (
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
            )}
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 48,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 36,
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
  verificationContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  verificationMessage: {
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  refIdText: {
    fontSize: 12,
    marginTop: 8,
  },
  form: {
    gap: 20,
  },
  nameInputContainer: {
    marginBottom: 0,
  },
  nameInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  nameErrorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  nameValidText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
