// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAAuyO5J7c-p0EtzVcwLfYVKZaZ6c8RSV4',
  authDomain: 'instagramcloneapp-56196.firebaseapp.com',
  projectId: 'instagramcloneapp-56196',
  storageBucket: 'instagramcloneapp-56196.appspot.com',
  messagingSenderId: '392027818061',
  appId: '11:392027818061:ios:9c35fb01e6f9ab64cdb404', // Buraya Firebase Console'dan aldığınız App ID'yi ekleyin
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Kullanıcı verisini Firestore'a kaydetme
const saveUserData = async (userId, username, email) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      username: username,
      email: email,
    });
    console.log("User data saved successfully!");
  } catch (e) {
    console.error("Error saving user data: ", e);
  }
};

// Kullanıcı verisini Firestore'dan çekme
const getUserData = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("User data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error getting document: ", e);
  }
};

// Firestore'dan tüm kullanıcıları çekme
const getAllUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    const userList = snapshot.docs.map(doc => doc.data());
    console.log("All Users:", userList);
    return userList;
  } catch (e) {
    console.error("Error getting documents: ", e);
  }
};

// Firebase Auth'tan giriş yapan kullanıcının bilgilerini almak
const getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return user;
  } else {
    console.log("No user is signed in.");
  }
};

export { auth, db, saveUserData, getUserData, getAllUsers, getCurrentUser };