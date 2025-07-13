import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useQuestsStore } from '@/store/challenges-store';
import { useUserStore } from '@/store/user-store';
import QuestCard from '@/components/QuestCard';
import { QuestCategory } from '@/types';
import { Search, X, Plus } from 'lucide-react-native';
import Button from '@/components/Button';
import { fetchAuthorById } from '@/utils/firebase-helpers';

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

// Add calculateDaysLeft function before the OpenQuestsScreen component
const calculateDaysLeft = (deadline: string) => {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  
  // Set times to midnight for accurate day calculation
  deadlineDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const timeDiff = deadlineDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (daysLeft < 0) {
    return 'Ended';
  } else if (daysLeft === 0) {
    return 'Last day';
  } else if (daysLeft === 1) {
    return '1 day left';
  } else {
    return `${daysLeft} days left`;
  }
};

export default function OpenQuestsScreen() {
  const router = useRouter();
  const { 
    openQuests,
    activeQuests, 
    fetchOpenQuests, 
    filterByCategory, 
    filteredCategory,
    setSearchQuery,
    searchQuery,
    getFilteredQuests
  } = useQuestsStore();
  const { user } = useUserStore();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [questAuthors, setQuestAuthors] = useState<Record<string, Author | null>>({});

  const getDifficultyColor = () => {
    switch (difficulty) {
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
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'energy':
        return '⚡';
      case 'waste':
        return '♻️';
      case 'food':
        return '🍎';
      case 'transport':
        return '🚲';
      case 'water':
        return '💧';
      case 'advocacy':
        return '📣';
      case 'education':
        return '📚';
      case 'creative':
        return '🎨';
      default:
        return '🌱';
    }
  };

  useEffect(() => {
    fetchOpenQuests();
  }, []);

  // Fetch author data for each quest
  useEffect(() => {
    const filteredQuests = getFilteredQuests('open');
    
    // Create a set of unique author IDs to avoid duplicate fetches
    const authorIds = new Set(filteredQuests.map(quest => quest.authorId));
    
    // Fetch author data for each ID
    authorIds.forEach(async (authorId) => {
      if (authorId && !questAuthors[authorId]) {
        const authorData = await fetchAuthorById(authorId);
        setQuestAuthors(prev => ({
          ...prev,
          [authorId]: authorData
        }));
      }
    });
  }, [openQuests]);

  // Helper function to map quests to the format QuestCard expects
  const mapQuestForCard = (quest) => {
    return {
      ...quest,
      authorId: quest.authorId || quest.userId, // Support both authorId and legacy userId
    };
  };

  const handleSearch = (text: string) => {
    setLocalSearchQuery(text);
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
  };

  const categories: Array<{ id: QuestCategory | 'all', label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'energy', label: 'Energy' },
    { id: 'waste', label: 'Waste' },
    { id: 'food', label: 'Food' },
    { id: 'transport', label: 'Transport' },
    { id: 'water', label: 'Water' },
    { id: 'advocacy', label: 'Advocacy' },
    { id: 'education', label: 'Education' },
  ];

  const filteredQuests = getFilteredQuests('open').filter(quest => {
    // Filter by search query and category
    const searchMatch = localSearchQuery === '' || 
      quest.title.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(localSearchQuery.toLowerCase());
    
    const categoryMatch = filteredCategory === 'all' || quest.category === filteredCategory;
    
    return searchMatch && categoryMatch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Open Quests',
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <Button 
              title="Create Quest" 
              size="small"
              leftIcon={<Plus size={18} color={colors.background} />}
              onPress={() => router.push('/create-quest')} 
              style={styles.headerButton}
            />
          ),
        }} 
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quests..."
            value={localSearchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textSecondary}
          />
          {localSearchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                filteredCategory === item.id && styles.activeCategoryButton
              ]}
              onPress={() => filterByCategory(item.id)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  filteredCategory === item.id && styles.activeCategoryButtonText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <FlatList
        data={filteredQuests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <QuestCard
            challenge={item}
            isActive={activeQuests.includes(item.id)}
            onPress={(quest) => router.push(`/creative-challenge/${quest.id}`)}
            showAuthor={true}
          />
        )}
        contentContainerStyle={styles.questsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No quests found. Try adjusting your filters or create a new quest!
            </Text>
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
  searchContainer: {
    padding: 16,
    backgroundColor: colors.card,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  categoriesContainer: {
    backgroundColor: colors.card,
    paddingBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  activeCategoryButton: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  activeCategoryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  questsList: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  headerButton: {
    marginRight: 8,
  },
});