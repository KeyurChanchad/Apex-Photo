import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Share,
  Modal,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import RNFS from 'react-native-fs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Config from 'react-native-config';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  PhotoViewer: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PhotoViewerProps {
  visible: boolean;
  onClose: () => void;
  photoId?: string | null;
  photoUrl?: string | null;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  onClose,
  photoId,
  photoUrl,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [modalVisible, setModalVisible] = useState(visible);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Sync modal visibility with prop
  useEffect(() => {
    setModalVisible(visible);
    if (visible) {
      // Reset states when opening
      setImageLoading(true);
      setImageError(false);
      setLoading(false);
      setDownloadProgress(0);
    }
  }, [visible]);

  const photoUri = photoUrl ? `${Config.PHOTO_URL}${photoUrl}` : '';

  const handleDownload = useCallback(async () => {
    if (!photoId || !photoUri) {
      Alert.alert('Error', 'Photo information is missing');
      return;
    }

    try {
      setLoading(true);
      setDownloadProgress(0);

      const filePath = `${RNFS.DocumentDirectoryPath}/${photoId}.jpg`;

      const download = RNFS.downloadFile({
        fromUrl: photoUri,
        toFile: filePath,
        progress: res => {
          const progressPercent = (res.bytesWritten / res.contentLength) * 100;
          setDownloadProgress(progressPercent);
        },
      });

      const result = await download.promise;
      console.log(result, filePath, photoUri);

      if (result.statusCode === 200) {
        Alert.alert(
          'Download Complete',
          'Photo saved successfully to your device',
          [{ text: 'OK', onPress: () => {} }],
        );
      } else {
        throw new Error('Download failed');
      }
      setLoading(false);
      setDownloadProgress(0);
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Failed to download image');
      setLoading(false);
      setDownloadProgress(0);
    }
  }, [photoId, photoUri]);

  const handleShare = useCallback(async () => {
    if (!photoUri) {
      Alert.alert('Error', 'Photo URL is missing');
      return;
    }

    try {
      await Share.share({
        url: photoUri,
        title: 'Share Photo',
        message: 'Check out this photo',
      });
    } catch (error) {
      console.log('Share error:', error);
      Alert.alert('Error', 'Failed to share photo');
    }
  }, [photoUri]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  }, [navigation, onClose]);

  const handleRetry = useCallback(() => {
    setImageError(false);
    setImageLoading(true);
  }, []);

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <StatusBar hidden={modalVisible} />
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header with Close Button */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Photo Viewer</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Image Container */}
          <View style={styles.imageContainer}>
            {imageLoading && !imageError && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}

            {!imageError ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.image}
                resizeMode="contain"
                onLoadStart={() => {
                  setImageLoading(true);
                  setImageError(false);
                }}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                  Alert.alert('Error', 'Failed to load image');
                }}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load image</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Download Progress Overlay */}
          {loading && (
            <View style={styles.progressOverlay}>
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.progressText}>
                  Downloading... {Math.round(downloadProgress)}%
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${downloadProgress}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Bottom Glass Bar */}
          <View style={styles.bottomContainer}>
            <View style={styles.blur}>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleDownload}
                  disabled={loading || imageError}
                >
                  <Text style={styles.buttonText}>Download</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (loading || imageError) && styles.buttonDisabled,
                  ]}
                  onPress={handleShare}
                  disabled={loading || imageError}
                >
                  <Text style={styles.buttonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'contain',
  },
  imageLoadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  blur: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  progressContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    width: width * 0.8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressText: {
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 10,
    fontSize: 14,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
});
