import { useCallback, useEffect, useState } from 'react';
import { getFaces, getMyPhotos } from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';
import { Face, Photo } from '../../types/photo.types';
import FacePhotosGrid from './FacePhotosGrid';
import PhotosGrid from './PhotoGrid';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { PhotoViewer } from './PhotoPreview';

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
  const { colors } = useTheme();
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    photoId: string | null;
    photoUrl: string | null;
  } | null>(null);
  const [totalPhotos, setTotalPhotos] = useState(0);

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
            setFaces(response.data.faces);
          } else {
            setFaces(prev => [...prev, ...response.data.faces]);
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
        console.log('response of get photos by face ', response);

        if (response.statusCode === 200) {
          if (isRefresh) {
            setPhotos(response.data.photos);
          } else {
            setPhotos(prev => [...prev, ...response.data.photos]);
          }
          setHasNext(response.data.hasMore);
          setTotalPhotos(response.data.totalRecords);
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

  const openPhotoPreview = (photo: { photoId: string; photoUrl: string }) => {
    console.log('Opening photo viewer with:', photo);
    setSelectedPhoto(photo);
    setShowPreview(true);
  };

  const handlePhotoPress = (photo: Photo) => {
    if (!selectionMode) {
      console.log('click on photo ', photo);
      openPhotoPreview({
        photoId: photo.eventPhotoId,
        photoUrl: photo.fileUrl,
      });
    } else {
      onPhotoSelect(photo.eventPhotoId);
    }
  };

  return (
    <>
      {selectedFaceId ? (
        <View style={styles.container}>
          <View
            style={[styles.headerContainer, { borderColor: colors.border }]}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => setSelectedFaceId(null)}
                style={styles.backButton}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={24}
                  color={colors.text}
                />
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <ThemedText style={styles.title}>Match Found</ThemedText>
                <View style={styles.statsContainer}>
                  <ThemedText
                    style={[
                      styles.totalPhotos,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {totalPhotos} Total Photos
                  </ThemedText>
                  <View style={styles.successIcon}>
                    <MaterialIcons
                      name="check-circle"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
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
          {/* Photo Viewer Overlay - Make sure it's at the end of your component */}
          {showPreview && (
            <PhotoViewer
              visible={showPreview}
              photoId={selectedPhoto?.photoId}
              photoUrl={selectedPhoto?.photoUrl}
              onClose={() => {
                setShowPreview(false);
                setSelectedPhoto(null);
              }}
            />
          )}
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalPhotos: {
    fontSize: 14,
  },
  successIcon: {
    marginLeft: 4,
  },
});
