import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  RefreshControl, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const TourGuidesPage = ({ navigation }) => {
  const [tourGuides, setTourGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTourGuides = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'tourGuides'));
      const guides = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTourGuides(guides);
    }  catch (error) {
      console.error('Error fetching guides:', error);
      Alert.alert('Error', 'Failed to load tour guides');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTourGuides();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTourGuides();
  };

  const handleBookGuide = (guide) => {
    navigation.navigate('BookGuide', { 
      guide,
      from: 'guides'  // Indicate we're coming from the guides list
    });
  };

  const renderGuideItem = ({ item }) => (
    <View style={styles.guideCard}>
      <Image
        source={{ uri: item.photo || 'https://via.placeholder.com/150' }}
        style={styles.guideImage}
      />
      <View style={styles.guideInfo}>
        <Text style={styles.guideName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
        </View>
        <Text style={styles.guideSpecialty}>
          Specialties: {item.specialties?.join(', ') || 'Various locations'}
        </Text>
        <Text style={styles.guideLanguages}>
          Languages: {item.languages?.join(', ') || 'English'}
        </Text>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookGuide(item)}
        >
          <Text style={styles.bookButtonText}>Book This Guide</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Tour Guides</Text>
      <FlatList
        data={tourGuides}
        renderItem={renderGuideItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#008000']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tour guides available</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  guideCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guideImage: {
    width: 120,
    height: 140,
  },
  guideInfo: {
    flex: 1,
    padding: 12,
  },
  guideName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 5,
    color: '#555',
  },
  guideSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  guideLanguages: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#008000',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default TourGuidesPage;