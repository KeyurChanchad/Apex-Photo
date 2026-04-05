// screens/JoinEventScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
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
import api from '../../services/api';

export const JoinEventScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [eventCode, setEventCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null,
  );
  const [isScanning, setIsScanning] = useState(false);
  const device = useCameraDevice('back');
  const { hasPermission, checkPermission, requestPermission } =
    usePermission('camera');

  // Request camera permission on mount
  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    await checkPermission();
    if (!hasPermission) {
      setCameraPermission(false);
      await requestPermission();
    } else {
      setCameraPermission(true);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'codabar'],
    onCodeScanned: codes => {
      if (codes.length > 0 && codes[0].value) {
        const scannedCode = codes[0].value;
        setIsScanning(false);
        setEventCode(scannedCode);
        Alert.alert('QR Code Scanned', `Code: ${scannedCode}`, [
          { text: 'OK', onPress: () => handleJoinEvent(scannedCode) },
        ]);
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

  const handleJoinEvent = async (code?: string) => {
    const joinCode = code || eventCode;

    setIsLoading(true);
    // Simulate API call
    try {
      const response = await api.post('/EventShareApi/ValidateShareToken', {
        shareToken: joinCode,
      });
      console.log('RESPONSE OF JOINT EVENT ', response.data);
      // if (response.data.statusCode !== 200) {
      //   Toast.show({
      //     type: 'error',
      //     text1: 'Error',
      //     text2: response.data.message,
      //     position: 'top',
      //     visibilityTime: 3000,
      //   });
      //   return;
      // }
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Joining event with code: ${joinCode}`,
        position: 'top',
        visibilityTime: 3000,
      });
      // Navigate to event screen here
      navigation.navigate('Main', {
        screen: 'MainTabs',
        params: {
          screen: 'AllPhotos',
        },
      });
    } catch (error) {
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
  };

  // QR Scanner View
  if (isScanning) {
    return (
      <View style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <TouchableOpacity
            onPress={() => setIsScanning(false)}
            style={styles.closeButton}
          >
            <ThemedText style={styles.closeText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.scannerTitle}>Scan QR Code</ThemedText>
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Join Event</ThemedText>
          <ThemedText style={styles.subtitle}>Enter code or scan QR</ThemedText>
        </View>

        {/* QR Scan Card */}
        <TouchableOpacity style={styles.scanCard} onPress={handleScanPress}>
          <View style={styles.qrIconContainer}>
            <ThemedText style={styles.qrIcon}>📷</ThemedText>
          </View>
          <ThemedText style={styles.scanText}>Tap to scan QR code</ThemedText>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <ThemedText style={styles.orText}>OR</ThemedText>
          <View style={styles.orLine} />
        </View>

        {/* Event Code Input */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>EVENT CODE</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. EVT2024"
            placeholderTextColor="#999"
            value={eventCode}
            onChangeText={setEventCode}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Join Button */}
        <CustomButton
          onPress={() => handleJoinEvent()}
          title={isLoading ? 'Joining...' : 'Join Event →'}
          loading={isLoading}
          type="primary"
          style={styles.joinButton}
          disabled={eventCode.trim().length < 3}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  scanCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
  },
  qrIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrIcon: {
    fontSize: 36,
  },
  scanText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
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
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  joinButton: {
    marginTop: 8,
  },
  // Scanner styles
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
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
    marginRight: 40,
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
