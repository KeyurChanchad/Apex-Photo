// screens/PhotoGalleryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import photoService from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/common/ThemedText';
import AllPhotosTab from '../../components/photos/AllPhotosTab';
import MyPhotosTab from '../../components/photos/MyPhotoTab';
import FacesTab from '../../components/photos/Faces';
import { useTheme } from '../../theme/ThemeContext';

const Tab = createMaterialTopTabNavigator();

// Main Component with Top Tab Navigator
const PhotoGalleryScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { eventId, eventName } = route.params || {};
  const { colors } = useTheme();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  // const [currentTab, setCurrentTab] = useState('AllPhotos');

  useEffect(() => {
    if (route.params?.screen) {
      navigation.navigate(route.params.screen);
    }
  }, [navigation, route.params]);

  const handlePhotoSelect = (photoId: string) => {
    if (selectedPhotos.includes(photoId)) {
      setSelectedPhotos(selectedPhotos.filter(id => id !== photoId));
    } else {
      setSelectedPhotos([...selectedPhotos, photoId]);
    }
    console.log('selected photo ', selectedPhotos);
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
        await photoService.downloadPhoto(selectedPhotos[0], true);
        // Toast.show({
        //   type: 'success',
        //   text1: 'Download Started',
        //   text2: 'Photo is being downloaded',
        //   visibilityTime: 1000,
        // });
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
      console.error('Error to download multiple ', error);
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
      'Are you sure you want to download all photos from this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              await photoService.downloadAllPhotos(eventId);
              Toast.show({
                type: 'success',
                text1: 'Download Started',
                text2: 'All event photos are being downloaded',
              });
            } catch (error) {
              console.error('Error to download all ', error);
              Toast.show({
                type: 'error',
                text1: 'Download Failed',
                text2: 'Please try again',
              });
            }
          },
        },
      ],
    );
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPhotos([]);
  };

  const renderSelectionBar = () => (
    <View style={styles.selectionBar}>
      <TouchableOpacity
        onPress={exitSelectionMode}
        style={styles.selectionCancelButton}
      >
        <MaterialIcon name="close" size={24} color="#666" />
        <ThemedText style={styles.selectionCancelText}>Cancel</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.selectionCount}>
        {selectedPhotos.length} selected
      </ThemedText>
      <TouchableOpacity
        onPress={handleDownloadSelected}
        style={styles.selectionDownloadButton}
      >
        <MaterialIcon name="download" size={24} color="#1976d2" />
        <ThemedText style={styles.selectionDownloadText}>Download</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <ThemedText style={styles.title}>{eventName}</ThemedText>
        {!selectionMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleDownloadAll}
              style={styles.headerAction}
            >
              <MaterialIcon name="download" size={22} color="#1976d2" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectionMode(true)}
              style={styles.headerAction}
            >
              <MaterialIcon
                name="check-circle-outline"
                size={22}
                color="#1976d2"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      {selectionMode && renderSelectionBar()}

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: { backgroundColor: colors.primary },
          tabBarStyle: {
            elevation: 2,
            shadowOpacity: 0.1,
            backgroundColor: colors.backgroundSecondary,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
            textTransform: 'capitalize',
          },
          // tabBarItemStyle: { backgroundColor: 'red' },
          animationEnabled: true,
        }}
        screenListeners={{
          state: e => {
            const tabName =
              e.data.state?.routes[e.data.state.index]?.name || 'AllPhotos';
            // setCurrentTab(tabName);
          },
        }}
      >
        <Tab.Screen
          name="AllPhotos"
          options={{
            tabBarIcon: () => (
              <MaterialIcon
                name="photo-library"
                size={24}
                color={colors.text}
              />
            ),
          }}
        >
          {() => (
            <AllPhotosTab
              navigation={navigation}
              eventId={eventId}
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onPhotoSelect={handlePhotoSelect}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="Faces"
          options={{
            tabBarIcon: () => (
              <MaterialIcon name="people" size={24} color={colors.text} />
            ),
          }}
        >
          {() => (
            <FacesTab
              navigation={navigation}
              eventId={eventId}
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onPhotoSelect={handlePhotoSelect}
            />
          )}
        </Tab.Screen>
        <Tab.Screen
          name="MyPhotos"
          options={{
            tabBarIcon: () => (
              <MaterialIcon name="person" size={24} color={colors.text} />
            ),
          }}
        >
          {() => (
            <MyPhotosTab
              navigation={navigation}
              eventId={eventId}
              selectionMode={selectionMode}
              selectedPhotos={selectedPhotos}
              onPhotoSelect={handlePhotoSelect}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerAction: {
    padding: 4,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectionCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionCancelText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  selectionCount: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  selectionDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionDownloadText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default PhotoGalleryScreen;
