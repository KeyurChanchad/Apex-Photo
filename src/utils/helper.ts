import api from '../services/api';
import { EventStatusType } from '../types/common.types';
import { Photo } from '../types/photo.types';
import Clipboard from '@react-native-clipboard/clipboard';

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
const generateMockPhotos = (count: number, eventId: string): Photo[] => {
  const photos: Photo[] = [];
  const faceIds = ['face_001', 'face_002', 'face_003', 'face_004', 'face_005'];

  for (let i = 1; i <= count; i++) {
    const hasFaceId = Math.random() > 0.3; // 70% have faceId

    photos.push({
      id: `photo_${i}_${Date.now()}`,
      url: `https://picsum.photos/id/${i + 100}/800/600`,
      thumbnailUrl: `https://picsum.photos/id/${i + 100}/200/150`,
      createdAt: new Date(Date.now() - i * 60000).toISOString(), // Each photo 1 minute apart
      eventId: eventId,
      faceId: hasFaceId
        ? faceIds[Math.floor(Math.random() * faceIds.length)]
        : undefined,
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

export {
  decodeQRCodeFromImage,
  generateMockPhotos,
  copyToClipboard,
  getStatusName,
};
