// screens/JoinEventScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemedText } from '../../components/common/ThemedText';
import CustomButton from '../../components/common/CustomButton';
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';
import { usePermission } from '../../hooks/usePermission';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { launchImageLibrary, PhotoQuality } from 'react-native-image-picker';
import api from '../../services/api';

export const JoinEventScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { colors } = useTheme();
  const [eventCode, setEventCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const device = useCameraDevice('back');
  const { hasPermission, checkPermission, requestPermission } =
    usePermission('camera');

  const checkCameraPermission = useCallback(async () => {
    await checkPermission();
    if (!hasPermission) {
      setCameraPermission(false);
      await requestPermission();
    } else {
      setCameraPermission(true);
    }
  }, [hasPermission, checkPermission, requestPermission]);

  // Request camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, [checkCameraPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'codabar'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const scannedCode = codes[0].value;
        setIsScanning(false);
        setEventCode(scannedCode);
        handleJoinEvent(scannedCode);
      }
    },
  });

  const handleScanPress = () => {
    if (cameraPermission) {
      setIsScanning(true);
    } else {
      checkCameraPermission();
    }
  };

  const handleUploadQRImage = () => {
    const options = {
      selectionLimit: 1,
      mediaType: 'photo' as const,
      includeBase64: false,
      quality: 1 as PhotoQuality,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to pick image',
          position: 'top',
          visibilityTime: 3000,
        });
      } else if (response.assets && response.assets[0]?.uri) {
        const imageUri = response.assets[0].uri;

        try {
          setIsLoading(true);

          // Decode QR code from image
          // You'll need to install: npm install react-native-qrcode-scanner
          // Or use a QR code decoding library like: react-native-qrcode-local-image

          // For now, we'll use a placeholder QR decoder
          // Replace this with actual QR decoding logic
          const qrCode = await decodeQRCodeFromImage(imageUri);

          if (qrCode) {
            setEventCode(qrCode);
            handleJoinEvent(qrCode);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'No QR code found in the selected image',
              position: 'top',
              visibilityTime: 3000,
            });
          }
        } catch (error) {
          console.error('QR decode error:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to read QR code from image',
            position: 'top',
            visibilityTime: 3000,
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  // Helper function to decode QR code from image
  // You need to implement this based on your QR code library
  const decodeQRCodeFromImage = async (
    imageUri: string,
  ): Promise<string | null> => {
    console.log('image uri ', imageUri);

    // Option 1: Using react-native-qrcode-scanner
    // Option 2: Using react-native-qrcode-local-image
    // Option 3: Send to your backend API for decoding

    // For demonstration, we'll simulate a QR code decode
    // Replace this with actual implementation
    return new Promise(resolve => {
      setTimeout(() => {
        // Mock QR code value
        resolve('EVT2024');
      }, 1000);
    });
  };

  const handleJoinEvent = useCallback(
    async (code?: string) => {
      const joinCode = code || eventCode;
      setIsLoading(true);
      try {
        console.log('Join code being sent:', joinCode);
        const response = await api.post('/PortfolioEventApi/JoinEvent', {
          accessCode: joinCode,
        });
        console.log('Response Success:', response.data);
        if (response.statusCode !== 200) {
          Toast.show({
            type: 'error',
            text1: 'Error',
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
        // Navigate to event screen here
        navigation.navigate('PhotoGallery', {
          eventId: response.data.eventId,
          eventCode: response.data.eventCode,
          eventName: response.data.eventName,
        });
      } catch (error) {
        console.error('Error to join event ', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to join event. Please try again.',
          position: 'top',
          visibilityTime: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [eventCode, navigation],
  );

  // QR Scanner View
  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <ThemedText style={styles.scannerTitle}>Scanning QR Code</ThemedText>
          <TouchableOpacity
            onPress={() => setIsScanning(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={20} style={styles.closeText} />
          </TouchableOpacity>
        </View>
        {device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            codeScanner={codeScanner}
          />
        ) : (
          <View style={styles.noCameraView}>
            <ThemedText style={styles.noCameraText}>
              No camera available
            </ThemedText>
            <CustomButton
              title="Go Back"
              onPress={() => setIsScanning(false)}
              type="primary"
            />
          </View>
        )}
        <View style={styles.scannerOverlay}>
          <View style={styles.scanFrame} />
          <ThemedText style={styles.scanInstructions}>
            Align QR code within the frame
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="h4" style={styles.title}>
            Join Event
          </ThemedText>
          <ThemedText variant="subtitle1" style={styles.subtitle}>
            Enter code or scan QR
          </ThemedText>
        </View>

        {/* Main QR Scan Card */}
        <TouchableOpacity style={styles.scanCard} onPress={handleScanPress}>
          <View style={styles.qrIconContainer}>
            <MaterialIcons
              name="qr-code-scanner"
              size={36}
              color={colors.primary}
            />
          </View>
          <ThemedText variant="body1" style={styles.scanTitle}>
            Scan QR Code
          </ThemedText>
          <ThemedText
            variant="body2"
            style={styles.scanDescription}
            color="secondary"
          >
            Point your camera at the QR code
          </ThemedText>
        </TouchableOpacity>

        {/* Secondary Upload Option */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadQRImage}
        >
          <MaterialIcons
            name="photo-library"
            size={22}
            color={colors.textSecondary}
          />
          <ThemedText variant="body1" style={styles.uploadButtonText}>
            Upload QR code from gallery
          </ThemedText>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <ThemedText variant="caption" style={styles.orText}>
            OR
          </ThemedText>
          <View style={styles.orLine} />
        </View>

        {/* Event Code Input */}
        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <ThemedText variant="body2" style={styles.inputLabel}>
              Enter Event Code
            </ThemedText>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="e.g., EVT2024 or ABC123"
            placeholderTextColor={colors.textSecondary}
            value={eventCode}
            onChangeText={setEventCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Join Button */}
        <CustomButton
          onPress={() => handleJoinEvent(eventCode)}
          title={isLoading ? 'Joining...' : 'Join Event'}
          rightIcon="arrow-right-alt"
          iconColor={colors.white}
          loading={isLoading}
          type="primary"
          style={styles.joinButton}
          disabled={eventCode.trim().length < 3}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
  },
  scanCard: {
    borderRadius: 24,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  qrIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 13,
    textAlign: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  inputLabel: {
    // fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  joinButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  // Scanner styles
  scannerContainer: {
    flex: 1,
  },
  scannerHeader: {
    position: 'absolute',
    top: 20,
    left: 30,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scannerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  noCameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  noCameraText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default JoinEventScreen;
