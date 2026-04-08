import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { getAllPhotos } from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { Photo } from '../../types/photo.types';
import PhotosGrid from './PhotoGrid';
import { generateMockPhotos } from '../../utils/helper';

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  //   const navigation = useNavigation();

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      // const response = await getAllPhotos(eventId);
      // setPhotos(response.data);
      const data = generateMockPhotos(150, 'ENY43423');
      setPhotos(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load photos',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [eventId]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const handlePhotoPress = (photo: Photo) => {
    if (!selectionMode) {
      navigation.navigate('PhotoDetail', { photo });
    } else {
      onPhotoSelect(photo.id);
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
