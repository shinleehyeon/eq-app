import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user-store';
import { useQuestsStore } from '@/store/challenges-store';
import { Image as ImageIcon, Camera, Upload, X } from 'lucide-react-native';
import { uploadImage } from '@/utils/firebase-helpers';
import { useCreativeSubmissionsStore } from '@/store/creative-submissions-store';
import { database } from '@/config/firebase';
import { ref, push, set } from 'firebase/database';

export default function SubmitCreativeWorkScreen() {
  const router = useRouter();
  const { questId } = useLocalSearchParams(); // Get questId from URL params
  const { user } = useUserStore();
  const { openQuests, activeQuests, startQuest } = useQuestsStore();
  const { addSubmission } = useCreativeSubmissionsStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [media, setMedia] = useState<string | null>(null);
  const [showQuestSelection, setShowQuestSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasDirectQuest, setHasDirectQuest] = useState(false);
  
  // Filter to only get creative quests that are active
  const activeCreativeQuests = useMemo(() => {
    if (!openQuests || !activeQuests) return [];
    
    // Only return quests that:
    // 1. Are in the activeQuests array (user has started them)
    // 2. Are creative quests (based on type or category)
    return openQuests.filter(quest => {
      const isActive = activeQuests.includes(quest.id);
      const isCreative = 
        quest.isCreativeChallenge || 
        quest.category === 'creative' ||
        quest.submissionType === 'photo' ||
        quest.submissionType === 'video';
      
      return isActive && isCreative;
    });
  }, [openQuests, activeQuests]);

  // Add console logs to help debug
  useEffect(() => {
    console.log('Active quests:', activeQuests);
    console.log('Open quests:', openQuests?.map(q => ({ id: q.id, title: q.title })));
    console.log('Filtered active creative quests:', activeCreativeQuests.map(q => ({ id: q.id, title: q.title })));
  }, [activeQuests, openQuests, activeCreativeQuests]);
  
  useEffect(() => {
    // If there's only one active creative quest, select it automatically
    if (activeCreativeQuests.length === 1) {
      setSelectedQuestId(activeCreativeQuests[0].id);
    }
  }, [activeCreativeQuests]);

  // Pre-select the quest if it was passed in URL params
  useEffect(() => {
    if (questId) {
      console.log('Quest ID from params:', questId);
      setSelectedQuestId(questId.toString());
      
      // If the quest isn't active yet, make it active
      if (activeQuests && !activeQuests.includes(questId.toString())) {
        startQuest(questId.toString());
      }
    }
  }, [questId, activeQuests]);

  // If we came directly from a quest, but the quest isn't showing as active, 
  // find that quest directly
  useEffect(() => {
    if (questId && openQuests && openQuests.length > 0 && activeCreativeQuests.length === 0) {
      // Find the quest directly from openQuests
      const directQuest = openQuests.find(q => q.id === questId);
      if (directQuest) {
        // Create a temporary array with just this quest
        const tempActiveQuests = [directQuest];
        setSelectedQuestId(directQuest.id);
        
        // Use this temporary array for rendering
        if (tempActiveQuests.length > 0) {
          console.log('Using direct quest as fallback');
          // Don't show the "no active quests" message
          setHasDirectQuest(true);
        }
      }
    }
  }, [questId, openQuests, activeCreativeQuests]);
  
  const getSelectedQuest = () => {
    if (!selectedQuestId) return null;
    return activeCreativeQuests.find(quest => quest.id === selectedQuestId);
  };
  
  const selectedQuest = getSelectedQuest();
  
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia(result.assets[0].uri);
    }
  };
  
  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMedia(result.assets[0].uri);
    }
  };
  
  const clearMedia = () => {
    setMedia(null);
  };
  
  const handleSubmitWork = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }
    
    if (!selectedQuestId) {
      Alert.alert('Error', 'Please select a quest');
      return;
    }
    
    if (!media) {
      Alert.alert('Error', 'Please upload an image of your work');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload the image first
      const mediaUrl = await uploadImage(
        media, 
        `submissions/${user?.id}/${Date.now()}`,
        progress => setUploadProgress(progress)
      );
      
      // Create submission object
      const submission = {
        id: Date.now().toString(), // We'll replace this with Firebase-generated ID
        userId: user?.id || '',
        questId: selectedQuestId,
        title,
        description,
        mediaUrl,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: [],
        badgeCount: 0,
        isApproved: false,
      };
      
      // Save to Firebase Realtime Database directly
      const submissionRef = push(ref(database, 'questSubmissions'));
      submission.id = submissionRef.key; // Use Firebase-generated ID
      
      await set(submissionRef, submission);
      
      // Also add to the local store for immediate UI update
      await addSubmission(submission);
      
      Alert.alert(
        'Success!', 
        'Your creative work has been submitted successfully',
        [{ text: 'OK', onPress: () => router.back() }] // Changed back to router.back()
      );
    } catch (error) {
      console.error('Error submitting work:', error);
      Alert.alert('Error', 'Failed to submit your work. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!activeQuests) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading quests...</Text>
      </View>
    );
  }
  
  if (activeCreativeQuests.length === 0 && !hasDirectQuest) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Submit Quest Work',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={[styles.container, styles.centerContainer]}>
          <Text style={styles.noQuestsText}>
            You don't have any active open quests.
          </Text>
          <Button 
            title="Find Creative Quests" 
            onPress={() => router.push('/open-quests')}
            style={styles.findQuestsButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Submit Creative Work',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          {/* Quest Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Active Quest</Text>
            <TouchableOpacity 
              style={styles.questSelector}
              onPress={() => setShowQuestSelection(!showQuestSelection)}
            >
              <Text style={[
                styles.selectedQuestText,
                !selectedQuest && styles.placeholderText
              ]}>
                {selectedQuest ? selectedQuest.title : 'Select an active quest'}
              </Text>
            </TouchableOpacity>
            
            {showQuestSelection && (
              <View style={styles.questDropdown}>
                {activeCreativeQuests.length > 0 ? (
                  activeCreativeQuests.map(quest => (
                    <TouchableOpacity
                      key={quest.id}
                      style={styles.questOption}
                      onPress={() => {
                        setSelectedQuestId(quest.id);
                        setShowQuestSelection(false);
                      }}
                    >
                      <Text style={styles.questOptionText}>{quest.title}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noQuestsOption}>
                    <Text style={styles.noQuestsText}>No active quests found</Text>
                    <Text style={styles.noQuestsSubtext}>Start a quest from the Open Quests screen</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your work a title"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          
          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your work"
              placeholderTextColor={colors.textSecondary}
              multiline
            />
          </View>
          
          {/* Media */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Upload Image</Text>
            {media ? (
              <View style={styles.mediaPreview}>
                <Image source={{ uri: media }} style={styles.mediaImage} />
                <TouchableOpacity style={styles.clearMediaButton} onPress={clearMedia}>
                  <X size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaButtons}>
                <TouchableOpacity style={styles.mediaButton} onPress={handleSelectImage}>
                  <ImageIcon size={24} color={colors.primary} />
                  <Text style={styles.mediaButtonText}>Choose Image</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mediaButton} onPress={handleTakePhoto}>
                  <Camera size={24} color={colors.primary} />
                  <Text style={styles.mediaButtonText}>Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.uploadProgressContainer}>
              <Text style={styles.uploadProgressText}>
                Uploading: {Math.round(uploadProgress)}%
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
            </View>
          )}
          
          {/* Submit Button */}
          <Button 
            title="Submit Work" 
            onPress={handleSubmitWork}
            isLoading={isSubmitting}
            leftIcon={<Upload size={18} color="white" />}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.heading3,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  formContainer: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.heading3,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  questSelector: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedQuestText: {
    ...typography.body,
    color: colors.text,
  },
  placeholderText: {
    color: colors.textSecondary,
  },
  questDropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  questOptionText: {
    ...typography.body,
    color: colors.text,
  },
  noQuestsOption: {
    padding: 12,
    alignItems: 'center',
  },
  noQuestsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noQuestsSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  mediaPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  clearMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaButtonText: {
    ...typography.body,
    color: colors.primary,
    marginTop: 8,
  },
  uploadProgressContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  uploadProgressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  submitButton: {
    marginTop: 16,
  },
  findQuestsButton: {
    alignSelf: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
});