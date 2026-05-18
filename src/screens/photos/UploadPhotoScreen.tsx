import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import CustomButton from '../../components/common/CustomButton';
import CameraModal from '../../components/photos/CameraModal';
import photoService from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { ThemedText } from '../../components/common/ThemedText';

const UploadPhotoScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const openGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets[0]) {
          setSelectedImage(response.assets[0].uri || null);
        }
      },
    );
  };

  const handlePhotoCapture = (photoUri: string) => {
    setSelectedImage(photoUri);
  };

  const uploadPhoto = async () => {
    if (!selectedImage) {
      Toast.show({
        type: 'info',
        text1: 'No Photo Selected',
        text2: 'Please select or take a photo first',
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      await photoService.uploadPhoto(formData);
      Toast.show({
        type: 'success',
        text1: 'Upload Successful',
        text2: 'Your photo has been uploaded',
      });
      navigation.goBack();
    } catch (error: unknown) {
      console.error('Error to upload photo ', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Please try again',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Upload Photo</ThemedText>
        <ThemedText style={styles.subtitle}>
          Choose from gallery or take a selfie
        </ThemedText>
      </View>

      <View style={styles.imageContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContainer}>
            <MaterialIcon name="photo-camera" size={80} color="#ccc" />
            <ThemedText style={styles.placeholderText}>
              No photo selected
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.galleryButton} onPress={openGallery}>
          <MaterialIcon name="photo-library" size={24} color="#1976d2" />
          <ThemedText style={styles.galleryButtonText}>
            Choose from Gallery
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => setShowCamera(true)}
        >
          <MaterialIcon name="camera-alt" size={24} color="#fff" />
          <ThemedText style={styles.cameraButtonText}>Take Selfie</ThemedText>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.actionContainer}>
          <CustomButton
            title="Upload Photo"
            onPress={uploadPhoto}
            loading={uploading}
            disabled={uploading}
          />
          <CustomButton
            title="Cancel"
            onPress={() => setSelectedImage(null)}
            type="secondary"
            style={styles.cancelButton}
          />
        </View>
      )}

      <CameraModal
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onPhotoCapture={handlePhotoCapture}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 300,
  },
  previewImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  placeholderContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  placeholderText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  galleryButtonText: {
    color: '#1976d2',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  actionContainer: {
    padding: 20,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default UploadPhotoScreen;
