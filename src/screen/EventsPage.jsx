import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';

// Mock function to simulate fetching events from an API
const fetchEvents = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: '1',
          name: 'Cape Coast Festival',
          date: '2023-12-15',
          time: '10:00 AM',
          location: 'Cape Coast Castle',
        },
        {
          id: '2',
          name: 'Kakum Canopy Walk Adventure',
          date: '2023-11-20',
          time: '8:00 AM',
          location: 'Kakum National Park',
        },
        {
          id: '3',
          name: 'Mole National Park Safari',
          date: '2024-01-10',
          time: '9:00 AM',
          location: 'Mole National Park',
        },
      ]);
    }, 1000); // Simulate a 1-second delay
  });
};

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Function to load events
  const loadEvents = async () => {
    setRefreshing(true);
    const data = await fetchEvents();
    setEvents(data);
    setRefreshing(false);
  };

  // Render each event item
  const renderEventItem = ({ item }) => (
    <View style={styles.eventItem}>
      <Text style={styles.eventName}>{item.name}</Text>
      <Text style={styles.eventDate}>📅 {item.date} | 🕒 {item.time}</Text>
      <Text style={styles.eventLocation}>📍 {item.location}</Text>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No upcoming events found.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Programs</Text>
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState} // Show empty state if no events
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadEvents} /> // Pull-to-refresh
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 16,
  },
  eventItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});

export default EventsPage;