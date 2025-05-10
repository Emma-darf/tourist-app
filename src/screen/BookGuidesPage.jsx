import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Modal,
  Image,
  ActivityIndicator
} from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../Firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';

const BookGuidePage = ({ route, navigation }) => {
  const { guide, from } = route.params;
  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [email, setEmail] = useState(auth.currentUser?.email || '');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date(new Date().setHours(10, 0)));
  const [guests, setGuests] = useState('1');
  const [specialRequests, setSpecialRequests] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!name || !email || !date || !time || !guests) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const db = getFirestore();
    try {
      setIsBooking(true);
      await addDoc(collection(db, 'bookings'), {
        userId: auth.currentUser?.uid,
        guideId: guide.id,
        guideName: guide.name,
        guidePhoto: guide.photo,
        userName: name,
        userEmail: email,
        destination: from === 'guides' ? 'Custom Tour' : guide.destination || 'Custom Tour',
        bookingDate: date.toISOString().split('T')[0],
        bookingTime: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guests: parseInt(guests),
        specialRequests: specialRequests,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsConfirmed(true);
    } catch (error) {
      console.error('Error adding booking:', error);
      Alert.alert('Error', 'Failed to book. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleComplete = () => {
    setIsConfirmed(false);
    navigation.navigate('Bookings');
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Book {guide.name}</Text>

        <View style={styles.guideDetailsContainer}>
          <Image 
            source={{ uri: guide.photo || 'https://via.placeholder.com/150' }} 
            style={styles.guideImage}
          />
          <Text style={styles.guideName}>{guide.name}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{guide.rating || '4.5'}</Text>
          </View>
          <Text style={styles.guideExperience}>
            Experience: {guide.experience || 'Not specified'}
          </Text>
          <Text style={styles.guideLanguages}>
            Languages: {guide.languages?.join(', ') || 'English'}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Your Name *"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Your Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Date: {formatDate(date)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowTimePicker(true)}
        >
          <Text>Time: {formatTime(time)}</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.input}
          placeholder="Number of Guests *"
          keyboardType="numeric"
          value={guests}
          onChangeText={setGuests}
        />
        
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="Special Requests (optional)"
          multiline
          value={specialRequests}
          onChangeText={setSpecialRequests}
        />

        <TouchableOpacity 
          style={styles.bookButton} 
          onPress={handleBooking}
          disabled={isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}

      <Modal visible={isConfirmed} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Icon name="check-circle" size={60} color="#4CAF50" style={styles.successIcon} />
            <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
            <Text style={styles.confirmationText}>
              You have successfully booked {guide.name} for {formatDate(date)} at {formatTime(time)}.
            </Text>
            <Text style={styles.confirmationDetails}>
              You can view and manage your bookings in the "My Bookings" section.
            </Text>
            <TouchableOpacity 
              style={styles.doneButton} 
              onPress={handleComplete}
            >
              <Text style={styles.doneButtonText}>View Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    marginBottom: 16,
    textAlign: 'center',
  },
  guideDetailsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  guideImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  guideName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 5,
    color: '#555',
  },
  guideExperience: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  guideLanguages: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 16,
    justifyContent: 'center',
  },
  bookButton: {
    backgroundColor: '#008000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bookButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#008000',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  confirmationDetails: {
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#008000',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successIcon: {
    marginBottom: 10,
  },
});

export default BookGuidePage;