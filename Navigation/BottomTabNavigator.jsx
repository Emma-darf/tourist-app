import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../src/screen/HomeScreen';
import TourGuidesPage from '../src/screen/TourGuidesPage';
import EventsPage from '../src/screen/EventsPage';
import BookingsScreen from '../src/screen/BookingsScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'TourGuides') {
            iconName = 'users';
          } else if (route.name === 'Events') {
            iconName = 'calendar';
          } else if (route.name === 'Bookings') {
            iconName = 'book';
          }

          return (
            <View style={focused ? styles.activeTab : styles.inactiveTab}>
              <Icon 
                name={iconName} 
                size={focused ? 24 : 22} 
                color={color} 
              />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#008000',
        tabBarInactiveTintColor: '#57636C',
        tabBarStyle: styles.tabBar,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="TourGuides" component={TourGuidesPage} />
      <Tab.Screen name="Events" component={EventsPage} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 70,
    borderTopWidth: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    paddingBottom: 0,
  },
  activeTab: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
  },
  inactiveTab: {
    alignItems: 'center',
    justifyContent: 'center',
    top: 5,
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#008000',
    marginTop: 4,
  },
});

export default BottomTabNavigator;