import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { Face } from '../../types/photo.types';
import Config from 'react-native-config';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../common/ThemedText';

interface PhotoCardProps {
  photo: Face;
  onPress: (photo: Face) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const FacePhotoCard: React.FC<PhotoCardProps> = ({ photo, onPress }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { colors } = useTheme();
  const photoUri = `${Config.PHOTO_URL}${photo.faceImagePath}`;

  return (
    <TouchableOpacity
      style={[styles.card]}
      onPress={() => {
        onPress(photo);
      }}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: photoUri }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        {imageError && (
          <View style={styles.errorContainer}>
            <MaterialIcon name="broken-image" size={40} color="#ccc" />
            <Text style={styles.errorText}>Failed to load</Text>
          </View>
        )}
      </View>
      <View style={styles.row}>
        <View style={[styles.chip]}>
          <MaterialIcon name="photo-library" size={18} color={colors.primary} />
          <ThemedText
            style={[styles.photoCount, { color: colors.primary }]}
            variant="body2"
            color="primary"
          >
            {photo.photoCount} photos
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  row: {
    paddingVertical: 4,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  photoCount: {
    textAlign: 'center',
  },
});

export default FacePhotoCard;
