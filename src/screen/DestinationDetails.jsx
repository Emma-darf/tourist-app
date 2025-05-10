import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  RefreshControl,
  Animated
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const DestinationDetails = ({ route, navigation }) => {
  const { destination } = route.params;
  
  // EXACT Firebase structure - no additional fields
  const safeDestination = {
    id: destination.id,
    type: destination.type,
    // Site fields
    ...(destination.type === 'site' && {
      site_name: destination.site_name,
      url_image: destination.url_image,
      about: destination.about,
      descriptions: destination.descriptions,
      additional_photos: destination.additional_photos || []
    }),
    // Attraction fields
    ...(destination.type === 'attraction' && {
      name: destination.name,
      image: destination.image,
      descriptions: destination.descriptions,
      additional_details: destination.additional_details || {}
    })
  };

  // Image handling - exact match to Firebase fields
  const allPhotos = destination.type === 'site' 
    ? [safeDestination.url_image, ...(safeDestination.additional_photos || [])]
    : [safeDestination.image];

  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tourGuides, setTourGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const galleryOpacity = useRef(new Animated.Value(1)).current;

  const fetchTourGuides = async () => {
    try {
      setLoading(true);
      const guidesCollection = collection(db, 'tour_guides');
      const guidesSnapshot = await getDocs(guidesCollection);
      const guidesData = guidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTourGuides(guidesData);
    } catch (error) {
      console.error("Error fetching tour guides:", error);
      Alert.alert('Error', 'Failed to load tour guides. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTourGuides().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchTourGuides();
  }, []);

  const openGallery = (index) => {
    setSelectedImageIndex(index);
    setGalleryVisible(true);
  };

  const closeGallery = () => {
    setGalleryVisible(false);
  };

  const renderGuideItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.guideCard}
      onPress={() => navigation.navigate('GuideDetails', { guide: item })}
    >
      <Image 
        source={{ uri: item.profile_picture || 'https://via.placeholder.com/150' }} 
        style={styles.guideImage}
      />
      <View style={styles.guideInfo}>
        <Text style={styles.guideName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
        </View>
        <Text style={styles.guideLanguages} numberOfLines={2}>
          Languages: {item.languages?.join(', ') || 'English'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#008000']}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Main Image */}
        <TouchableOpacity onPress={() => openGallery(0)}>
          <Image 
            source={{ uri: destination.type === 'site' ? safeDestination.url_image : safeDestination.image }} 
            style={styles.destinationImage}
          />
        </TouchableOpacity>
        
        <View style={styles.destinationInfo}>
          {/* Title */}
          <Text style={styles.title}>
            {destination.type === 'site' ? safeDestination.site_name : safeDestination.name}
          </Text>

          {/* Description */}
          {safeDestination.descriptions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{safeDestination.descriptions}</Text>
            </View>
          )}

          {/* About (Sites only) */}
          {destination.type === 'site' && safeDestination.about && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{safeDestination.about}</Text>
            </View>
          )}

         {/* Additional Details (Attractions only) */}
         {destination.type === 'attraction' && safeDestination.additional_details && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <Text style={styles.additional_details}>{safeDestination.additional_details}</Text>
            </View>
         )} 
         


        

        {/* Gallery (Sites only) */}
          {destination.type === 'site' && safeDestination.additional_photos?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <FlatList
                horizontal
                data={safeDestination.additional_photos}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => openGallery(index + 1)}>
                    <Image 
                      source={{ uri: item }} 
                      style={styles.galleryImage}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.galleryContainer}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Tour Guides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Guides</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#008000" />
          ) : (
            <FlatList
              data={tourGuides}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderGuideItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.guideList}
              ListEmptyComponent={
                <Text style={styles.noGuidesText}>No guides available</Text>
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Gallery Modal */}
      <Modal
        visible={galleryVisible}
        transparent={true}
        onRequestClose={closeGallery}
      >
        <View style={styles.galleryModalContainer}>
          <TouchableOpacity 
            style={styles.closeGalleryButton}
            onPress={closeGallery}
          >
            <Icon name="times" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View style={[styles.galleryBackdrop, { opacity: galleryOpacity }]}>
            <Image
              source={{ uri: allPhotos[selectedImageIndex] }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          </Animated.View>
          
          <Text style={[styles.imageCounter, { left: width / 2 - 30 }]}>
            {selectedImageIndex + 1}/{allPhotos.length}
          </Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  destinationImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  destinationInfo: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailKey: {
    fontWeight: 'bold',
    width: 120,
    color: '#333',
  },
  detailValue: {
    flex: 1,
    color: '#555',
  },
  galleryContainer: {
    paddingVertical: 10,
  },
  galleryImage: {
    width: 200,
    height: 150,
    marginRight: 10,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  guideList: {
    paddingBottom: 10,
  },
  guideCard: {
    width: 200,
    marginRight: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guideImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    marginLeft: 5,
    color: '#555',
  },
  guideLanguages: {
    fontSize: 12,
    color: '#666',
  },
  noGuidesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  galleryModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  galleryBackdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: width,
    height: height * 0.7,
  },
  closeGalleryButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  imageCounter: {
    position: 'absolute',
    top: 50,
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
    
  // detailsContainer: {
  //   backgroundColor: '#f9f9f9',
  //   borderRadius: 10,
  //   padding: 15,
  // },
  // detailItem: {
  //   flexDirection: 'row',
  //   marginBottom: 10,
  //   flexWrap: 'wrap',
  // },
  // detailLabel: {
  //   fontWeight: 'bold',
  //   width: '40%',
  //   color: '#008000',
  // },
  // detailContent: {
  //   flex: 1,
  //   color: '#555',
  // },

  detailsParagraph: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  detailSentence: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#008000',
  },
});

export default DestinationDetails;