import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Face } from '../../types/photo.types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { ThemedText } from '../common/ThemedText';
import { useTheme } from '../../theme/ThemeContext';
import FacePhotoCard from './FacePhotoCard';
import { FlashList } from '@shopify/flash-list';

const FacePhotosGrid: React.FC<{
  faces: Face[];
  initialLoading: boolean;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  handleFacePress: (photo: Face) => void;
  fetchNextPage: () => void;
  hasNext: boolean;
}> = ({
  faces,
  initialLoading,
  loading,
  refreshing,
  onRefresh,
  handleFacePress,
  hasNext,
  fetchNextPage,
}) => {
  const { colors } = useTheme();

  const handleEndReached = useCallback(async () => {
    if (hasNext && !loading) {
      fetchNextPage();
    }
  }, [hasNext, loading, fetchNextPage]);

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (faces.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="photo-library" size={80} color="#ccc" />
        <ThemedText style={styles.emptyText}>No photos yet</ThemedText>
      </View>
    );
  }

  return (
    <FlashList
      data={faces}
      renderItem={({ item }) => (
        <FacePhotoCard
          key={item.personUniqueId}
          photo={item}
          onPress={() => handleFacePress(item)}
        />
      )}
      keyExtractor={item => item.personUniqueId}
      numColumns={2}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={styles.gridContainer}
      onEndReachedThreshold={0.2}
      onEndReached={handleEndReached}
      ListFooterComponent={
        loading ? (
          <ActivityIndicator
            color={colors.primary}
            size="large"
            style={{ marginBottom: 20 }}
          />
        ) : null
      }
    />
  );
};

export default FacePhotosGrid;

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
