import React, { useRef, useState } from 'react';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../common/ThemedText';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import CustomButton from '../common/CustomButton';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';

const CameraCapture: React.FC<{
  setSelfie: React.Dispatch<React.SetStateAction<string | null>>;
  setShowCamera: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setSelfie, setShowCamera }) => {
  const device = useCameraDevice('front');
  const cameraRef = useRef<Camera>(null);
  const { colors } = useTheme();
  const navigation = useNavigation();

  const captureSelfie = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });
        setSelfie(photo.path);
        setShowCamera(false);
        Toast.show({
          type: 'success',
          text1: 'Selfie Captured',
          text2: 'Review your selfie below',
          position: 'top',
          visibilityTime: 2000,
        });
      } catch (error) {
        console.error('Failed to capture selfie:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to capture selfie',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    }
  };

  return (
    <View style={styles.cameraContainer}>
      <View style={styles.cameraHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <ThemedText style={styles.cameraTitle}>Take a Selfie</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {device ? (
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
      ) : (
        <View style={styles.noCameraView}>
          <ThemedText style={styles.noCameraText}>
            No front camera available
          </ThemedText>
          <CustomButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            type="primary"
          />
        </View>
      )}

      <View style={styles.cameraOverlay}>
        <View style={styles.faceFrame} />
        <ThemedText style={styles.faceInstruction}>
          Position your face within the circle
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.captureButton} onPress={captureSelfie}>
        <View style={styles.captureInnerCircle} />
      </TouchableOpacity>
    </View>
  );
};

export default CameraCapture;

// Camera styles
const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  faceInstruction: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
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
