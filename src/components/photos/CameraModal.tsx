import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { usePermission } from '../../hooks/usePermission';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onPhotoCapture: (photoUri: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({
  visible,
  onClose,
  onPhotoCapture,
}) => {
  const [cameraPosition, setCameraPosition] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<Camera>(null);
  
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { hasPermission: hasStoragePermission, requestPermission: requestStoragePermission } = usePermission('storage');

  useEffect(() => {
    if (visible) {
      initializeCamera();
    }
  }, [visible]);

  const initializeCamera = async () => {
    if (!hasPermission) {
      const permission = await requestPermission();
      if (!permission) {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is needed to take photos',
          [
            { text: 'Cancel', style: 'cancel', onPress: onClose },
            { text: 'Grant Permission', onPress: initializeCamera },
          ]
        );
      }
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current && device) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: flash === 'on' ? 'on' : 'off',
        });
        onPhotoCapture(`file://${photo.path}`);
        onClose();
      } catch (error) {
        console.error('Failed to take photo:', error);
        Alert.alert('Error', 'Failed to capture photo');
      }
    }
  };

  const toggleCameraPosition = () => {
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(prev => (prev === 'off' ? 'on' : 'off'));
  };

  if (!device) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centerContainer}>
          <MaterialIcon name="warning" size={60} color="#fff" />
          <Text style={styles.errorText}>No camera device available</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  if (!hasPermission) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.centerContainer}>
          <MaterialIcon name="lock" size={60} color="#fff" />
          <Text style={styles.errorText}>Camera permission denied</Text>
          <TouchableOpacity onPress={initializeCamera} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Camera
          ref={cameraRef}
          style={styles.camera}
          device={device}
          isActive={visible}
          photo={true}
        />
        
        <View style={styles.controls}>
          <TouchableOpacity onPress={onClose} style={styles.controlButton}>
            <MaterialIcon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleCameraPosition} style={styles.controlButton}>
            <MaterialIcon name="flip-camera-ios" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={toggleFlash} style={styles.flashButton}>
          <MaterialIcon
            name={flash === 'on' ? 'flash-on' : 'flash-off'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  controlButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  flashButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1976d2',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraModal;