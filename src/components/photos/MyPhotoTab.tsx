// screens/FaceTabScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { ThemedText } from '../../components/common/ThemedText';
import CustomButton from '../../components/common/CustomButton';
import { useTheme } from '../../theme/ThemeContext';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { launchImageLibrary, PhotoQuality } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import CameraCapture from './CameraCapture';
import PhotosGrid from './PhotoGrid';
import { generateMockPhotos } from '../../utils/helper';

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  eventId: string;
  faceId?: string;
}

export const FaceTabScreen: React.FC<{
  navigation: any;
  eventId: string;
  selectionMode: boolean;
  selectedPhotos: string[];
  onPhotoSelect: (photoId: string) => void;
}> = ({
  navigation,
  eventId,
  selectionMode,
  selectedPhotos,
  onPhotoSelect,
}) => {
  const { colors } = useTheme();
  const [selfie, setSelfie] = useState<string | null>(null);
  const [isTakingSelfie, setIsTakingSelfie] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<Photo[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Handle taking live selfie
  const handleTakeSelfie = () => {
    setIsTakingSelfie(true);
  };

  // Handle uploading image from gallery
  const handleUploadImage = () => {
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
        setSelfie(response.assets[0].uri);
        Toast.show({
          type: 'success',
          text1: 'Image Uploaded',
          text2: 'Review your image below',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    });
  };

  // Handle retake/change selfie
  const handleRetake = () => {
    Alert.alert(
      'Change Selfie',
      'Would you like to take a new selfie or upload from gallery?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take New Selfie', onPress: () => setIsTakingSelfie(true) },
        { text: 'Upload from Gallery', onPress: handleUploadImage },
      ],
    );
  };

  // Find faces based on selfie
  const handleFindFaces = async () => {
    if (!selfie) {
      Toast.show({
        type: 'error',
        text1: 'No Selfie',
        text2: 'Please take or upload a selfie first',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to find faces
      // Replace with actual API call
      // const response = await api.post('/EventShareApi/FindFaces', {
      //   eventId: eventId,
      //   selfie: selfie, // Base64 or form data
      // });

      // Simulate API delay
      await new Promise(resolve =>
        setTimeout(() => {
          resolve(null);
        }, 2000),
      );

      // Mock response - replace with actual API response
      const mockPhotos: Photo[] = generateMockPhotos(100, eventId);

      setDetectedFaces(mockPhotos);
      setShowResults(true);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Found ${mockPhotos.length} photos with your face`,
        position: 'top',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Error finding faces:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to find photos. Please try again.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Pull reefresh handle
  const onRefresh = () => {
    setRefreshing(true);
    handleFindFaces();
  };

  // On photo select handle
  const handlePhotoPress = (photo: Photo) => {
    if (!selectionMode) {
      navigation.navigate('PhotoDetail', { photo });
    } else {
      onPhotoSelect(photo.id);
    }
  };

  // Back navigation from screen handle
  const onBackPress = () => {
    setIsLoading(false);
    setRefreshing(false);
    setShowResults(false);
  };

  // Render camera for selfie capture
  if (isTakingSelfie) {
    return (
      <CameraCapture setSelfie={setSelfie} setShowCamera={setIsTakingSelfie} />
    );
  }

  // Render results after finding faces
  if (showResults) {
    return (
      <View style={styles.container}>
        <View style={styles.resultsHeader}>
          <TouchableOpacity onPress={() => onBackPress()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.resultsTitle}>
            Found Photos({detectedFaces.length})
          </ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <PhotosGrid
          photos={detectedFaces}
          loading={isLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          selectionMode={selectionMode}
          selectedPhotos={selectedPhotos}
          onPhotoSelect={onPhotoSelect}
          onPhotoPress={handlePhotoPress}
        />
      </View>
    );
  }

  console.log('selfie url ', selfie);

  // Main UI - Selfie preview and action buttons
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>Find Your Photos</ThemedText>
        <ThemedText style={styles.subtitle}>
          Take a selfie and we'll find all your photos from the event
        </ThemedText>
      </View>

      {/* Selfie Preview or Capture Card */}
      {!selfie ? (
        <View style={styles.captureCard}>
          <View style={styles.placeholderContainer}>
            <MaterialIcons
              name="camera-alt"
              size={64}
              color={colors.textSecondary}
            />
            <ThemedText style={styles.placeholderText}>
              No selfie selected
            </ThemedText>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.captureButtonOption}
              onPress={handleTakeSelfie}
            >
              <MaterialIcons name="camera" size={24} color={colors.white} />
              <ThemedText style={styles.buttonOptionText}>
                Take Selfie
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButtonOption}
              onPress={handleUploadImage}
            >
              <MaterialIcons
                name="photo-library"
                size={24}
                color={colors.white}
              />
              <ThemedText style={styles.buttonOptionText}>
                Upload Photo
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewCard}>
          <Image
            source={{ uri: `file://${selfie}` }}
            style={styles.selfiePreview}
          />

          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <MaterialIcons name="refresh" size={20} color="#666666" />
              <ThemedText style={styles.retakeText}>Retake/Change</ThemedText>
            </TouchableOpacity>

            <View style={styles.previewBadge}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <ThemedText style={styles.previewBadgeText}>
                Selfie captured
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Find My Face Button */}
      <CustomButton
        onPress={handleFindFaces}
        title={isLoading ? 'Finding Faces...' : 'Find My Face'}
        rightIcon="search"
        loading={isLoading}
        type="primary"
        style={styles.findButton}
        disabled={!selfie || isLoading}
      />

      {/* Info Section */}
      <View style={styles.infoSection}>
        <MaterialIcons name="info-outline" size={20} color="#999999" />
        <ThemedText style={styles.infoText}>
          Your selfie will only be used to find your photos and won't be stored
          permanently
        </ThemedText>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 20,
  },
  captureCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  placeholderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  captureButtonOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  previewCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selfiePreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 16,
  },
  previewActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  retakeText: {
    fontSize: 14,
    color: '#666666',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewBadgeText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  findButton: {
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#999999',
    lineHeight: 18,
  },
  // Results styles
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  photoCard: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
});

export default FaceTabScreen;
