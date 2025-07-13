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
import QuestCard from '@/components/ChallengeCard';
import { QuestCategory } from '@/types';
import { Search, X } from 'lucide-react-native';

export default function DailyQuestsScreen() {
  const router = useRouter();
  const { 
    dailyQuests,
    activeQuests, 
    fetchDailyQuests, 
    filterByCategory, 
    filteredCategory,
    setSearchQuery,
    searchQuery,
    getFilteredQuests
  } = useQuestsStore();
  const { user } = useUserStore();
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    fetchDailyQuests();
  }, []);

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

  const filteredQuests = getFilteredQuests('daily').filter(quest => {
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
          title: 'Daily Quests',
          headerTitleStyle: styles.headerTitle,
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
            onPress={(quest) => router.push(`/challenge-detail/${quest.id}`)}
          />
        )}
        contentContainerStyle={styles.questsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No quests found. Try adjusting your filters.
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
});