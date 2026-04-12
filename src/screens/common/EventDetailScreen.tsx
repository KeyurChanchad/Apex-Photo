import React, { useCallback } from 'react';
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
import { copyToClipboard } from '../../utils/helper';

const { width } = Dimensions.get('window');
const qrSize = width * 0.5;

// Mock QR component - replace with actual QR code library
const MockQRCode = ({ size }: { size: number }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          backgroundColor: colors.black,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 12,
        },
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

  const handleSaveQR = () => {
    Alert.alert('Save QR', 'QR code saved to gallery');
  };

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: 'Join my event: https://yourapp.com/event/123456',
        title: 'Share Event',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share link');
    }
  };

  const handleGalleryPress = () => {
    navigation.navigate('PhotoGallery');
  };

  const handleMyFacePress = () => {
    navigation.navigate('PhotoGallery', {
      screen: 'MyPhotos',
    });
  };

  const getStatusColor = (status: EventStatusType) => {
    switch (status) {
      case 'ACTIVE':
        return colors.success;
      case 'UPCOMING':
        return colors.secondary;
      case 'CLOSED':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Event link',
        message: 'https://localhost:7286/Portfolio/EventCode?code=HK20260703',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Please try again',
      });
    }
  };

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
            color={colors.text}
            onPress={handleGoBack}
          />
          <ThemedText variant="h2" style={styles.title}>
            Event Details
          </ThemedText>
        </View>

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
          <ThemedText variant="h3" style={styles.eventName}>
            EventName
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
                Wed, Apr 1, 2026
              </ThemedText>
            </View>

            {/* Event Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor('CLOSED') + '20' },
              ]}
            >
              <ThemedText
                style={[styles.statusText, { color: getStatusColor('CLOSED') }]}
              >
                CLOSED
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
              123456
            </ThemedText>
            <Pressable
              style={[styles.shareButton]}
              onPress={() => {
                copyToClipboard('123456');
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
            <MockQRCode size={qrSize} />
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
              <MaterialIcons name="download" size={26} color={colors.primary} />
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
              onPress={handleShare}
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
                copyToClipboard('https://localhost:5327/event?code=Hk349384');
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
            <MaterialIcons name="photo-library" size={24} color={colors.text} />
            <ThemedText style={[styles.navButtonText, { color: colors.text }]}>
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
});

export default EventDetailScreen;
