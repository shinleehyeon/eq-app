import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Share
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useQuestsStore } from '@/store/challenges-store';
import { useUserStore } from '@/store/user-store';
import { fetchAuthorById } from '@/utils/firebase-helpers';
import Button from '@/components/Button';
import { 
  Award, 
  Calendar, 
  Clock, 
  FileImage, 
  Flag,
  Info, 
  Upload, 
  User,
  Users,
  Heart,
  X,
  MessageCircle,
  MoreVertical,
  Pencil,
  Trash2,
  Share2
} from 'lucide-react-native';
import { database } from '@/config/firebase';
import { ref, get, query, orderByChild, equalTo, set } from 'firebase/database';
import SubmissionCard from '@/components/SubmissionCard';

export default function CreativeQuestDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { openQuests, activeQuests, startQuest, abandonQuest } = useQuestsStore();
  const { user, users } = useUserStore();
  
  const [quest, setQuest] = useState(null);
  const [author, setAuthor] = useState(null);
  const [questSubmissions, setQuestSubmissions] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [reportComment, setReportComment] = useState('');
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [hasSubmission, setHasSubmission] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  useEffect(() => {
    const fetchQuestAndAuthor = async () => {
      if (id) {
        // Check if quest is active
        if (activeQuests.includes(id.toString())) {
          setIsActive(true);
        }
        
        // Check if quest is completed
        if (user?.completedQuests?.includes(id.toString())) {
          setIsCompleted(true);
        }
        
        // Find the quest in openQuests
        const foundQuest = openQuests.find((q) => q.id === id);
        if (foundQuest) {
          setQuest(foundQuest);
          
          // Find the author
          if (foundQuest.authorId) {
            const questAuthor = await fetchAuthorById(foundQuest.authorId);
            setAuthor(questAuthor || null);
          }
        }
      }
    };
    
    fetchQuestAndAuthor();
  }, [id, activeQuests, user, openQuests, users]);

  // In the quest detail screen for open quests (creative-challenge/[id].tsx)
  // Add this to make sure the quest is marked as active
  useEffect(() => {
    if (id && !activeQuests.includes(id.toString())) {
      // If the quest is not already active, set it as active
      startQuest(id.toString());
    }
  }, [id, activeQuests]);
  
  // Fetch submissions for this quest directly from Firebase
  useEffect(() => {
    const fetchSubmissionsForQuest = async () => {
      if (!id) return;
  
      setIsLoadingSubmissions(true);
      try {
        console.log('Fetching submissions for quest:', id);
  
        // Get all submissions from Firebase
        const submissionsRef = ref(database, 'questSubmissions');
        const snapshot = await get(submissionsRef);
  
        if (snapshot.exists()) {
          const allSubmissions = snapshot.val();
          console.log('All submissions:', allSubmissions);
  
          // Check if user has submission
          const userSubmission = Object.values(allSubmissions).find(
            (submission: any) => 
              submission.questId === id.toString() && 
              submission.userId === user?.id
          );
          setHasSubmission(!!userSubmission);

          // Filter submissions for this quest
          const filteredSubmissions = await Promise.all(
            Object.values(allSubmissions).map(async (submission) => {
              if (submission.questId === id.toString()) {
                // Fetch author data for each submission
                const authorData = await fetchAuthorById(submission.userId);
                return {
                  ...submission,
                  userName: authorData?.name || 'Anonymous',
                  avatarUrl: authorData?.avatarUrl || null,
                };
              }
              return null;
            })
          );
  
          // Remove null values from the filtered submissions
          const validSubmissions = filteredSubmissions.filter((submission) => submission !== null);
  
          console.log('Filtered submissions for quest:', validSubmissions);
  
          // Sort by badge count (highest first)
          const sortedSubmissions = validSubmissions.sort(
            (a, b) => b.badgeCount - a.badgeCount
          );
  
          setQuestSubmissions(sortedSubmissions);
        } else {
          console.log('No submissions found');
          setQuestSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };
  
    // Call the async function
    fetchSubmissionsForQuest();
  }, [id, user]);

  const handleDeleteQuest = async () => {
    Alert.alert(
      "Delete Quest",
      "Are you sure you want to delete this quest?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const questRef = ref(database, `openQuests/${id}`);
              await set(questRef, {
                ...quest,
                isDeleted: true,
                deletedAt: new Date().toISOString()
              });
              router.back();
            } catch (error) {
              console.error('Error deleting quest:', error);
              Alert.alert('Error', 'Failed to delete quest');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this quest: ${quest.title}\n\n${quest.description}`,
        title: quest.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderHeaderRight = () => {
    return (
      <TouchableOpacity 
        onPress={() => setMenuVisible(true)}
        style={styles.headerButton}
      >
        <MoreVertical size={24} color={colors.text} />
      </TouchableOpacity>
    );
  };

  const renderMenuItems = () => {
    if (user?.id === quest?.authorId) {
      return (
        <>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push(`/edit-creative-quest/${id}`);
            }}
          >
            <Pencil size={20} color={colors.text} />
            <Text style={styles.menuText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              handleDeleteQuest();
            }}
          >
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.menuText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </>
      );
    }
    
    return (
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => {
          setMenuVisible(false);
          handleReportQuest();
        }}
      >
        <Flag size={20} color={colors.error} />
        <Text style={[styles.menuText, { color: colors.error }]}>Report</Text>
      </TouchableOpacity>
    );
  };

  if (!quest) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const calculateDaysLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Last day';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };
  
  const handleStartQuest = () => {
    startQuest(quest.id);
    setIsActive(true);
    
    Alert.alert(
      "Quest Started!",
      `You've started the "${quest.title}" quest. Get creative and submit your work!`,
      [{ text: "OK" }]
    );
  };
  
  const handleSubmit = async () => {
    // Navigate to the Submit Your Work screen with the quest pre-selected
    router.push(`/submit-creative-works?questId=${id}`);
  };
  
  const handleAuthorPress = () => {
    if (author && !author.settings?.privateProfile) {
      router.push(`/user-profile/${author.id}`);
    }
  };
  
  const shouldShowAuthor = () => {
    return author && (!author.settings?.hideAuthoredQuests || author.authorId === user?.id);
  };
  
  const handleReportQuest = () => {
    setReportModalVisible(true);
  };
  
  const submitReport = async () => {
    try {
      // Simulate sending the report to a server
      console.log(`Reporting creative challenge ${quest.id} for reason: ${reportReason}, comment: ${reportComment}`);

      // Simulate a delay for the server response
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        "Report Submitted",
        "Thank you for helping keep our community focused on climate action. Our team will review this challenge.",
        [{ text: "OK" }]
      );

      // Close the modal
      setReportModalVisible(false);
      setReportReason(null);
      setReportComment('');
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an issue submitting your report. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };
  
  const handleAbandonQuest = () => {
    setIsActive(false);
    Alert.alert(
      "Abandon Quest",
      "Are you sure you want to abandon this quest? Your progress will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Abandon",
          style: "destructive",
          onPress: () => {
            abandonQuest(quest.id);
            setIsActive(false);
            router.back();
          }
        }
      ]
    );
  };

  const handleCompleteQuest = () => {
    if (!user?.id || !quest?.id) return;

    Alert.alert(
      "Complete Quest",
      "Are you sure you want to mark this quest as completed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Complete",
          style: "default",
          onPress: async () => {
            try {
              // Save to Firebase
              const completedQuestRef = ref(database, `users/${user.id}/openQuestCompleted/${quest.id}`);
              await set(completedQuestRef, {
                completedAt: new Date().toISOString(),
                questId: quest.id,
                questType: 'creative'
              });

              // Update local state
              startQuest(quest.id, true);
              setIsCompleted(true);

              Alert.alert("Success", "Quest marked as completed!");
            } catch (error) {
              console.error('Error completing quest:', error);
              Alert.alert("Error", "Failed to mark quest as completed. Please try again.");
            }
          }
        }
      ]
    );
  };

  // Helper function to format impact if it's an object
  const formatImpact = (impact: string | { co2Reduction?: number, waterSaved?: number, energySaved?: number } | undefined) => {
    if (!impact) return "No impact data available";
    
    if (typeof impact === 'string') {
      return impact;
    }
    
    // If impact is an object, format it as a string
    const parts = [];
    if (impact.co2Reduction) parts.push(`CO2 Reduction: ${impact.co2Reduction} kg`);
    if (impact.waterSaved) parts.push(`Water Saved: ${impact.waterSaved} liters`);
    if (impact.energySaved) parts.push(`Energy Saved: ${impact.energySaved} kWh`);
    
    return parts.length > 0 ? parts.join('\n') : "Impact details not specified";
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: quest.title,
          headerTitleStyle: styles.headerTitle,
          headerRight: renderHeaderRight,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={{ uri: quest.imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.typeBadge}>
              <FileImage size={14} color="white" />
              <Text style={styles.typeText}>
                {quest.submissionType ? quest.submissionType.charAt(0).toUpperCase() + quest.submissionType.slice(1) : 'Photo'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.title}>{quest.title}</Text>
          
          {shouldShowAuthor() && (
            <TouchableOpacity 
              style={styles.authorContainer}
              onPress={handleAuthorPress}
              disabled={!author || author.settings?.privateProfile}
            >
              <User size={16} color={colors.textSecondary} />
              <Text style={styles.authorText}>
                Created by {author ? author.name : "Anonymous"}
              </Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.description}>{quest.description}</Text>
          
          <View style={styles.deadlineContainer}>
            <Calendar size={20} color={colors.primary} />
            <View style={styles.deadlineInfo}>
              <Text style={styles.deadlineLabel}>Submission Deadline:</Text>
              <Text style={styles.deadlineText}>
                {quest.submissionDeadline ? new Date(quest.submissionDeadline).toLocaleDateString() : 'N/A'} 
                ({quest.submissionDeadline ? calculateDaysLeft(quest.submissionDeadline) : 'N/A'})
              </Text>
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statValue}>{quest.duration}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            
            <View style={styles.statItem}>
              <Users size={20} color={colors.primary} />
              <Text style={styles.statValue}>{questSubmissions.length}</Text>
              <Text style={styles.statLabel}>Submissions</Text>
            </View>
            
            {quest.isCollaborative && (
              <View style={styles.statItem}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.statValue}>{quest.maxParticipants}</Text>
                <Text style={styles.statLabel}>Team Size</Text>
              </View>
            )}
          </View>
          
          {quest.steps && quest.steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Participate</Text>
              {quest.steps.map((step: string, index: number) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environmental Impact</Text>
            <View style={styles.impactContainer}>
              <Info size={24} color={colors.primary} style={styles.impactIcon} />
              <Text style={styles.impactText}>{formatImpact(quest.impact)}</Text>
            </View>
          </View>
          
          {isActive && !isCompleted && (
            <>
              <Button 
                title="Submit Your Work" 
                onPress={() => router.push(`/submit-creative-works?questId=${id}`)} 
                style={[styles.actionButton, styles.buttonSpacing]}
              />
              {!isCompleted && hasSubmission ? (
                <Button 
                  title="Complete Quest" 
                  onPress={handleCompleteQuest}
                  color={colors.success}
                  style={styles.completeButton}
                />
              ) : !isCompleted && (
                <Button 
                  title="Abandon Quest" 
                  onPress={handleAbandonQuest}
                  variant="outline"
                  color={colors.success}
                  style={styles.abandonButton}
                />
              )}
            </>
          )}
          
          {!isActive && !isCompleted && (
            <Button 
              title="Start Quest" 
              onPress={handleStartQuest}
              style={styles.startButton}
            />
          )}
          
          {/* Submissions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Submissions</Text>
            
            {isLoadingSubmissions ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading submissions...</Text>
              </View>
            ) : questSubmissions.length > 0 ? (
              <View>
                {questSubmissions.map((submission) => (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    onPress={() => router.push(`/submission-detail/${submission.id}`)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptySubmissions}>
                <Text style={styles.emptySubmissionsText}>
                  No submissions yet. Be the first to submit your work!
                </Text>
                <Button 
                  title="Submit Your Work" 
                  onPress={() => router.push(`/submit-creative-works?questId=${id}`)} 
                  style={styles.emptySubmissionsButton}
                  variant="outline"
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Challenge</Text>
              <TouchableOpacity 
                onPress={() => setReportModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              Please select a reason for reporting this challenge:
            </Text>
            
            <View style={styles.reasonsContainer}>
              {[
                "Not Related to Climate Action",
                "Inappropriate Content",
                "Misleading Information",
                "Duplicate Challenge",
                "Other"
              ].map((reason) => (
                <TouchableOpacity 
                  key={reason}
                  style={[
                    styles.reasonItem,
                    reportReason === reason && styles.reasonItemSelected
                  ]}
                  onPress={() => setReportReason(reason)}
                >
                  <View style={[
                    styles.radioButton,
                    reportReason === reason && styles.radioButtonSelected
                  ]}>
                    {reportReason === reason && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.inputLabel}>Additional Comments:</Text>
            <TextInput
              style={styles.commentInput}
              multiline
              numberOfLines={4}
              placeholder="Please provide more details about your report..."
              value={reportComment}
              onChangeText={setReportComment}
            />
            
            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                variant="outline"
                onPress={() => setReportModalVisible(false)}
                style={styles.modalButton}
              />
              <Button 
                title="Submit Report" 
                onPress={submitReport}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {renderMenuItems()}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleShare();
              }}
            >
              <Share2 size={20} color={colors.text} />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  reportButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  submissionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 20,
    marginRight: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    ...typography.heading2,
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15', // Primary color with 15% opacity
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  deadlineInfo: {
    marginLeft: 12,
  },
  deadlineLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  deadlineText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepText: {
    ...typography.body,
    flex: 1,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  impactIcon: {
    marginRight: 12,
  },
  impactText: {
    ...typography.body,
    flex: 1,
  },
  submitButton: {
    marginBottom: 24,
  },
  startButton: {
    marginBottom: 24,
  },
  abandonButton: {
    marginBottom: 24,
  },
  completeButton: {
    marginBottom: 24,
  },
  buttonSpacing: {
    marginBottom: 12,
  },
  submissionsSection: {
    marginTop: 8,
  },
  emptySubmissions: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.heading3,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSubtitle: {
    ...typography.body,
    marginBottom: 16,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reasonItemSelected: {
    backgroundColor: colors.primary + '15',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    backgroundColor: colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  reasonText: {
    ...typography.body,
  },
  inputLabel: {
    ...typography.body,
    marginBottom: 8,
  },
  commentInput: {
    height: 100,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  submissionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  submissionImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.border,
  },
  submissionContent: {
    padding: 16,
  },
  submissionTitle: {
    ...typography.heading4,
    marginBottom: 4,
  },
  submissionDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  submissionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submissionAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submissionAuthorText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  submissionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submissionBadgeCount: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeItemSpace: {
    marginLeft: 12,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptySubmissionsText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptySubmissionsButton: {
    minWidth: 160,
  },
  menuContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    ...typography.body,
  },
  headerButton: {
    padding: 8,
  },
});