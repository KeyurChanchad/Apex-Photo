import { useCallback, useEffect, useState } from 'react';
import { getFaces, getMyPhotos } from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { Face, Photo } from '../../types/photo.types';
import FacePhotosGrid from './FacePhotosGrid';
import PhotosGrid from './PhotoGrid';

const FacesTab: React.FC<{
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
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const fetchFaces = useCallback(
    async (page: number, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        if (!eventId) return;
        const response = await getFaces(eventId, page);
        console.log('response of get faces ', response);

        if (response.statusCode === 200) {
          if (isRefresh) {
            setFaces(response.data);
          } else {
            setFaces(prev => [...prev, ...response.data]);
          }
          setHasNext(response.data.hasMore);
        }
      } catch (error) {
        console.error('Error to get faces in event ', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load faces',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [eventId],
  );

  const fetchPhotos = useCallback(
    async (page: number, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        if (!eventId || !selectedFaceId) return;
        const response = await getMyPhotos(eventId, selectedFaceId, page);
        console.log('response of get faces ', response);

        if (response.statusCode === 200) {
          if (isRefresh) {
            setPhotos(response.data);
          } else {
            setPhotos(prev => [...prev, ...response.data]);
          }
          setHasNext(response.data.hasMore);
        }
      } catch (error) {
        console.error('Error to get faces in event ', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load faces',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [eventId, selectedFaceId],
  );

  // Initial load and page change
  useFocusEffect(
    useCallback(() => {
      // Reset everything when tab comes into focus
      setInitialLoading(true);
      setFaces([]);
      setPageNo(1);
      setHasNext(false);
      fetchFaces(1, true);

      return () => {
        // Optional: cleanup if needed
      };
    }, [fetchFaces]), // Re-run when eventId changes
  );

  //
  useEffect(() => {
    if (!selectedFaceId) return;
    // Reset everything when tab comes into focus
    setInitialLoading(true);
    setPhotos([]);
    setPageNo(1);
    setHasNext(false);
    fetchPhotos(1, true);
    return () => {
      // Optional: cleanup if needed
    };
  }, [selectedFaceId, fetchPhotos]);

  // Load more function
  const fetchNextPage = useCallback(() => {
    if (!loading && !refreshing && hasNext) {
      const nextPage = pageNo + 1;
      setPageNo(nextPage);
      fetchFaces(nextPage, false);
    }
  }, [loading, refreshing, hasNext, pageNo, fetchFaces]);

  // Refresh function
  const onRefresh = useCallback(() => {
    setPageNo(1);
    fetchFaces(1, true);
  }, [fetchFaces]);

  const handleFacePress = useCallback((photo: Face) => {
    if (!photo.eventUniqueFaceId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Face id not found.',
      });
      return;
    }
    setSelectedFaceId(photo.eventUniqueFaceId);
  }, []);

  const handlePhotoPress = (photo: Photo) => {
    if (!selectionMode) {
      navigation.navigate('PhotoDetail', { photo });
    } else {
      onPhotoSelect(photo.eventPhotoId);
    }
  };

  return (
    <>
      {selectedFaceId ? (
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
      ) : (
        <FacePhotosGrid
          faces={faces}
          initialLoading={initialLoading}
          loading={loading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          handleFacePress={handleFacePress}
          fetchNextPage={fetchNextPage}
          hasNext={hasNext}
        />
      )}
    </>
  );
};

export default FacesTab;
