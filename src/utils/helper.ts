import api from '../services/api';
import { EventStatusType } from '../types/common.types';
import { Photo } from '../types/photo.types';
import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';

const decodeQRCodeFromImage = async (
  imageUri: string,
): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'qr-image.jpg',
  });

  const response = await api.post('/decode-qr', { formData });

  return response.data.qrCodeValue;
};

// Helper function to generate mock photos
const generateMockPhotos = (count: number): Photo[] => {
  const photos: Photo[] = [];

  for (let i = 1; i <= count; i++) {
    photos.push({
      eventPhotoId: `photo_${i}_${Date.now()}`,
      fileUrl: `https://picsum.photos/id/${i + 100}/800/600`,
      thumbnailUrl: `https://picsum.photos/id/${i + 100}/200/150`,
    });
  }

  return photos;
};

const copyToClipboard = (text: string) => {
  Clipboard.setString(text);
};

const getStatusName = (code: EventStatusType) => {
  switch (code) {
    case 1:
      return 'ACTIVE';
    case 2:
      return 'CLOSED';
    case 3:
      return 'UPCOMING';
    default:
      break;
  }
};

// Helper function to convert file to base64
const convertToBase64 = async (filePath: string): Promise<string> => {
  try {
    // Read the file as base64
    const base64String = await RNFS.readFile(filePath, 'base64');

    // Get file extension to determine MIME type
    const extension = filePath.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';

    // Return complete data URL
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting to base64:', error);
    throw error;
  }
};

// Helper function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export {
  decodeQRCodeFromImage,
  generateMockPhotos,
  copyToClipboard,
  getStatusName,
  convertToBase64,
  arrayBufferToBase64,
};
