import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import { Photo } from '../../types/photo.types';
import photoService from '../../services/photoService';
import Toast from 'react-native-toast-message';
import CustomButton from '../../components/common/CustomButton';
import { MaterialTopTabScreenProps } from '@react-navigation/material-top-tabs';
import { MainTabParamList } from '../../navigation/types';

type Props = MaterialTopTabScreenProps<MainTabParamList, 'PhotoDetail'>;

const PhotoDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { photo } = route.params;
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await photoService.downloadPhoto(photo.id);
      Toast.show({
        type: 'success',
        text1: 'Download Started',
        text2: 'Photo is being downloaded',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this photo from ${photo.eventName || 'my event'}!`,
        url: photo.url,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Please try again',
      });
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await photoService.deletePhoto(photo.id);
            Toast.show({
              type: 'success',
              text1: 'Deleted',
              text2: 'Photo has been deleted',
            });
            navigation.goBack();
          } catch (error) {
            Toast.show({
              type: 'error',
              text1: 'Delete Failed',
              text2: 'Please try again',
            });
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {imageLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
          </View>
        )}
        <Image
          source={{ uri: photo.url }}
          style={styles.image}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Photo Information</Text>

        <View style={styles.infoRow}>
          <MaterialIcon name="event" size={20} color="#666" />
          <Text style={styles.infoLabel}>Event:</Text>
          <Text style={styles.infoValue}>{photo.eventName || 'General'}</Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcon name="calendar-today" size={20} color="#666" />
          <Text style={styles.infoLabel}>Uploaded:</Text>
          <Text style={styles.infoValue}>
            {new Date(photo.uploadedAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcon name="info" size={20} color="#666" />
          <Text style={styles.infoLabel}>File Size:</Text>
          <Text style={styles.infoValue}>
            {(photo.fileSize / 1024).toFixed(2)} KB
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcon name="crop" size={20} color="#666" />
          <Text style={styles.infoLabel}>Dimensions:</Text>
          <Text style={styles.infoValue}>
            {photo.width} x {photo.height}
          </Text>
        </View>

        {photo.tags && photo.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Tags:</Text>
            <View style={styles.tagsList}>
              {photo.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionContainer}>
        <CustomButton
          title="Download"
          onPress={handleDownload}
          loading={loading}
          disabled={loading}
          style={styles.actionButton}
        />

        <CustomButton
          title="Share"
          onPress={handleShare}
          type="secondary"
          style={styles.actionButton}
        />

        <CustomButton
          title="Delete"
          onPress={handleDelete}
          type="danger"
          style={styles.actionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
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
  infoContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  tagsContainer: {
    marginTop: 12,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#1976d2',
    fontSize: 12,
  },
  actionContainer: {
    padding: 16,
    marginBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default PhotoDetailScreen;
