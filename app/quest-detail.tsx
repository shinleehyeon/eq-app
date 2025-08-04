import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { ArrowLeft, Clock, Coins, Users, Camera, MapPin, Leaf, CheckCircle, Share2 } from 'lucide-react-native';
import Button from '@/components/Button';
import { useQuestsStore } from '@/store/challenges-store';
import { useUserStore } from '@/store/user-store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function QuestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const questId = params.id as string;
  
  const { dailyQuests, openQuests, activeQuests, acceptQuest, completeQuest, selectQuest, unselectQuest } = useQuestsStore();
  const { user } = useUserStore();
  
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofText, setProofText] = useState('');
  const [proofImage, setProofImage] = useState('');
  
  // Find the quest from either daily or open quests
  const quest = [...dailyQuests, ...openQuests].find(q => q.id === questId);
  const isActive = activeQuests.includes(questId);
  const isCompleted = user?.completedQuests?.includes(questId);
  const canSelectMore = activeQuests.length < 5;
  
  if (!quest) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Quest not found</Text>
      </SafeAreaView>
    );
  }
  
  const handleSelectQuest = () => {
    if (isActive) {
      unselectQuest(questId);
    } else if (canSelectMore) {
      selectQuest(questId);
    }
  };

  const handleAcceptQuest = () => {
    acceptQuest(questId);
  };
  
  const handleCompleteQuest = () => {
    setShowProofModal(true);
  };
  
  const submitProof = () => {
    completeQuest(questId, proofText || proofImage);
    setShowProofModal(false);
    setProofText('');
    setProofImage('');
    router.back();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {quest.imageUrl ? (
            <Image source={{ uri: quest.imageUrl }} style={styles.heroImage} />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Leaf size={60} color={colors.white} />
            </View>
          )}
          <View style={styles.heroOverlay} />
          
          {/* Quest Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{quest.category}</Text>
          </View>
          
          {/* Difficulty Badge */}
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(quest.difficulty) }]}>
            <Text style={styles.difficultyText}>{quest.difficulty}</Text>
          </View>
        </View>
        
        {/* Quest Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{quest.title}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Coins size={16} color={colors.warning} />
              <Text style={styles.statText}>{quest.points} points</Text>
            </View>
            
            <View style={styles.statItem}>
              <Clock size={16} color={colors.info} />
              <Text style={styles.statText}>{quest.duration || '30 min'}</Text>
            </View>
            
            {quest.participants && (
              <View style={styles.statItem}>
                <Users size={16} color={colors.success} />
                <Text style={styles.statText}>{quest.participants} joined</Text>
              </View>
            )}
          </View>
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About this Quest</Text>
            <Text style={styles.description}>{quest.description}</Text>
          </View>
          
          {/* Requirements */}
          {quest.requirements && (
            <View style={styles.requirementsContainer}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {quest.requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <CheckCircle size={16} color={colors.primary} />
                  <Text style={styles.requirementText}>{req}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Tips */}
          {quest.tips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.sectionTitle}>💡 Tips</Text>
              <Text style={styles.tipsText}>{quest.tips}</Text>
            </View>
          )}
          
          {/* Impact */}
          {quest.impact && (
            <View style={styles.impactContainer}>
              <Text style={styles.sectionTitle}>🌍 Environmental Impact</Text>
              <Text style={styles.impactText}>{quest.impact}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Action Button */}
      <View style={styles.actionContainer}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.completedText}>Quest Completed!</Text>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <Button
              title={isActive ? "Remove from My Quests" : "Select Quest"}
              onPress={handleSelectQuest}
              style={isActive ? [styles.selectButton, styles.removeButton] : styles.selectButton}
              disabled={!isActive && !canSelectMore}
            />
            <Button
              title="Complete Quest"
              onPress={handleCompleteQuest}
              style={!isActive ? [styles.completeButton, styles.disabledButton] : styles.completeButton}
              disabled={!isActive}
            />
          </View>
        )}
      </View>
      
      {/* Proof Submission Modal */}
      <Modal
        visible={showProofModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProofModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Proof</Text>
              <TouchableOpacity onPress={() => setShowProofModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Share how you completed this quest! You can write about your experience or upload a photo.
            </Text>
            
            <TextInput
              style={styles.proofInput}
              placeholder="Describe what you did..."
              value={proofText}
              onChangeText={setProofText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity style={styles.photoButton}>
              <Camera size={20} color={colors.primary} />
              <Text style={styles.photoButtonText}>Add Photo</Text>
            </TouchableOpacity>
            
            <Button
              title="Submit Proof"
              onPress={submitProof}
              style={styles.submitButton}
              disabled={!proofText && !proofImage}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return colors.success;
    case 'medium':
      return colors.warning;
    case 'hard':
      return colors.error;
    default:
      return colors.info;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    position: 'relative',
    height: screenHeight * 0.3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryBadge: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 100,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    ...typography.heading1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  requirementsContainer: {
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  tipsContainer: {
    backgroundColor: colors.info + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsText: {
    ...typography.body,
    color: colors.text,
  },
  impactContainer: {
    backgroundColor: colors.success + '20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  impactText: {
    ...typography.body,
    color: colors.text,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '20',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.heading2,
  },
  cancelText: {
    ...typography.body,
    color: colors.primary,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  proofInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
    marginBottom: 16,
    minHeight: 100,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  photoButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
  },
});