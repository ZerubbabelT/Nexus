// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { getDatabase,
  ref,
  push, update, remove,
  onChildAdded,get,onValue,onChildRemoved,
} from "firebase/database";
import { getStorage,
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  uploadBytesResumable
} from "firebase/storage";

// Firebase configuration object using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Google Provider
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider();

// Export Firebase authentication and provider to use in other files
export { auth,
  googleProvider,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut,
  
  db,
  ref,
  push,
  onChildAdded,get,onValue,update,remove,onChildRemoved,
  
  storage,
  storageRef, 
  uploadBytes, 
  getDownloadURL, 
  uploadBytesResumable
 };
