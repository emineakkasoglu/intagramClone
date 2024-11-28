import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Home = () => {
  const navigation = useNavigation();
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Takip edilen kullanıcıları çekme
      const followingQuery = query(collection(db, 'users', currentUser.uid, 'following'));
      getDocs(followingQuery).then((snapshot) => {
        const followingList = snapshot.docs.map((doc) => doc.id);
        const updatedFollowingList = [...followingList, currentUser.uid];

        // Postları çekme (takip edilenler ve kendi postları)
        const postsQuery = query(collection(db, 'posts'), where('userId', 'in', updatedFollowingList));
        getDocs(postsQuery).then((postsSnapshot) => {
          const posts = postsSnapshot.docs.map(async (doc) => {
            const postData = doc.data();
            console.log('Post userId:', postData.userId); // userId'yi kontrol et

            // Kullanıcı bilgilerini almak için sorgu
            const userRef = collection(db, 'users');
            const userSnapshot = await getDocs(query(userRef, where('__name__', '==', postData.userId))); // Kullanıcı ID'yi belge adı olarak kullanıyoruz

            let username = 'Unknown User'; // Varsayılan kullanıcı adı
            if (!userSnapshot.empty) {
              const userInfo = userSnapshot.docs[0].data();
              console.log('User data:', userInfo); // Kullanıcı bilgilerini kontrol et
              username = userInfo.username || 'Unknown User'; // `username` varsa kullan
            } else {
              console.log('No user found for this post');
            }

            return {
              id: doc.id,
              ...postData,
              username, // Kullanıcı adı ekle
            };
          });

          // Asenkron işlem sonrası veriyi güncelle
          Promise.all(posts).then((resolvedPosts) => {
            setUserPosts(resolvedPosts);
          });
        });
      });
    }
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.iconContainer}>
          <Icon name="logo-instagram" size={30} color="#000" />
          <Text style={styles.iconText}>Instagram</Text>
        </TouchableOpacity>

        <View style={styles.iconGroup}>
          <TouchableOpacity style={styles.iconItem}>
            <Icon name="heart-outline" size={30} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconItem}>
            <Icon name="file-tray-full-outline" size={30} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {userPosts.map((post) => (
          <View key={post.id} style={styles.postContainer}>
            <Text style={styles.username}>{post.username}</Text> {/* Kullanıcı adı göster */}
            <Image source={{ uri: post.photoUrl }} style={styles.postImage} />
            <Text style={styles.description}>{post.caption}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('SearchPage')}>
          <Icon name="search" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Add')}>
          <Icon name="add-circle" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Video')}>
          <Icon name="film-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person-outline" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  topbar: {
    height: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    zIndex: 10, // İçeriğin üstünde yer alır
    elevation: 5, // Android cihazlar için
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 35,
  },
  iconText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#000',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 35,
  },
  iconItem: {
    marginLeft: 15,
    marginBottom: 5,
  },
  content: {
    paddingTop: 100, // Topbar'ın altından başlatır
    paddingHorizontal: 10,
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
    bottom: 0,
    width: '100%',
  },
  postContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  description: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  username: {
    paddingHorizontal: 10,
    paddingTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
    paddingBottom:10,
  },
});

export default Home;
