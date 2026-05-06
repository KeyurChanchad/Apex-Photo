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
import { Photo } from '../../types/photo.types';
import Config from 'react-native-config';
import { useTheme } from '../../theme/ThemeContext';

interface PhotoCardProps {
  photo: Photo;
  selected: boolean;
  onSelect: () => void;
  selectionMode: boolean;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2;

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  selected,
  onSelect,
  selectionMode,
  onPress,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { colors } = useTheme();
  const photoUri = `${Config.PHOTO_URL}${photo.fileUrl}`;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selectedCard,
        selected && { borderColor: colors.primary },
      ]}
      onPress={onPress}
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

      {selectionMode && (
        <TouchableOpacity style={styles.checkbox} onPress={onSelect}>
          <MaterialIcon
            name={selected ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={selected ? colors.primary : '#fff'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 2,
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
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
    zIndex: 2,
  },
});

export default PhotoCard;
