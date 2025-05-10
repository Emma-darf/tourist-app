import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screen/LoginScreen';
import RegisterScreen from './src/screen/RegisterScreen';
import DestinationDetails from './src/screen/DestinationDetails';
import BookGuidePage from './src/screen/BookGuidesPage';
import BottomTabNavigator from './Navigation/BottomTabNavigator';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#008000',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ 
            title: 'Create Account',
            headerLeft: null
          }}
        />
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
          options={{ 
            headerShown: false,
            gestureEnabled: false
          }}
        />
        <Stack.Screen
          name="DestinationDetails"
          component={DestinationDetails}
          options={({ route }) => ({ 
            title: route.params.destination?.site_name || 
                   route.params.destination?.name || 
                   'Destination Details'
          })}
        />
        <Stack.Screen
          name="BookGuide"
          component={BookGuidePage}
          options={({ route }) => ({ 
            title: `Book ${route.params.guide?.name || 'Guide'}`,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;