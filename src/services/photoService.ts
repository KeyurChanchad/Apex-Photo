import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import api from './api';
import Toast from 'react-native-toast-message';

// Function to request storage permission
export const requestStoragePermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const permission =
        Platform.Version >= 33
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
};

// Function to get user photos
export const getUserPhotos = async () => {
  return api.get('/photos');
};

// Function to get all photos by event ID
export const getAllPhotos = async (
  eventId: string,
  page = 1,
  pageSize = 20,
) => {
  console.log('Get all photos ', eventId, page, pageSize);
  const response = await api.get(
    `/PortfolioEventApi/EventGallery?eventId=${eventId}&page=${page}&pageSize=${pageSize}`,
  );
  return response;
};

// Function to get faces by event ID - returns face-wise photos and count
export const getFaces = async (eventId: string, page = 1, pageSize = 20) => {
  const response = await api.get(
    `/PortfolioEventApi/EventFaces?eventId=${eventId}&page=${page}&pageSize=${pageSize}`,
  );
  return response;
};

// Function to get my photos by event ID
export const getMyPhotos = async (
  eventId: string,
  faceId: string,
  page = 1,
  pageSize = 20,
) => {
  const response = await api.get(
    `/PortfolioEventApi/FacePhotos?eventId=${eventId}&faceId=${faceId}&page=${page}&pageSize=${pageSize}`,
  );
  return response;
};

// Function to upload photo
export const uploadPhoto = async (formData: FormData) => {
  return api.post('/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Function to download a single photo
export const downloadPhoto = async (photoId: string) => {
  const hasPermission = await requestStoragePermission();
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
    const downloadDest = `${
      RNFS.PicturesDirectoryPath
    }/event_photo_${photoId}_${Date.now()}.jpg`;

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
};

// Function to download multiple photos
export const downloadMultiplePhotos = async (photoIds: string[]) => {
  const hasPermission = await requestStoragePermission();
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
    console.log('responseo of downlod mul ', response);

    Toast.show({
      type: 'success',
      text1: 'Download Started',
      text2: `${photoIds.length} photos are being downloaded`,
    });
  } catch (error) {
    console.error('Multiple download error:', error);
    throw error;
  }
};

// Function to download all photos
export const downloadAllPhotos = async () => {
  const hasPermission = await requestStoragePermission();
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
    console.log('responseo of downlod all ', response);

    Toast.show({
      type: 'success',
      text1: 'Download Started',
      text2: 'All photos are being downloaded',
    });
  } catch (error) {
    console.error('Download all error:', error);
    throw error;
  }
};

// Function to delete a photo
export const deletePhoto = async (photoId: string) => {
  return api.delete(`/photos/${photoId}`);
};

// Export all functions as a single object (optional)
const photoService = {
  requestStoragePermission,
  getUserPhotos,
  getAllPhotos,
  getFaces,
  getMyPhotos,
  uploadPhoto,
  downloadPhoto,
  downloadMultiplePhotos,
  downloadAllPhotos,
  deletePhoto,
};

export default photoService;
