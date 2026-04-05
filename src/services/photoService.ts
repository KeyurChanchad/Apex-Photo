import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import api from './api';
import Toast from 'react-native-toast-message';

class PhotoService {
  async requestStoragePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33 
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES 
          : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
        
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      } catch (err) {
        console.error('Storage permission error:', err);
        return false;
      }
    }
    return true;
  }

  async getUserPhotos() {
    return api.get('/photos');
  }

  async uploadPhoto(formData: FormData) {
    return api.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async downloadPhoto(photoId: string) {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Cannot download without storage permission',
      });
      return;
    }

    try {
      const response = await api.get(`/photos/download/${photoId}`, {
        responseType: 'blob',
      });
      
      // Save to Pictures directory for images
      const downloadDest = `${RNFS.PicturesDirectoryPath}/event_photo_${photoId}_${Date.now()}.jpg`;
      
      const options = {
        fromUrl: response.config.url!,
        toFile: downloadDest,
      };
      
      await RNFS.downloadFile(options).promise;
      
      Toast.show({
        type: 'success',
        text1: 'Download Complete',
        text2: `Photo saved to Pictures folder`,
      });
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  async downloadMultiplePhotos(photoIds: string[]) {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Cannot download without storage permission',
      });
      return;
    }

    try {
      const response = await api.post('/photos/download-multiple', { photoIds });
      Toast.show({
        type: 'success',
        text1: 'Download Started',
        text2: `${photoIds.length} photos are being downloaded`,
      });
    } catch (error) {
      console.error('Multiple download error:', error);
      throw error;
    }
  }

  async downloadAllPhotos() {
    const hasPermission = await this.requestStoragePermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Cannot download without storage permission',
      });
      return;
    }

    try {
      const response = await api.get('/photos/download-all');
      Toast.show({
        type: 'success',
        text1: 'Download Started',
        text2: 'All photos are being downloaded',
      });
    } catch (error) {
      console.error('Download all error:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: string) {
    return api.delete(`/photos/${photoId}`);
  }
}

export default new PhotoService();