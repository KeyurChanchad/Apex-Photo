import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { getAllPhotos } from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { Photo } from '../../types/photo.types';
import PhotosGrid from './PhotoGrid';

const AllPhotosTab: React.FC<{
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
  console.log('eventId ', eventId);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  //   const navigation = useNavigation();

  const fetchPhotos = useCallback(async () => {
    try {
      setLoading(true);
      if (!eventId) return;
      const response = await getAllPhotos(eventId);
      console.log('Response of getall photos ', response);
      if (response.statusCode === 200) {
        setPhotos(response.data.photos);
      }
      // const data = generateMockPhotos(150, 'ENY43423');
      // setPhotos(data);
    } catch (error) {
      console.error('Error to fetch photos ', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load photos',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [fetchPhotos]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const handlePhotoPress = (photo: Photo) => {
    if (!selectionMode) {
      navigation.navigate('PhotoDetail', { photo });
    } else {
      onPhotoSelect(photo.eventPhotoId);
    }
  };

  return (
    <PhotosGrid
      photos={photos}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      selectionMode={selectionMode}
      selectedPhotos={selectedPhotos}
      onPhotoSelect={onPhotoSelect}
      onPhotoPress={handlePhotoPress}
    />
  );
};

export default AllPhotosTab;
