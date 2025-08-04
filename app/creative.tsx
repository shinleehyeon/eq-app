import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useQuestsStore } from '@/store/challenges-store';
import SubmissionCard from '@/components/SubmissionCard';
import Button from '@/components/Button';
import { Award, FileImage, Plus, Users, Heart, MessageCircle } from 'lucide-react-native';
import mockCreativeChallenges from '@/mocks/creative-challenges';
import mockCreativeSubmissions from '@/mocks/creative-submissions';
import QuestCard from '@/components/QuestCard'; // Use the correct QuestCard component

// Define a type for submissions from Firebase
interface Submission {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  userId: string;
  questId: string;
  likes: number;
  createdAt: string;
  badgeCount: number;
  comments?: Record<string, any>; // Add comments property
}

// Add this interface for OpenQuest
interface OpenQuest {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  category: string;
  difficulty: string;
  isCreativeChallenge: boolean;
  points: number;
  authorId: string; // ID of the author
}

interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function CreativeScreen() {
  const router = useRouter();
  const [topSubmissions, setTopSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openQuests, setOpenQuests] = useState<OpenQuest[]>([]);
  const [isLoadingQuests, setIsLoadingQuests] = useState(true);
  const [authors, setAuthors] = useState<Record<string, Author | null>>({});

  const { 
    activeQuests
  } = useQuestsStore();

  
  // Fetch top submissions from mock data
  useEffect(() => {
    const fetchTopSubmissions = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock data
        const submissionsArray = mockCreativeSubmissions.map(submission => ({
          id: submission.id,
          title: submission.title,
          description: submission.description,
          mediaUrl: submission.imageUrl,
          userId: submission.userId,
          questId: submission.challengeId || submission.id,
          likes: submission.votes || 0,
          createdAt: submission.submissionDate,
          badgeCount: submission.votes || 0,
          comments: submission.comments
        }));
        
        // Sort by likes (highest first)
        const sortedSubmissions = submissionsArray.sort((a, b) => 
          (b.likes || 0) - (a.likes || 0)
        );
        
        // Take only the top 3
        const top3Submissions = sortedSubmissions.slice(0, 3);
        
        setTopSubmissions(top3Submissions);
        
        // Set mock author data
        const mockAuthors: Record<string, Author> = {
          'user456': { id: 'user456', name: 'Maya Johnson', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956' },
          'user789': { id: 'user789', name: 'Jamal Wilson', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
          'user101': { id: 'user101', name: 'Sophia Chen', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2' },
          'user202': { id: 'user202', name: 'Liam Rodriguez', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
          'user303': { id: 'user303', name: 'Emma Taylor', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' }
        };
        setAuthors(mockAuthors);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setTopSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopSubmissions();
  }, []);
  
  // Fetch open quests from mock data
  useEffect(() => {
    const fetchOpenQuests = async () => {
      setIsLoadingQuests(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use mock creative challenges
        const questsArray = mockCreativeChallenges.filter(challenge => 
          challenge.isCreativeChallenge
        ).map(challenge => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          imageUrl: challenge.imageUrl,
          createdAt: challenge.submissionDeadline || new Date().toISOString(),
          category: challenge.category,
          difficulty: challenge.difficulty,
          isCreativeChallenge: true,
          points: challenge.points,
          authorId: 'system'
        }));
        
        // Sort by createdAt (newest first)
        const sortedQuests = questsArray.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          
        // Take only the 3 latest quests
        const latestQuests = sortedQuests.slice(0, 3);
        
        setOpenQuests(latestQuests);
      } catch (error) {
        console.error('Error fetching open quests:', error);
        setOpenQuests([]);
      } finally {
        setIsLoadingQuests(false);
      }
    };
    
    fetchOpenQuests();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Community Hub',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Explore Quests</Text>
            <Text style={styles.bannerSubtitle}>
              Showcase your creativity and inspire others to take action
            </Text>
            <Button 
              title="Explore Now" 
              onPress={() => router.push('/open-quests')}
              style={styles.bannerButton}
            />
          </View>
          <FileImage size={100} color={colors.primaryLight} style={styles.bannerIcon} />
        </View>
        
        {/* Top Submissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Submissions</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/submissions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading submissions...</Text>
            </View>
          ) : topSubmissions.length > 0 ? (
            topSubmissions.map(submission => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                onPress={() => router.push(`/submission-detail/${submission.id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No submissions yet.</Text>
            </View>
          )}
        </View>
        
        {/* Submit Your Work CTA */}
        <View style={styles.submitSection}>
          <View style={styles.submitContent}>
            <Text style={styles.submitTitle}>Share Your Impact</Text>
            <Text style={styles.submitDescription}>
              Complete open quests and submit your work to inspire others
            </Text>
            <Button 
              title="Submit Your Work" 
              icon={<Plus size={18} color={colors.background} />}
              onPress={() => router.push('/submit-creative-works')}
              style={styles.submitButton}
            />
          </View>
        </View>
        
        {/* Open Quests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Open Quests</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/open-quests')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingQuests ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Loading quests...</Text>
            </View>
          ) : openQuests.length > 0 ? (
            openQuests.map(quest => (
              <QuestCard 
                  key={quest.id}
                  challenge={quest}
                  isActive={activeQuests.includes(quest.id)}
                  onPress={(quest) => router.push(`/creative-challenge/${quest.id}`)}
                  showAuthor={true} // Show author for Open Quests
                />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No open quests available.</Text>
            </View>
          )}
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
  headerTitle: {
    ...typography.heading3,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  banner: {
    backgroundColor: colors.primaryLight + '20',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.heading2,
    marginBottom: 8,
  },
  bannerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  bannerButton: {
    alignSelf: 'flex-start',
  },
  bannerIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.3,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.heading3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  submitSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  submitContent: {
    alignItems: 'center',
  },
  submitTitle: {
    ...typography.heading3,
    marginBottom: 8,
    textAlign: 'center',
  },
  submitDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    minWidth: 180,
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  questContent: {
    padding: 16,
  },
  questCategoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questCategory: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  questDifficulty: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  easyDifficulty: {
    color: colors.success,
  },
  mediumDifficulty: {
    color: colors.warning,
  },
  hardDifficulty: {
    color: colors.error,
  },
  questTitle: {
    ...typography.heading4,
    marginBottom: 8,
  },
  questDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});