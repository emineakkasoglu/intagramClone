import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Add = ({ navigation }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image || !caption) {
      alert('Lütfen bir resim seçin ve açıklama girin!');
      return;
    }

    try {
      const db = getFirestore();

      // Firestore'a gönderiyi ekleme
      await addDoc(collection(db, 'posts'), {
        caption: caption,
        photoUrl: image,
        userId: getAuth().currentUser.uid, // Mevcut kullanıcı UID'si
        timestamp: new Date(), // Zaman damgası
      });

      alert('Gönderi başarıyla paylaşıldı!');
      navigation.navigate('Home'); // Başarıyla tamamlandıktan sonra Home ekranına yönlendir
    } catch (error) {
      console.error('Gönderi paylaşılırken bir hata oluştu:', error);
      alert('Bir hata meydana geldi, lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gönderi Ekle</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imagePickerText}>Fotoğraf/Video Seç</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Bir açıklama yaz..."
        value={caption}
        onChangeText={setCaption}
      />

      <TouchableOpacity style={styles.shareButton} onPress={handlePost}>
        <Text style={styles.shareButtonText}>Paylaş</Text>
      </TouchableOpacity>

      {/* Alt Navigasyon Butonları */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.iconItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home-outline" size={30} color="#000" />
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
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 140,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 45,
    color: 'gray',
  },
  imagePicker: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
  },
  imagePickerText: {
    fontSize: 16,
    color: '#666',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
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
  shareButton: {
    backgroundColor: 'darkred',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Add;
