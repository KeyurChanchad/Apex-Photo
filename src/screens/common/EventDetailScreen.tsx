import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  Image,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ThemedText } from '../../components/common/ThemedText';
import { EventStatusType } from '../../types/common.types';
import Toast from 'react-native-toast-message';
import { copyToClipboard, getStatusName } from '../../utils/helper';
import { EventDetailResponse, EventDetailType } from '../../types/event.types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const qrSize = width * 0.5;

// Mock QR component - replace with actual QR code library
const QrCode = ({ base64, size }: { base64: string; size: number }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.qrImg,
        { width: size, height: size, backgroundColor: colors.info },
      ]}
    >
      <Image
        resizeMode="cover"
        source={require('../../assets/images/qrcode.png')}
        style={{ width: size, height: size, borderRadius: 12 }}
      />
    </View>
  );
};

const EventDetailScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { colors } = useTheme();
  const { params } = useRoute();
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<EventDetailType | null>(null);
  const eventId = (params as { eventId: string }).eventId;

  const getEventDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Getting detail....');

      const response: EventDetailResponse = await api.get(
        `/PortfolioEventApi/EventDetail?eventId=${eventId}`,
      );
      console.log('response of detail ', response);

      if (response.data) {
        setEventData(response.data);
      }
    } catch (error) {
      console.error('Error to get event details ', error);
      Toast.show({
        type: 'error',
        text1: 'Error to get event detail',
        text2: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    getEventDetail();
  }, [getEventDetail]);

  const handleSaveQR = () => {
    Alert.alert('Save QR', 'QR code saved to gallery');
  };

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShareLink = async () => {
    try {
      await Share.share({
        title: 'Share Event',
        message: 'https://localhost:7286/Portfolio/EventCode?code=HK20260703',
      });
    } catch (error) {
      console.error('Error to share link ', error);
    }
  };

  const handleGalleryPress = () => {
    navigation.navigate('PhotoGallery', {
      eventId: eventData?.eventId,
      eventCode: eventData?.eventCode,
      eventName: eventData?.name,
    });
  };

  const handleMyFacePress = () => {
    navigation.navigate('PhotoGallery', {
      screen: 'MyPhotos',
      params: {
        eventId: eventData?.eventId,
        eventCode: eventData?.eventCode,
        eventName: eventData?.name,
      },
    });
  };

  const getStatusColor = (status: EventStatusType) => {
    switch (status) {
      case 1:
        return colors.success;
      case 2:
        return colors.primary;
      case 3:
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  if (isLoading) return <LoadingSpinner visible={true} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.row}>
          <MaterialIcons
            name="arrow-back"
            size={26}
            color={colors.primary}
            onPress={handleGoBack}
          />
          <ThemedText variant="h3" style={styles.title}>
            Event Details
          </ThemedText>
        </View>

        {eventData ? (
          <>
            {/** Event Basic Detail Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              {/* Event Name */}
              <ThemedText variant="h4" style={styles.eventName}>
                {eventData.name}
              </ThemedText>

              <View style={styles.eventDesc}>
                {/* Date */}
                <View style={styles.row}>
                  <MaterialIcons
                    name="date-range"
                    size={20}
                    color={colors.primaryDark}
                  />
                  <ThemedText
                    style={[styles.dateText, { color: colors.textSecondary }]}
                  >
                    {new Date(eventData.eventDate).toDateString()}
                  </ThemedText>
                </View>

                {/* Event Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(eventData.eventStatus) + '20',
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.statusText,
                      { color: getStatusColor(eventData.eventStatus) },
                    ]}
                  >
                    {getStatusName(eventData.eventStatus)}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/** Event Code Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              {/* EVENT CODE Label */}
              <ThemedText
                style={[styles.cardTitle, { color: colors.textSecondary }]}
              >
                EVENT CODE
              </ThemedText>

              {/* Event Code Value */}
              <View style={[styles.row, { justifyContent: 'space-between' }]}>
                <ThemedText
                  variant="h3"
                  style={[styles.codeValue, { color: colors.primaryDark }]}
                >
                  {eventData.eventCode}
                </ThemedText>
                <Pressable
                  style={[styles.shareButton]}
                  onPress={() => {
                    copyToClipboard(eventData.eventCode);
                  }}
                >
                  <MaterialIcons
                    name="content-copy"
                    size={26}
                    color={colors.primaryDark}
                  />
                </Pressable>
              </View>
            </View>

            {/* QR Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <ThemedText
                style={[styles.cardTitle, { color: colors.textSecondary }]}
              >
                SCAN TO JOIN EVENT
              </ThemedText>

              <View style={styles.qrWrapper}>
                <QrCode base64={eventData.qrCodeBase64} size={qrSize} />
                {/* <ThemedText
                style={[styles.qrNotAvailable, { color: colors.error }]}
              >
                QR not available
              </ThemedText> */}
              </View>
              <View style={{ alignSelf: 'center' }}>
                <TouchableOpacity
                  style={[
                    styles.saveQrButton,
                    styles.row,
                    {
                      borderWidth: 1,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={handleSaveQR}
                >
                  <MaterialIcons
                    name="download"
                    size={26}
                    color={colors.primary}
                  />
                  <ThemedText variant="body1" style={{ color: colors.primary }}>
                    Save QR
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Share Link Section */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundSecondary,
                  shadowColor: colors.shadow,
                },
              ]}
            >
              <ThemedText
                style={[styles.cardTitle, { color: colors.textSecondary }]}
              >
                {' '}
                SHARE LINK{' '}
              </ThemedText>

              {/** Link */}
              <View
                style={{
                  backgroundColor: colors.background,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <ThemedText style={{ opacity: 0.7 }}>
                  https://localhost:7286/Portfolio/EventCode?code=HK20260703
                </ThemedText>
              </View>

              {/** Share action buttons */}
              <View style={styles.shareButtons}>
                <Pressable
                  style={[
                    styles.shareButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={handleShareLink}
                >
                  <MaterialIcons
                    name="share"
                    size={26}
                    color={colors.primaryDark}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.shareButton,
                    { backgroundColor: colors.background },
                  ]}
                  onPress={() => {
                    copyToClipboard(
                      'https://localhost:5327/event?code=Hk349384',
                    );
                  }}
                >
                  <MaterialIcons
                    name="content-copy"
                    size={26}
                    color={colors.primaryDark}
                  />
                </Pressable>
              </View>
              {/* <ThemedText
            style={[styles.shareNotAvailable, { color: colors.error }]}
          >
            Share link not available
          </ThemedText> */}
            </View>

            {/* Bottom Navigation Buttons */}
            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: colors.primary }]}
                onPress={handleGalleryPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="photo-library"
                  size={24}
                  color={colors.white}
                />
                <ThemedText
                  style={[styles.navButtonText, { color: colors.white }]}
                >
                  Gallery
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navButton,
                  { borderWidth: 1, borderColor: colors.primary },
                ]}
                onPress={handleMyFacePress}
                activeOpacity={0.7}
              >
                <MaterialIcons name="face" size={24} color={colors.primary} />
                <ThemedText
                  style={[styles.navButtonText, { color: colors.primary }]}
                >
                  My Face
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event" size={80} color="#ccc" />
            <ThemedText style={styles.emptyText}>
              Event detail not found
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    marginVertical: 12,
    marginLeft: 6,
  },
  eventName: {
    fontWeight: '600',
    marginBottom: 8,
    // textAlign: 'center',
  },
  dateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  codeValue: {
    // fontSize: 48,
    fontWeight: '700',
    letterSpacing: 4,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrNotAvailable: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
  },
  saveQrButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 16,
    opacity: 0.9,
  },
  shareLinkButton: {
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 160,
    marginBottom: 12,
  },
  shareNotAvailable: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  eventDesc: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareButtons: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  shareButton: {
    padding: 14,
    borderRadius: '50%',
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
  qrImg: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default EventDetailScreen;
