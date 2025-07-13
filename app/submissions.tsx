import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import { 
  Search, 
  X 
} from 'lucide-react-native';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';
import SubmissionCard from '@/components/SubmissionCard';

// Define Submission type
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
}

// Define filter categories
const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'most-liked', label: 'Most Liked' },
  { id: 'most-badges', label: 'Most Badges' },
  { id: 'newest', label: 'Newest' }
];

export default function SubmissionsScreen() {
  const router = useRouter();
  const { users } = useUserStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Fetch all submissions from Firebase
  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching all submissions from Firebase');
        const submissionsRef = ref(database, 'questSubmissions');
        const snapshot = await get(submissionsRef);
        
        if (snapshot.exists()) {
          // Convert Firebase object to array
          const submissionsData = snapshot.val();
          const submissionsArray = Object.keys(submissionsData).map(key => ({
            id: key,
            ...submissionsData[key]
          }));
          
          setSubmissions(submissionsArray);
        } else {
          console.log('No submissions found');
          setSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmissions();
  }, []);
  
  // Apply filters and search
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(submission => 
        submission.title.toLowerCase().includes(query) || 
        submission.description.toLowerCase().includes(query)
      );
    }
    
    // Apply filter
    switch (activeFilter) {
      case 'most-liked':
        return result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'most-badges':
        return result.sort((a, b) => (b.badgeCount || 0) - (a.badgeCount || 0));
      case 'newest':
        return result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      default: // 'all'
        return result.sort((a, b) => (b.likes || 0) - (a.likes || 0)); // Default to most liked
    }
  }, [submissions, searchQuery, activeFilter]);
  
  // Helper function to get user name
  const getUserName = (userId: string) => {
    const user = users?.find(u => u.id === userId);
    return user?.name || 'Anonymous';
  };
  
  // Format relative date
  const formatRelativeDate = (dateString: string) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Submissions',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search submissions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filter Categories */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item.id && styles.activeFilterButton
              ]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text 
                style={[
                  styles.filterButtonText,
                  activeFilter === item.id && styles.activeFilterButtonText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Submissions List */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubmissionCard 
            submission={item}
            onPress={() => router.push(`/submission-detail/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.submissionsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.emptyText}>Loading submissions...</Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyText}>No submissions found</Text>
                {searchQuery && (
                  <Button 
                    title="Clear Search" 
                    onPress={clearSearch}
                    variant="outline"
                    size="small"
                    style={styles.clearButton}
                  />
                )}
              </>
            )}
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
    ...typography.heading3,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    height: 44,
    marginLeft: 8,
    ...typography.body,
    color: colors.text,
  },
  filtersContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  activeFilterButtonText: {
    color: colors.background,
    fontWeight: '600',
  },
  submissionsList: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  clearButton: {
    minWidth: 120,
  },
});