import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, ScrollView, Image, TouchableOpacity, 
  StyleSheet, FlatList, ActivityIndicator, Alert, 
  Dimensions, RefreshControl 
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = height * 0.35;

const flierMessages = [
  { id: 1, text: "Welcome to Ghana", subtext: "Have a wonderful stay!", icon: "map" },
  { id: 2, text: "Explore Our Culture", subtext: "Rich heritage awaits you", icon: "globe" },
  { id: 3, text: "Beautiful Landscapes", subtext: "Discover nature's beauty", icon: "tree" }
];

const HomeScreen = ({ navigation }) => {
  const [sites, setSites] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flierRef = useRef(null);
  const currentFlierIndex = useRef(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Sites - matches exact Firebase structure
      const sitesSnapshot = await getDocs(collection(db, 'Sites'));
      const sitesData = sitesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'site',
        site_name: doc.data().site_name,
        url_image: doc.data().url_image,
        about: doc.data().about,
        descriptions: doc.data().descriptions,
        additional_photos: doc.data().additional_photos || [],
        location: doc.data().location,
        opening_hours: doc.data().opening_hours,
        entrance_fee: doc.data().entrance_fee
      }));

      // Fetch Attractions - matches exact Firebase structure
      const attractionsSnapshot = await getDocs(collection(db, 'attractions'));
      const attractionsData = attractionsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'attraction',
        name: doc.data().name,
        image: doc.data().image,
        descriptions: doc.data().descriptions,
        additional_details: doc.data().additional_details || {},
      }));

      setSites(sitesData);
      setAttractions(attractionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert('Error', 'Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newIndex = (currentFlierIndex.current + 1) % flierMessages.length;
      currentFlierIndex.current = newIndex;
      flierRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
        viewPosition: 0.5
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const renderFlierItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.flierItem}
      onPress={() => Alert.alert(item.text, item.subtext)}
    >
      <View style={styles.flierContent}>
        <Text style={styles.flierTitle}>{item.text}</Text>
        <Text style={styles.flierSubtitle}>{item.subtext}</Text>
      </View>
      <View style={styles.flierIconContainer}>
        <Icon name={item.icon} size={30} color="#008000" />
      </View>
    </TouchableOpacity>
  );

  const renderDestinationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => navigation.navigate('DestinationDetails', { 
        destination: item
      })}
    >
      <Image 
        source={{ uri: item.url_image }} 
        style={styles.destinationImage}
        resizeMode="cover"
      />
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.site_name}</Text>
        {item.additional_photos?.length > 0 && (
          <View style={styles.photosBadge}>
            <Icon name="camera" size={12} color="#fff" />
            <Text style={styles.photosBadgeText}>{item.additional_photos.length}+</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderAttractionItem = ({ item, index }) => (
    <View key={item.id}>
      <TouchableOpacity
        style={styles.attractionCard}
        onPress={() => navigation.navigate('DestinationDetails', { 
          destination: item
        })}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.attractionImage}
          resizeMode="cover"
        />
        <View style={styles.attractionContent}>
          <Text style={styles.attractionName}>{item.name}</Text>
          <Text style={styles.attractionDescription} numberOfLines={2}>
            {item.descriptions}
          </Text>
        </View>
      </TouchableOpacity>
      
      {index < attractions.length - 1 && (
        <View style={styles.flierContainer}>
          <FlatList
            ref={flierRef}
            data={flierMessages}
            renderItem={renderFlierItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        <Image
          source={require('../../assets/tour.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Discover Ghana</Text>
          <Text style={styles.headerSubtitle}>Explore the beauty and culture</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#008000']}
            tintColor="#008000"
          />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllDestinations')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={sites.slice(0, 5)}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderDestinationItem}
            contentContainerStyle={styles.destinationList}
            keyExtractor={item => item.id}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Attractions</Text>
          <FlatList
            data={attractions}
            renderItem={renderAttractionItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Your Visit</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#008000' }]}
              onPress={() => navigation.navigate('TourGuides')}
            >
              <Icon name="user" size={20} color="#FFD700" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Book a Tour Guide</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#39D26A' }]}
              onPress={() => navigation.navigate('Events')}
            >
              <Icon name="calendar" size={18} color="#FFD700" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Upcoming Events</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
  },
  scrollContainer: {
    paddingTop: HEADER_HEIGHT,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 15,
    padding: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008000',
  },
  seeAll: {
    color: '#008000',
    fontWeight: '600',
  },
  destinationList: {
    paddingRight: 15,
  },
  destinationCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  destinationImage: {
    width: 160,
    height: 120,
  },
  destinationInfo: {
    padding: 10,
    position: 'relative',
  },
  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  photosBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photosBadgeText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  attractionCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  attractionImage: {
    width: '100%',
    height: 180,
  },
  attractionContent: {
    padding: 15,
  },
  attractionName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 5,
  },
  attractionDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  flierContainer: {
    height: 140,
    backgroundColor: '#FFD700',
    marginVertical: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  flierItem: {
    width: width - 40,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  flierContent: {
    flex: 1,
  },
  flierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 5,
  },
  flierSubtitle: {
    fontSize: 16,
    color: '#333',
  },
  flierIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    padding: 15,
    marginLeft: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

    
  detailsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  detailLabel: {
    fontWeight: 'bold',
    width: '40%',
    color: '#008000',
  },
  detailContent: {
    flex: 1,
    color: '#555',
  },

});

export default HomeScreen;