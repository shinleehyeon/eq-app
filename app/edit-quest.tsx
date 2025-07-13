import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from '@/components/Button';
import { Camera, Image as ImageIcon, Upload, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { database, storage } from '@/config/firebase';
import { ref as dbRef, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useUserStore } from '@/store/user-store';
import Slider from '@react-native-community/slider';

export default function EditQuestScreen() {
  const router = useRouter();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Environmental');
  const [difficulty, setDifficulty] = useState('medium');
  const [imageUri, setImageUri] = useState(null);
  const [impact, setImpact] = useState('');
  const [duration, setDuration] = useState(1440); // Default 1 day (1440 minutes = 24 hours * 60)
  const [steps, setSteps] = useState(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper function to format duration
  const formatDuration = (minutes) => {
    const days = minutes / 1440; // Convert minutes to days
    
    if (days === 1) {
      return '1 day';
    } else {
      return `${days} days`;
    }
  };

  // Request permissions for camera and media library
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and media library permissions to upload images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  // Take a photo with camera
  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Clear selected image
  const clearImage = () => {
    setImageUri(null);
  };

  // Upload image to Firebase Storage
  const uploadImage = async () => {
    if (!imageUri) return null;

    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create a storage reference
      const filename = `quest_images/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const imageRef = storageRef(storage, filename);
      
      // Upload the blob
      const uploadTask = await uploadBytes(imageRef, blob);
      
      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Add function to handle steps
  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const updateStep = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  // Submit the form
  const handleSubmit = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for the quest.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description for the quest.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image for the quest.');
      return;
    }

    if (!impact.trim()) {
      Alert.alert('Missing Information', 'Please describe the impact of this quest.');
      return;
    }

    if (!duration) {
      Alert.alert('Missing Information', 'Please specify the estimated duration.');
      return;
    }

    // Filter out empty steps
    const filteredSteps = steps.filter(step => step.trim().length > 0);
    if (filteredSteps.length === 0) {
      Alert.alert('Missing Steps', 'Please add at least one step for the quest.');
      return;
    }

    if (!user || !user.id) {
      Alert.alert('Authentication Required', 'Please sign in to create a quest.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Upload image first
      setUploadProgress(30);
      const imageUrl = await uploadImage();
      setUploadProgress(70);

      if (!imageUrl) {
        throw new Error('Failed to upload image');
      }

      // Create a new quest in Firebase
      const questsRef = dbRef(database, 'openQuests');
      const newQuestRef = push(questsRef);
      
      const questData = {
        id: newQuestRef.key,
        title,
        description,
        category,
        difficulty,
        imageUrl,
        impact,
        duration,
        steps: filteredSteps,
        createdAt: new Date().toISOString(),
        userId: user.id,
        active: true
      };
      
      await set(newQuestRef, questData);
      setUploadProgress(100);
      
      Alert.alert(
        'Success!',
        'Your quest has been created successfully.',
        [
          { 
            text: 'View Quest', 
            onPress: () => router.push(`/creative-challenge/${newQuestRef.key}`) 
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setCategory('Environmental');
              setDifficulty('medium');
              setImageUri(null);
              setImpact('');
              setDuration(1440);
              setSteps(['']);
              setIsSubmitting(false);
              setUploadProgress(0);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating quest:', error);
      Alert.alert('Error', 'Failed to create quest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Environmental', 'Social', 'Innovation', 'Education', 'Community'];
  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Create New Quest',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Quest Details</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a catchy title for your quest"
            placeholderTextColor={colors.textSecondary}
            maxLength={50}
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what participants need to do"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.selectedCategory
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    category === cat && styles.selectedCategoryText
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyContainer}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.difficultyOption,
                  difficulty === option.value && styles.selectedDifficulty,
                  option.value === 'easy' && styles.easyDifficulty,
                  option.value === 'medium' && styles.mediumDifficulty,
                  option.value === 'hard' && styles.hardDifficulty,
                ]}
                onPress={() => setDifficulty(option.value)}
              >
                <Text 
                  style={[
                    styles.difficultyText,
                    difficulty === option.value && styles.selectedDifficultyText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Impact</Text>
          <TextInput
            style={styles.input}
            value={impact}
            onChangeText={setImpact}
            placeholder="Describe the impact of this quest"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Estimated Duration (Days)</Text>
          <View style={styles.durationContainer}>
            <Text style={styles.durationValue}>{formatDuration(duration)}</Text>
            <Slider
              style={styles.slider}
              minimumValue={1440} // 1 day
              maximumValue={86400} // 60 days
              step={1440} // Increment by 1 day
              value={duration}
              onValueChange={setDuration}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
            <View style={styles.durationLabels}>
              <Text style={styles.durationLabel}>1 day</Text>
              <Text style={styles.durationLabel}>60 days</Text>
            </View>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Steps</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <TextInput
                style={styles.input}
                value={step}
                onChangeText={(value) => updateStep(index, value)}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity
                style={styles.removeStepButton}
                onPress={() => removeStep(index)}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
            <Text style={styles.addStepText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Quest Image</Text>
          
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.clearImageButton}
                onPress={clearImage}
              >
                <X size={24} color={colors.background} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerContainer}>
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={takePhoto}
              >
                <Camera size={24} color={colors.primary} />
                <Text style={styles.imagePickerText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <ImageIcon size={24} color={colors.primary} />
                <Text style={styles.imagePickerText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <Button
          title="Edit Quest"
          icon={<Upload size={18} color={colors.background} />}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
        
        {isSubmitting && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${uploadProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress < 100 ? 'Creating quest...' : 'Quest created!'}
            </Text>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.heading3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    ...typography.body,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryOption: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedCategoryText: {
    color: colors.background,
    fontWeight: '600',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedDifficulty: {
    borderWidth: 2,
  },
  easyDifficulty: {
    borderColor: '#4CAF50',
  },
  mediumDifficulty: {
    borderColor: '#FF9800',
  },
  hardDifficulty: {
    borderColor: '#F44336',
  },
  difficultyText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  selectedDifficultyText: {
    fontWeight: '700',
  },
  pointsInput: {
    maxWidth: 120,
  },
  imagePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePickerButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  imagePickerText: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: 8,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  clearImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeStepButton: {
    marginLeft: 8,
  },
  addStepButton: {
    marginTop: 8,
  },
  addStepText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  toggleIndicatorActive: {
    alignSelf: 'flex-end',
  },
  toggleDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  submitButton: {
    marginTop: 16,
  },
  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  durationContainer: {
    marginBottom: 8,
  },
  durationValue: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  durationLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  durationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});