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
import QuestCard from '@/components/QuestCard';
import { ArrowRight, Sparkles, Globe } from 'lucide-react-native';

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
  authorId: string;
}

export default function QuestsScreen() {
  const router = useRouter();
  const { 
    dailyQuests, 
    openQuests,
    activeQuests,
    fetchDailyQuests,
    fetchOpenQuests,
    selectQuest,
    unselectQuest
  } = useQuestsStore();
  const { users } = useUserStore();
  
  useEffect(() => {
    fetchDailyQuests();
    fetchOpenQuests();
  }, []);
  
  const allQuests = [...dailyQuests, ...openQuests];
  const selectedQuests = allQuests.filter(quest => activeQuests.includes(quest.uuid || quest.id!));
  const availableQuests = allQuests.filter(quest => !activeQuests.includes(quest.uuid || quest.id!));
  
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
        {/* Selected Quests Section */}
        {selectedQuests.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>My Selected Quests ({selectedQuests.length}/5)</Text>
              </View>
            </View>
            
            {selectedQuests.map(quest => (
              <QuestCard 
                key={quest.uuid || quest.id}
                challenge={quest}
                onPress={() => router.push(`/quest-detail?id=${quest.uuid || quest.id}`)}
                showAuthor={false}
                isActive={true}
              />
            ))}
          </View>
        )}
        
        {/* Available Quests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Available Quests</Text>
            </View>
            <Text style={styles.seeAllText}>
              Select up to {5 - selectedQuests.length} more quests
            </Text>
          </View>

          {availableQuests.map(quest => (
            <QuestCard 
              key={quest.uuid || quest.id}
              challenge={quest}
              isActive={false}
              onPress={() => router.push(`/quest-detail?id=${quest.uuid || quest.id}`)}
              showAuthor={false}
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