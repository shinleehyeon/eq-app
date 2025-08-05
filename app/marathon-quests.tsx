import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useQuestsStore } from '@/store/challenges-store';
import { useUserStore } from '@/store/user-store';
import QuestCard from '@/components/QuestCard';
import { ArrowRight, Sparkles, Globe, Trophy, MapPin } from 'lucide-react-native';
import { apiClient } from '@/lib/api/client';

interface MarathonQuest {
  uuid: string;
  name: string;
  description: string;
  milestoneOrder: number;
  requiredQuestPoints: number;
  marathonPointsBonus: number;
  experienceBonus: number;
  milestoneImage: string;
  createdAt: string;
  completed?: boolean;
}

interface Marathon {
  uuid: string;
  title: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  startDate: string;
  endDate: string;
  requiredQuestPoints: number;
  finalMarathonPoints: number;
  finalExperience: number;
  eventImage: string;
  organizer: {
    uuid: string;
    name: string;
    profileImage: string;
  };
  participantCount: number;
  spots: MarathonQuest[];
  createdAt: string;
}

export default function MarathonQuestsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { accessToken } = useUserStore();
  const [marathon, setMarathon] = useState<Marathon | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      fetchMarathonDetail();
    }
  }, [id]);

  const fetchMarathonDetail = async () => {
    try {
      const response = await apiClient.get(`/marathons/${id}`, accessToken || undefined);
      if (response.success && response.data) {
        setMarathon(response.data);
      }
    } catch (error) {
      console.error('Error fetching marathon detail:', error);
      Alert.alert('Error', 'Failed to load marathon details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestPress = (questId: string) => {
    router.push(`/quest-detail?id=${questId}`);
  };

  const completedQuests = marathon?.spots?.filter(quest => quest.completed) || [];
  const availableQuests = marathon?.spots?.filter(quest => !quest.completed) || [];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Marathon Quests',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading marathon quests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!marathon) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'Marathon Quests',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Marathon not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: marathon.title,
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Marathon Info Header */}
        <View style={styles.marathonHeader}>
          <Image 
            source={{ uri: marathon.eventImage }} 
            style={styles.marathonImage}
            resizeMode="cover"
          />
          <View style={styles.marathonInfo}>
            <Text style={styles.marathonTitle}>{marathon.title}</Text>
            <Text style={styles.marathonDescription}>{marathon.description}</Text>
            <View style={styles.marathonStats}>
              <View style={styles.statItem}>
                <Trophy size={16} color={colors.primary} />
                <Text style={styles.statText}>{marathon.finalMarathonPoints} pts</Text>
              </View>
              <View style={styles.statItem}>
                <MapPin size={16} color={colors.success} />
                <Text style={styles.statText}>{marathon.spots?.length || 0} checkpoints</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Completed Quests Section */}
        {completedQuests.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Sparkles size={20} color={colors.success} />
                <Text style={styles.sectionTitle}>Completed Checkpoints ({completedQuests.length})</Text>
              </View>
            </View>
            
            {completedQuests.map(quest => (
              <TouchableOpacity
                key={quest.uuid}
                style={[styles.questCard, styles.completedQuestCard]}
                onPress={() => handleQuestPress(quest.uuid)}
              >
                <Image 
                  source={{ uri: quest.milestoneImage }} 
                  style={styles.questImage}
                  resizeMode="cover"
                />
                <View style={styles.questContent}>
                  <View style={styles.questHeader}>
                    <Text style={styles.questTitle}>{quest.name}</Text>
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓</Text>
                    </View>
                  </View>
                  <Text style={styles.questDescription} numberOfLines={2}>
                    {quest.description}
                  </Text>
                  <View style={styles.questRewards}>
                    <Text style={styles.rewardText}>+{quest.marathonPointsBonus} pts</Text>
                    <Text style={styles.rewardText}>+{quest.experienceBonus} XP</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Available Quests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Available Checkpoints</Text>
            </View>
            <Text style={styles.seeAllText}>
              {availableQuests.length} remaining
            </Text>
          </View>

          {availableQuests.map((quest, index) => (
            <TouchableOpacity
              key={quest.uuid}
              style={styles.questCard}
              onPress={() => handleQuestPress(quest.uuid)}
            >
              <Image 
                source={{ uri: quest.milestoneImage }} 
                style={styles.questImage}
                resizeMode="cover"
              />
              <View style={styles.questContent}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{quest.name}</Text>
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderBadgeText}>{quest.milestoneOrder}</Text>
                  </View>
                </View>
                <Text style={styles.questDescription} numberOfLines={2}>
                  {quest.description}
                </Text>
                <View style={styles.questRewards}>
                  <Text style={styles.rewardText}>+{quest.marathonPointsBonus} pts</Text>
                  <Text style={styles.rewardText}>+{quest.experienceBonus} XP</Text>
                  <Text style={styles.requirementText}>Requires {quest.requiredQuestPoints} quest pts</Text>
                </View>
              </View>
              <ArrowRight size={20} color={colors.textSecondary} style={styles.arrowIcon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Progress Summary */}
        <View style={styles.progressSummary}>
          <Text style={styles.progressTitle}>Progress Summary</Text>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{completedQuests.length}</Text>
              <Text style={styles.progressLabel}>Completed</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{availableQuests.length}</Text>
              <Text style={styles.progressLabel}>Remaining</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>
                {((completedQuests.length / (marathon.spots?.length || 1)) * 100).toFixed(0)}%
              </Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.heading4,
    color: colors.text,
  },
  marathonHeader: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  marathonImage: {
    width: '100%',
    height: 120,
  },
  marathonInfo: {
    padding: 16,
  },
  marathonTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '700',
  },
  marathonDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  marathonStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
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
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    flexDirection: 'row',
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  completedQuestCard: {
    backgroundColor: colors.success + '10',
    borderColor: colors.success + '30',
  },
  questImage: {
    width: 80,
    height: 80,
    margin: 10,
    borderRadius: 8,
  },
  questContent: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  questTitle: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  questDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  questRewards: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  rewardText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  requirementText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowIcon: {
    marginRight: 16,
  },
  progressSummary: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    ...typography.heading2,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '700',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
});