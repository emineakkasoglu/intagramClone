import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, query, collection, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { SearchBar } from 'react-native-elements';

const SearchPage = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [userList, setUserList] = useState([]); // Arama sonuçları

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async (text) => {
    setSearch(text);

    if (text.trim()) {
      const db = getFirestore();
      const usersQuery = query(
        collection(db, 'users'),
        where('username', '>=', text),
        where('username', '<=', text + '\uf8ff') // Firebase'te prefix arama yapar
      );

      const querySnapshot = await getDocs(usersQuery);
      const users = querySnapshot.docs.map((doc) => doc.data());
      setUserList(users); // Arama sonuçlarını güncelle
    } else {
      setUserList([]); // Arama boşsa, kullanıcıları sıfırla
    }
  };

  const handleProfileNavigation = (userId) => {
    navigation.navigate('Profile', { userId }); // Profil sayfasına yönlendir
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
      {/* Top Bar: SearchBar */}
      <View style={styles.topbar}>
        <SearchBar
          placeholder="Kullanıcı ara..."
          onChangeText={handleSearch}
          value={search}
          lightTheme
          round
          containerStyle={styles.searchContainer}
          inputContainerStyle={styles.searchInputContainer}
        />
      </View>

      {/* Arama Sonuçları */}
      <View style={styles.content}>
        <ScrollView>
          {userList.map((userItem, index) => (
            <TouchableOpacity key={index} style={styles.userItem} onPress={() => handleProfileNavigation(userItem.uid)}>
              <Text style={styles.username}>{userItem.username}</Text>
            </TouchableOpacity>
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
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topbar: {
    height: 100,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  searchContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginTop: 35,
  },
  searchInputContainer: {
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchPage;
