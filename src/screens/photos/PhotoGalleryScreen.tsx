import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import PhotoCard from '../../components/photos/PhotoCard';
import CustomButton from '../../components/common/CustomButton';
import photoService from '../../services/photoService';
import { Photo } from '../../types/photo.types';
import Toast from 'react-native-toast-message';

const PhotoGalleryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [])
  );

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoService.getUserPhotos();
      setPhotos(response.data);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhotos();
  };

  const handlePhotoSelect = (photoId: string) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedPhotos.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Selection',
        text2: 'Please select photos to download',
      });
      return;
    }

    try {
      if (selectedPhotos.length === 1) {
        await photoService.downloadPhoto(selectedPhotos[0]);
        Toast.show({
          type: 'success',
          text1: 'Download Started',
          text2: 'Photo is being downloaded',
        });
      } else {
        await photoService.downloadMultiplePhotos(selectedPhotos);
        Toast.show({
          type: 'success',
          text1: 'Download Started',
          text2: `${selectedPhotos.length} photos are being downloaded`,
        });
      }
      setSelectionMode(false);
      setSelectedPhotos([]);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Please try again',
      });
    }
  };

  const handleDownloadAll = async () => {
    Alert.alert(
      'Download All Photos',
      'Are you sure you want to download all photos?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              await photoService.downloadAllPhotos();
              Toast.show({
                type: 'success',
                text1: 'Download Started',
                text2: 'All photos are being downloaded',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Download Failed',
                text2: 'Please try again',
              });
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Event Photos</Text>
      <Text style={styles.count}>{photos.length} photos</Text>
    </View>
  );

  const renderActions = () => {
    if (selectionMode) {
      return (
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={() => {
              setSelectionMode(false);
              setSelectedPhotos([]);
            }}
            style={styles.cancelButton}
          >
            <MaterialIcon name="close" size={24} color="#666" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectedCount}>
            {selectedPhotos.length} selected
          </Text>
          <TouchableOpacity
            onPress={handleDownloadSelected}
            style={styles.downloadButton}
          >
            <MaterialIcon name="download" size={24} color="#1976d2" />
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDownloadAll}
        >
          <MaterialIcon name="download" size={20} color="#1976d2" />
          <Text style={styles.actionButtonText}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setSelectionMode(true)}
        >
          <MaterialIcon name="check-circle" size={20} color="#1976d2" />
          <Text style={styles.actionButtonText}>Select</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.uploadButton]}
          onPress={() => navigation.navigate('UploadPhoto')}
        >
          <MaterialIcon name="add-photo-alternate" size={20} color="#fff" />
          <Text style={[styles.actionButtonText, styles.uploadButtonText]}>
            Upload
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderActions()}
      
      {photos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcon name="photo-library" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No photos yet</Text>
          <CustomButton
            title="Upload Your First Photo"
            onPress={() => navigation.navigate('UploadPhoto')}
            style={styles.uploadButtonLarge}
          />
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={({ item }) => (
            <PhotoCard
              photo={item}
              selected={selectedPhotos.includes(item.id)}
              onSelect={() => handlePhotoSelect(item.id)}
              selectionMode={selectionMode}
              onPress={() => {
                if (!selectionMode) {
                  navigation.navigate('PhotoDetail', { photo: item });
                } else {
                  handlePhotoSelect(item.id);
                }
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.gridContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  count: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  uploadButton: {
    backgroundColor: '#1976d2',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  uploadButtonText: {
    color: '#fff',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  selectedCount: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
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
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  uploadButtonLarge: {
    minWidth: 200,
  },
  gridContainer: {
    padding: 8,
  },
});

export default PhotoGalleryScreen;