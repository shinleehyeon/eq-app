import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from '@/components/Button';
import { Camera, X } from 'lucide-react-native';
import { View as MotiView } from 'moti';
import { apiClient } from '@/lib/api/client';

export default function AddEcoTipScreen() {
  const router = useRouter();
  const { user, accessToken } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    category: 'other',
    source: '',
    sourceLink: '',
    resourceType: 'eco tip',
    videoLink: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    { id: 'water', label: 'Water', color: '#03A9F4' },
    { id: 'waste', label: 'Waste', color: '#4CAF50' },
    { id: 'energy', label: 'Energy', color: '#FFC107' },
    { id: 'food', label: 'Food', color: '#FF5722' },
    { id: 'transport', label: 'Transport', color: '#2196F3' },
    { id: 'education', label: 'Education', color: '#3F51B5' },
    { id: 'advocacy', label: 'Advocacy', color: '#9C27B0' },
    { id: 'creative', label: 'Creative', color: '#E91E63' },
    { id: 'other', label: 'Other', color: colors.primary }
  ];

  const resourceTypes = [
    { id: 'eco tip', label: 'Eco Tip', color: '#2196F3' },
    { id: 'article', label: 'Article', color: '#4CAF50' },
    { id: 'video', label: 'Video', color: '#FFC107' }
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert('Error', 'Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map resourceType to API type format
      const typeMapping: { [key: string]: string } = {
        'eco tip': 'eco_tips',
        'article': 'articles', 
        'video': 'videos'
      };

      // Call API to create learning content
      const learningData: any = {
        title: formData.title,
        content: formData.content,
        type: typeMapping[formData.resourceType] || 'eco_tips',
        category: formData.category,
        difficulty: 'beginner',
        status: 'published',
        thumbnail: 'https://example.com/thumbnail.jpg',
        viewCount: 0,
        likeCount: 0
      };

      // Only add links for video type
      if (formData.resourceType === 'video' && formData.videoLink) {
        learningData.links = [formData.videoLink];
      }

      const apiResponse = await apiClient.createLearning(learningData, accessToken || undefined);

      if (apiResponse.success) {
        Alert.alert(
          'Success',
          'Your eco tip has been submitted!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', apiResponse.error || 'Failed to submit eco tip. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting eco tip:', error);
      Alert.alert('Error', 'Failed to submit eco tip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Add Eco Tip',
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Content"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category & Type</Text>

          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    formData.category === category.id && {
                      backgroundColor: category.color + '20',
                      borderColor: category.color,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.category === category.id && {
                        color: category.color,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                  {formData.category === category.id && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={[
                        styles.categorySelectedDot,
                        { backgroundColor: category.color },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.categoriesGrid}>
              {resourceTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.categoryButton,
                    formData.resourceType === type.id && {
                      backgroundColor: type.color + '20',
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, resourceType: type.id })}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.resourceType === type.id && {
                        color: type.color,
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                  {formData.resourceType === type.id && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={[
                        styles.categorySelectedDot,
                        { backgroundColor: type.color },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.resourceType === 'video' && (
            <TextInput
              style={styles.input}
              placeholder="YouTube Video Link"
              placeholderTextColor={colors.textSecondary}
              value={formData.videoLink}
              onChangeText={(text) => setFormData({ ...formData, videoLink: text })}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Media</Text>
          
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={pickImage}
          >
            <Camera size={24} color={colors.primary} />
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>

          {selectedImage && (
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: selectedImage.uri }} 
                style={styles.imagePreview} 
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <X size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Source Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Source (e.g., National Geographic)"
            placeholderTextColor={colors.textSecondary}
            value={formData.source}
            onChangeText={(text) => setFormData({ ...formData, source: text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Source Link"
            placeholderTextColor={colors.textSecondary}
            value={formData.sourceLink}
            onChangeText={(text) => setFormData({ ...formData, sourceLink: text })}
          />
        </View>

        <Button
          title="Submit"
          onPress={handleSubmit}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerWrapper: {
    marginBottom: 12,
  },
  label: {
    ...typography.bodySmall,
    marginBottom: 8,
    color: colors.textSecondary,
  },
  pickerContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: colors.card,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  categoryButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categorySelectedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  uploadButtonText: {
    ...typography.body,
    marginLeft: 8,
    color: colors.primary,
  },
  previewContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 4,
  },
  submitButton: {
    marginBottom: 24,
  },
});
