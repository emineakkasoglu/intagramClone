import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Kullanıcı bilgilerini getir
        const db = getFirestore();
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          setUsername(docSnap.data().username);
        } else {
          setUsername('Kullanıcı Adı Yok');
        }

        // Kullanıcının gönderilerini getir
        const postsCollection = collection(db, 'posts');
        const postsQuery = query(postsCollection, where('userId', '==', currentUser.uid));
        const postsSnap = await getDocs(postsQuery);

        const posts = postsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserPosts(posts);

        // Takipçi ve takip edilen verilerini getir
        const followersSnap = await getDocs(query(collection(db, 'users', currentUser.uid, 'followers')));
        const followingSnap = await getDocs(query(collection(db, 'users', currentUser.uid, 'following')));

        setFollowers(followersSnap.docs.map(doc => doc.id));
        setFollowing(followingSnap.docs.map(doc => doc.id));

        // Takipte olup olmadığını kontrol et
        setIsFollowing(followers.includes(currentUser.uid));
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFollow = async () => {
    const db = getFirestore();
    const currentUser = getAuth().currentUser;
  
    if (!currentUser) return;
  
    // Kullanıcının kendisini takip etmesini engelle
    if (currentUser.uid === user.uid) {
      alert('Kendinizi takip edemezsiniz!');
      return;
    }
  
    const userDoc = doc(db, 'users', user.uid);
  
    if (isFollowing) {
      // Takipten çık
      await updateDoc(userDoc, {
        followers: followers.filter((follower) => follower !== currentUser.uid),
      });
      setIsFollowing(false);
    } else {
      // Takip et
      await updateDoc(userDoc, {
        followers: [...followers, currentUser.uid],
      });
      setIsFollowing(true);
    }
  };
  

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
      {/* Sabit Top Bar */}
      <View style={styles.topbar}>
  <View style={styles.topbarContent}>
    <Text style={styles.userName}>{username || 'Kullanıcı Adı Yok'}</Text>
    <TouchableOpacity style={styles.iconItem} onPress={handleLogout}>
      <Icon name="log-out" size={30} color="#000" />
    </TouchableOpacity>
  </View>
  {/* Alt sıra - Takipçi ve Takip Edilen Sayıları */}
  <View style={styles.followContainer}>
    <Text style={styles.followText}>Takipçiler: {followers.length}</Text>
    <Text style={styles.followText}>Takip Edilenler: {following.length}</Text>
    <TouchableOpacity onPress={handleFollow} style={styles.followButton}>
      <Text style={styles.followButtonText}>{isFollowing ? 'Takip Ediliyor' : 'Takip Et'}</Text>
    </TouchableOpacity>
  </View>
</View>


      {/* Kullanıcı Gönderileri */}
      <ScrollView contentContainerStyle={styles.postsContainer}>
        {userPosts.map((post) => (
          <View key={post.id} style={styles.post}>
            <Image source={{ uri: post.photoUrl }} style={styles.postImage} />
            <Text style={styles.caption}>{post.caption}</Text>
          </View>
        ))}
      </ScrollView>

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
          <Icon name="film-outline" size={30} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Profile')}>
          <Icon name="person" size={30} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor:'white',
    flex: 1,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topbar: {
    height: 145, // Yükseklik arttı
    backgroundColor: '#fff',
    flexDirection: 'column', // Alt alta sıralamak için flexDirection: 'column'
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    
  },
  topbarContent: {
    marginTop: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 5, // Üstten biraz boşluk
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'darkred',
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    paddingHorizontal: 5,
  },
  followText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  followButton: {
    backgroundColor: 'darkred',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  post: {
    width: '45%',
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  postImage: {
    width: '100%',
    height: 150,
  },
  caption: {
    padding: 5,
    fontSize: 14,
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
