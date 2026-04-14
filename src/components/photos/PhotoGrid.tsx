import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Photo } from '../../types/photo.types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ThemedText } from '../common/ThemedText';
import PhotoCard from './PhotoCard';

const PhotosGrid: React.FC<{
  photos: Photo[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  selectionMode: boolean;
  selectedPhotos: string[];
  onPhotoSelect: (photoId: string) => void;
  onPhotoPress: (photo: Photo) => void;
}> = ({
  photos,
  loading,
  refreshing,
  onRefresh,
  selectionMode,
  selectedPhotos,
  onPhotoSelect,
  onPhotoPress,
}) => {
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (photos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={80} color="#ccc" />
        <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      renderItem={({ item }) => (
        <PhotoCard
          photo={item}
          selected={selectedPhotos.includes(item.eventPhotoId)}
          onSelect={() => onPhotoSelect(item.eventPhotoId)}
          selectionMode={selectionMode}
          onPress={() => onPhotoPress(item)}
        />
      )}
      keyExtractor={item => item.eventPhotoId}
      numColumns={2}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.gridContainer}
    />
  );
};

export default PhotosGrid;

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    color: '#666',
  },
  gridContainer: {
    padding: 8,
  },
});
