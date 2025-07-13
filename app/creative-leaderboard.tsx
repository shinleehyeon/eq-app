import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useCreativeSubmissionsStore } from '@/store/creative-submissions-store';
import { useQuestsStore } from '@/store/challenges-store';
import { Award, ChevronDown, Filter } from 'lucide-react-native';
import { CreativeSubmission, Quest } from '@/types';

export default function CreativeLeaderboardScreen() {
  const router = useRouter();
  const { getTopSubmissions } = useCreativeSubmissionsStore();
  const { quests } = useQuestsStore();
  
  const [topSubmissions, setTopSubmissions] = useState<CreativeSubmission[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [showQuestFilter, setShowQuestFilter] = useState(false);
  
  useEffect(() => {
    // Get creative quests
    const creativeQuests = quests.filter(q => q.category === 'creative');
    
    // Get top submissions
    setTopSubmissions(getTopSubmissions(50));
  }, []);
  
  const handleFilterByQuest = (questId: string | null) => {
    setSelectedQuest(questId);
    setShowQuestFilter(false);
    
    if (questId) {
      const filtered = getTopSubmissions(50).filter(
        submission => submission.questId === questId
      );
      setTopSubmissions(filtered);
    } else {
      setTopSubmissions(getTopSubmissions(50));
    }
  };
  
  const getSelectedQuestName = () => {
    if (!selectedQuest) return 'All Quests';
    const quest = quests.find(c => c.id === selectedQuest);
    return quest ? quest.title : 'All Quests';
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Creative Leaderboard',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowQuestFilter(!showQuestFilter)}
        >
          <Filter size={16} color={colors.primary} />
          <Text style={styles.filterButtonText}>
            {getSelectedQuestName()}
          </Text>
          <ChevronDown size={16} color={colors.primary} />
        </TouchableOpacity>
        
        {showQuestFilter && (
          <View style={styles.filterDropdown}>
            <TouchableOpacity 
              style={[
                styles.filterOption,
                selectedQuest === null && styles.selectedFilterOption
              ]}
              onPress={() => handleFilterByQuest(null)}
            >
              <Text 
                style={[
                  styles.filterOptionText,
                  selectedQuest === null && styles.selectedFilterOptionText
                ]}
              >
                All Quests
              </Text>
            </TouchableOpacity>
            
            {quests.filter(q => q.category === 'creative').map(quest => (
              <TouchableOpacity 
                key={quest.id}
                style={[
                  styles.filterOption,
                  selectedQuest === quest.id && styles.selectedFilterOption
                ]}
                onPress={() => handleFilterByQuest(quest.id)}
              >
                <Text 
                  style={[
                    styles.filterOptionText,
                    selectedQuest === quest.id && styles.selectedFilterOptionText
                  ]}
                >
                  {quest.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      
      <FlatList
        data={topSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            style={styles.submissionItem}
            onPress={() => router.push(`/submission-detail/${item.id}`)}
            activeOpacity={0.8}
          >
            <View style={styles.rankContainer}>
              {index < 3 ? (
                <Award 
                  size={24} 
                  color={
                    index === 0 ? '#FFD700' : // Gold
                    index === 1 ? '#C0C0C0' : // Silver
                    '#CD7F32' // Bronze
                  } 
                />
              ) : (
                <Text style={styles.rankText}>{index + 1}</Text>
              )}
            </View>
            
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.submissionImage} 
              resizeMode="cover"
            />
            
            <View style={styles.submissionInfo}>
              <Text style={styles.submissionTitle} numberOfLines={1}>
                {item.title}
              </Text>
              
              <View style={styles.submissionMeta}>
                <Text style={styles.submissionAuthor} numberOfLines={1}>
                  by {item.userName}
                </Text>
                
                <View style={styles.badgesContainer}>
                  <Award size={14} color={colors.warning} />
                  <Text style={styles.badgesText}>{item.badgeCount} badges</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submissions found.</Text>
          </View>
        }
      />
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
  filtersContainer: {
    padding: 16,
    backgroundColor: colors.card,
    zIndex: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  filterDropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedFilterOption: {
    backgroundColor: colors.primary + '15', // Primary color with 15% opacity
  },
  filterOptionText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  selectedFilterOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  submissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    ...typography.heading3,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  submissionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  submissionInfo: {
    flex: 1,
  },
  submissionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
  },
  submissionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submissionAuthor: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgesText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});