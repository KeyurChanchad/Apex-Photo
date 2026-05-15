// screens/PhotoGalleryScreen.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import MaterialIcon from '@react-native-vector-icons/material-icons';
import photoService from '../../services/photoService';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/common/ThemedText';
import AllPhotosTab from '../../components/photos/AllPhotosTab';
import MyPhotosTab from '../../components/photos/MyPhotoTab';
import FacesTab from '../../components/photos/Faces';
import { useTheme } from '../../theme/ThemeContext';

// Tab configuration
const TABS: { key: string; label: string; icon: string }[] = [
  {
    key: 'AllPhotos',
    label: 'All Photos',
    icon: 'photo-library',
  },
  {
    key: 'Faces',
    label: 'Faces',
    icon: 'people',
  },
  {
    key: 'MyPhotos',
    label: 'My Photos',
    icon: 'person',
  },
];

const PhotoGalleryScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { eventId, eventName, selectedTab } = route.params || {};
  const { colors } = useTheme();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(selectedTab ?? 'AllPhotos');
  const scrollViewRef = useRef<ScrollView>(null);
  const tabRefs = useRef<{ [key: string]: View | null }>({});

  useEffect(() => {
    if (route.params?.screen) {
      navigation.navigate(route.params.screen);
    }
  }, [navigation, route.params]);

  const handlePhotoSelect = useCallback(
    (photoId: string) => {
      if (selectedPhotos.includes(photoId)) {
        setSelectedPhotos(prev => prev.filter(id => id !== photoId));
      } else {
        setSelectedPhotos(prev => [...prev, photoId]);
      }
    },
    [selectedPhotos],
  );

  const handleDownloadSelected = useCallback(async () => {
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
  }, [selectedPhotos]);

  const handleDownloadAll = useCallback(async () => {
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
  }, [eventId]);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedPhotos([]);
  }, []);

  const handleTabPress = useCallback((tabKey: string) => {
    setActiveTab(tabKey);
    // Optional: Scroll the selected tab into view
    if (scrollViewRef.current && tabRefs.current[tabKey]) {
      tabRefs.current[tabKey]?.measureLayout(
        scrollViewRef.current as any,
        x => {
          scrollViewRef.current?.scrollTo({
            x: x - 16,
            animated: true,
          });
        },
        () => {},
      );
    }
  }, []);

  const renderSelectionBar = () => (
    <View style={[styles.selectionBar, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        onPress={exitSelectionMode}
        style={styles.selectionCancelButton}
      >
        <MaterialIcon name="close" size={24} color={colors.textSecondary} />
        <ThemedText
          style={[styles.selectionCancelText, { color: colors.textSecondary }]}
        >
          Cancel
        </ThemedText>
      </TouchableOpacity>
      <View style={styles.selectionCountContainer}>
        <MaterialIcon name="check-circle" size={20} color={colors.primary} />
        <ThemedText style={[styles.selectionCount, { color: colors.primary }]}>
          {selectedPhotos.length} selected
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={handleDownloadSelected}
        style={styles.selectionDownloadButton}
      >
        <MaterialIcon name="download" size={24} color={colors.primary} />
        <ThemedText
          style={[styles.selectionDownloadText, { color: colors.primary }]}
        >
          Download
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          {eventName}
        </ThemedText>
        {!selectionMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleDownloadAll}
              style={styles.headerAction}
            >
              <MaterialIcon name="download" size={22} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSelectionMode(true)}
              style={styles.headerAction}
            >
              <MaterialIcon
                name="check-circle-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderCustomTabBar = () => (
    <View style={styles.tabBarContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              ref={ref => {
                if (ref) tabRefs.current[tab.key] = ref;
              }}
              onPress={() => handleTabPress(tab.key)}
              style={[
                styles.chipTab,
                {
                  backgroundColor: isActive
                    ? colors.primary
                    : colors.backgroundSecondary,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
            >
              <MaterialIcon
                name={tab.icon}
                size={20}
                color={isActive ? '#FFFFFF' : colors.textSecondary}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.chipLabel,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    color: isActive ? '#FFFFFF' : colors.textSecondary,
                  },
                ]}
              >
                {tab.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'AllPhotos':
        return (
          <AllPhotosTab
            navigation={navigation}
            eventId={eventId}
            selectionMode={selectionMode}
            selectedPhotos={selectedPhotos}
            onPhotoSelect={handlePhotoSelect}
          />
        );
      case 'Faces':
        return (
          <FacesTab
            navigation={navigation}
            eventId={eventId}
            selectionMode={selectionMode}
            selectedPhotos={selectedPhotos}
            onPhotoSelect={handlePhotoSelect}
          />
        );
      case 'MyPhotos':
        return (
          <MyPhotosTab
            navigation={navigation}
            eventId={eventId}
            selectionMode={selectionMode}
            selectedPhotos={selectedPhotos}
            onPhotoSelect={handlePhotoSelect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {renderHeader()}
      {selectionMode && renderSelectionBar()}
      {renderCustomTabBar()}
      <View style={styles.contentContainer}>{renderContent()}</View>
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
  },
  selectionCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionDownloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionDownloadText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  tabBarContainer: {
    // borderWidth: 2,
    // borderColor: 'pink',
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  chipTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    gap: 8,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabIcon: {
    marginRight: 2,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: '50%',
    transform: [{ translateX: -4 }],
    width: 8,
    height: 3,
    borderRadius: 1.5,
  },
  contentContainer: {
    flex: 1,
  },
});

export default PhotoGalleryScreen;
