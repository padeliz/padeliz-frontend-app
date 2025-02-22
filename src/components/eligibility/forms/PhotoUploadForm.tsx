import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { spacing } from '@/theme/spacing';

interface PhotoUploadFormProps {
  onSubmit: (photos: FormData) => void;
}

export function PhotoUploadForm({ onSubmit }: PhotoUploadFormProps) {
  const [photos, setPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0]]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0]]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo-${index}.jpg`,
      } as any);
    });
    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Profile Photos
      </Text>

      <Text style={styles.description}>
        Please provide clear photos of yourself. Multiple photos increase approval chances.
      </Text>

      <View style={styles.photoGrid}>
        {photos.map((photo, index) => (
          <Card key={index} style={styles.photoCard}>
            <Card.Cover source={{ uri: photo.uri }} style={styles.photo} />
            <Card.Actions>
              <Button onPress={() => removePhoto(index)}>Remove</Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={pickImage}
          icon="image"
          style={styles.button}
        >
          Choose Photo
        </Button>
        <Button
          mode="outlined"
          onPress={takePhoto}
          icon="camera"
          style={styles.button}
        >
          Take Photo
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={photos.length === 0}
      >
        Submit Photos
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
    color: '#666',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  photoCard: {
    width: '45%',
  },
  photo: {
    height: 150,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
