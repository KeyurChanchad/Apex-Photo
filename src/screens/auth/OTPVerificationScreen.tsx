import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../theme/ThemeContext';
import Toast from 'react-native-toast-message';
import { StackActions } from '@react-navigation/native';

interface OTPVerificationScreenProps {
  route: {
    params: {
      countryCode: string;
      mobileNumber: string;
      refId: string;
    };
  };
  navigation: any;
}

export const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors } = useTheme();
  const { verifyOTP, verifyMobileNo, loading } = useAuth();
  const { countryCode, mobileNumber, refId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOTPChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    try {
      console.log('response of verify otp ', refId, otpString);
      const response = await verifyOTP(refId, otpString);

      if (!response.success) {
        Toast.show({
          type: 'error',
          text1: 'Fail',
          text2: response.message,
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.message,
        position: 'top',
        visibilityTime: 3000,
      });
      navigation.dispatch(
        StackActions.replace('Main', { screen: 'EventList' }),
      );
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    }
  };

  const handleResend = async () => {
    try {
      await verifyMobileNo(countryCode, mobileNumber);
      setTimer(60);
      setCanResend(false);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'OTP resent successfully',
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <ThemedView>
      <View style={styles.container}>
        <ThemedText variant="h3" weight="bold" style={styles.title}>
          Verify OTP
        </ThemedText>
        <ThemedText variant="body1" style={styles.subtitle}>
          Enter the 6-digit code sent to {mobileNumber}
        </ThemedText>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
              value={digit}
              onChangeText={text => handleOTPChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              editable={!loading}
            />
          ))}
        </View>

        <CustomButton
          title={loading ? 'Verifing...' : 'Verify OTP →'}
          onPress={handleVerify}
          loading={loading}
        />

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <ThemedText style={styles.orText}>OR</ThemedText>
          <View style={styles.orLine} />
        </View>

        <View style={styles.actionContainer}>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}
          >
            <ThemedText color={'secondary'}>Change Number</ThemedText>
          </Pressable>
          <View style={styles.resendContainer}>
            {!canResend ? (
              <ThemedText variant="body1" style={{ fontWeight: '400' }}>
                Resend code in {timer} seconds
              </ThemedText>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <ThemedText style={{ color: colors.primary }}>
                  Resend Code
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resendContainer: {
    alignItems: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999999',
  },
});
