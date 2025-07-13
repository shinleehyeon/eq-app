import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useQuestsStore } from '@/store/challenges-store';
import { useUserStore } from '@/store/user-store';
import QuestCard from '@/components/QuestCard'; // Use the correct QuestCard component
import { ChevronRight, Leaf, FileImage } from 'lucide-react-native';

// Update the OpenQuest interface 
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
  authorId: string; // ID of the author (using authorId instead of userId)
}

export default function QuestsScreen() {
  const router = useRouter();
  const { 
    dailyQuests, 
    openQuests,
    activeQuests,
    fetchDailyQuests,
    fetchOpenQuests
  } = useQuestsStore();
  const { users } = useUserStore(); // Add users to access author information
  
  useEffect(() => {
    // Fetch both types of quests on mount
    fetchDailyQuests();
    fetchOpenQuests();
  }, []);
  
  // Get available quests without repeating
  const recentDailyQuests = dailyQuests.slice(0, Math.min(3, dailyQuests.length));
  const recentOpenQuests = openQuests.slice(0, Math.min(3, openQuests.length));
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Quests',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Quests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>📜Daily Quests</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/daily-quests')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {recentDailyQuests.map(quest => (
            <QuestCard 
              key={quest.id}
              challenge={quest}
              onPress={(quest) => router.push(`/challenge-detail/${quest.id}`)}
              showAuthor={false} // Don't show author for Daily Quests
              isActive={activeQuests.includes(quest.id)}
            />
          ))}
        </View>
        
        {/* Open Quests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>🗺️Open Quests</Text>
            </View>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/creative')}
            >
              <Text style={styles.seeAllText}>Community Hub</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentOpenQuests.map(quest => (
            <QuestCard 
              key={quest.id}
              challenge={quest}
              isActive={activeQuests.includes(quest.id)}
              onPress={(quest) => router.push(`/creative-challenge/${quest.id}`)}
              showAuthor={true} // Show author for Open Quests
            />
          ))}
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
    ...typography.heading2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.heading3,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    height: 80,
  },
  questImage: {
    width: 80,
    height: 80,
  },
  questContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  questTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
  },
  questDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});