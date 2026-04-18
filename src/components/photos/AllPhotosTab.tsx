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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const fetchPhotos = useCallback(
    async (page: number, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        if (!eventId) return;
        const response = await getAllPhotos(eventId, page);
        console.log('Response of getall photos ', response);

        if (response.statusCode === 200) {
          if (isRefresh) {
            setPhotos(response.data.photos);
          } else {
            setPhotos(prev => [...prev, ...response.data.photos]);
          }
          setHasNext(response.data.hasMore);
        }
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
        setInitialLoading(false);
      }
    },
    [eventId],
  );

  // Load more function
  const fetchNextPage = useCallback(() => {
    if (!loading && !refreshing && hasNext) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      fetchPhotos(nextPage, false);
    }
  }, [loading, refreshing, hasNext, pageNo, fetchPhotos]);

  // Refresh function
  const onRefresh = useCallback(() => {
    setPageNo(1);
    fetchPhotos(1, true);
  }, [fetchPhotos]);

  // Initial load and page change
  useFocusEffect(
    useCallback(() => {
      // Reset everything when tab comes into focus
      setInitialLoading(true);
      setPhotos([]);
      setPageNo(1);
      setHasNext(false);
      fetchPhotos(1, true);

      return () => {
        // Optional: cleanup if needed
      };
    }, [fetchPhotos]), // Re-run when eventId changes
  );

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
      initialLoading={initialLoading}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      selectionMode={selectionMode}
      selectedPhotos={selectedPhotos}
      onPhotoSelect={onPhotoSelect}
      onPhotoPress={handlePhotoPress}
      fetchNextPage={fetchNextPage}
      hasNext={hasNext}
    />
  );
};

export default AllPhotosTab;
