// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCTjYn0pSl12U57lPdBm0lIDr7wuzatJ8A",
  authDomain: "ghtour-3707b.firebaseapp.com",
  projectId: "ghtour-3707b",
  storageBucket: "ghtour-3707b.appspot.com",
  messagingSenderId: "1053760993246",
  appId: "1:1053760993246:web:98cd0065ba434ae3b48f4f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };