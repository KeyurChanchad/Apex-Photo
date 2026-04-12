import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { EventItemType, EventStatusType } from '../../types/common.types';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { useNavigation } from '@react-navigation/native';

const EventListScreen = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const [events, setEvents] = useState<EventItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // API call to fetch joined events
  const fetchJoinedEvents = async () => {
    try {
      // Replace with your actual API endpoint
      // const response = await fetch(
      //   'https://your-api.com/api/user/joined-events',
      //   {
      //     method: 'GET',
      //     headers: {
      //       'Content-Type': 'application/json',
      //       // Add authorization token if needed
      //       // 'Authorization': 'Bearer YOUR_TOKEN',
      //     },
      //   },
      // );

      // const data = await response.json();
      // setEvents(data);
      // Sample data for testing
      setEvents([
        {
          id: '1',
          name: 'Tech Conference 2026',
          eventNumber: '123456',
          date: 'Apr 1, 2026',
          status: 'ACTIVE',
        },
        {
          id: '2',
          name: 'Design Workshop',
          eventNumber: '789012',
          date: 'Apr 15, 2026',
          status: 'UPCOMING',
        },
        {
          id: '3',
          name: 'Hackathon',
          eventNumber: '345678',
          date: 'Mar 25, 2026',
          status: 'CLOSED',
        },
      ]);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJoinedEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJoinedEvents();
  };

  const handleJoinNewEvent = () => {
    // Navigate to join event screen or show modal
    navigation.navigate('JoinEvent');
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

  const renderEventCard = ({ item }: { item: EventItemType }) => (
    <Pressable
      style={[
        styles.eventCard,
        { backgroundColor: colors.background, shadowColor: colors.shadow },
      ]}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <View style={styles.eventHeader}>
        <Text style={[styles.eventName, { color: colors.text }]}>
          {item.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.eventDetails}>
        <Text style={[styles.eventNumber, { color: colors.primary }]}>
          # {item.eventNumber}
        </Text>
        <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
          {item.date}
        </Text>
      </View>
    </Pressable>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons
        name="event"
        size={46}
        color={colors.error}
        style={{ paddingBottom: 14 }}
      />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        No events joined yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Join an event using a code or QR scan to get started.
      </Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Events
        </Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={EmptyListComponent}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.buttonContainer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.joinButton, { backgroundColor: colors.primary }]}
          onPress={handleJoinNewEvent}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-circle" size={20} color={colors.white} />
          <Text style={[styles.joinButtonText, { color: colors.white }]}>
            Join New Event
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDate: {
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  joinButton: {
    flexDirection: 'row',
    gap: 5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default EventListScreen;
