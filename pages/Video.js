import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // <-- Add this import


const Video = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        } else {
          setUsername('Kullanıcı Adı Yok');
        }

        // Fetch the list of users the current user is following
        const followingQuery = query(collection(db, 'users', currentUser.uid, 'following'));
        const followingSnapshot = await getDocs(followingQuery);
        const followingList = followingSnapshot.docs.map(doc => doc.id);
        setFollowing(followingList);

        // Fetch posts from users the current user is not following
        const postsQuery = query(collection(db, 'posts'), where('userId', 'not-in', followingList));
        const postsSnapshot = await getDocs(postsQuery);
        const fetchedPosts = postsSnapshot.docs.map(doc => doc.data());
        setPosts(fetchedPosts);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut().then(() => {
      navigation.navigate('Login');
    });
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* İçerik */}
      <View style={styles.content}>
        <Text style={styles.userName}>{username}</Text>
        <ScrollView>
          {posts.map((post, index) => (
            <View key={index} style={styles.postContainer}>
              <Text>{post.caption}</Text>
              {/* Add Image or other post content if available */}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Alt Navigasyon Butonları */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('SearchPage')}>
          <Icon name="search" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Add')}>
          <Icon name="add-circle-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Video')}>
          <Icon name="film" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Arial',
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'darkred',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
  },
  bottomBar: {
    height: 60,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconItem: {
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Video;
