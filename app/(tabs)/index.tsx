import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import { useQuestsStore } from '@/store/challenges-store';
import QuestCard from '@/components/ChallengeCard';
import Button from '@/components/Button';
import { Award, Calendar, ChevronRight, Leaf } from 'lucide-react-native';
import { getDatabase, ref, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { User } from '@/types';

interface HomeScreenData {
  title: string;
  description: string;
  featuredQuests: any[];
}

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
  userId: string; // ID of the author
}

const saveHomeScreenDataToFirebase = async (data: HomeScreenData) => {
  try {
    const database = getDatabase();
    const homeScreenRef = ref(database, 'homeScreenData');
    await set(homeScreenRef, data);
    console.log('Home screen data saved to Firebase successfully.');
  } catch (error) {
    console.error('Error saving home screen data to Firebase:', error);
  }
};

const fetchUserDataFromFirebase = async (userId: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user && user.uid === userId) {
      // Create a full User object with required fields
      return {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || 'Guest User',
        avatar: user.avatar,
        level: 1,
        streak: 0,
        completedQuests: [],
        badges: [],
        plants: [],
        followers: [],
        following: [],
        settings: {
          notifications: true,
          darkMode: false,
          language: 'en',
          privateProfile: false,
          hideEmail: false,
          hideAuthoredQuests: false,
        },
        emailVerified: user.emailVerified,
        lastLoginAt: user.metadata.lastSignInTime,
        createdAt: user.metadata.creationTime,
      };
    } else {
      console.error('No user data found in Firebase Authentication.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data from Firebase Authentication:', error);
    return null;
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser } = useUserStore();
  const { 
    dailyQuests, 
    openQuests, 
    activeQuests, 
    fetchDailyQuests, 
    fetchOpenQuests, 
    isLoading: questsLoading 
  } = useQuestsStore();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    const ensureUserInitialization = async () => {
      try {
        if (!user || !user.id) {
          console.warn('User is not initialized. Attempting to initialize user.');
          await initializeUser();
        }
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing user:', error);
        setIsInitializing(false);
      }
    };

    ensureUserInitialization();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const userId = user?.id;
        if (!userId) return;
        
        const userData = await fetchUserDataFromFirebase(userId);
        if (userData) {
          useUserStore.getState().setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Fetch both daily and open quests
        await Promise.all([
          fetchDailyQuests(),
          fetchOpenQuests()
        ]);
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initApp();
  }, []);

  useEffect(() => {
    const mockupData = {
      // Replace with actual mockup data from the home screen
      title: 'Welcome to EcoQuest',
      description: 'Complete quests and grow your garden!',
      featuredQuests: dailyQuests?.slice(0, 3) || [], // Example: top 3 quests
    };

    // saveHomeScreenDataToFirebase(mockupData);
  }, [dailyQuests]);
  
  // Don't render anything until both quests and activeQuests are ready
  if (isInitializing || questsLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  // Create a default user if none exists (for demo purposes)
  const currentUser = user || {
    id: 'default',
    name: 'Guest User',
    email: 'guest@example.com',
    level: 1,
    streak: 0,
    completedQuests: [],
    badges: [],
    plants: [],
    followers: [],
    following: [],
    settings: {
      notifications: true,
      darkMode: false,
      language: 'en',
      privateProfile: false,
      hideEmail: false,
      hideAuthoredQuests: false
    }
  };

  // Ensure all arrays have default values and proper null checks
  const badges = currentUser?.badges || [];
  const completedQuests = currentUser?.completedQuests || [];
  
  // Get all quests (daily and open)
  const allQuests = [...(dailyQuests || []), ...(openQuests || [])];
  
  // Get user's active quests
  const userActiveQuests = allQuests.filter(quest => 
    quest && activeQuests?.includes(quest.id)
  );
  
  // Get recommended quests from daily quests that aren't active or completed
  const recommendedQuests = (dailyQuests || [])
    .filter(quest => 
      quest && 
      activeQuests && 
      completedQuests && 
      !activeQuests.includes(quest.id) && 
      !completedQuests.includes(quest.id)
    )
    .slice(0, 2);

  // Profile image handling
  const defaultAvatar = require('@/assets/images/default-avatar.png');
  const avatarSource = currentUser?.avatar ? { uri: currentUser.avatar } : defaultAvatar;
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'EcoQuest',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Stats */}
        <View style={styles.userStatsContainer}>
          <View style={styles.userInfo}>
            <Image 
              source={avatarSource} 
              style={styles.avatar} 
            />
            <View>
              <Text style={styles.greeting}>Hello, {currentUser.name.split(' ')[0]}!</Text>
              <Text style={styles.level}>Level {currentUser.level}</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Calendar size={20} color={colors.primary} />
              <Text style={styles.statValue}>{currentUser.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.statItem}>
              <Award size={20} color={colors.primary} />
              <Text style={styles.statValue}>{badges.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
            
            <View style={styles.statItem}>
              <Leaf size={20} color={colors.primary} />
              <Text style={styles.statValue}>{completedQuests.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>
        
        {/* Active Quests */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/quests')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {userActiveQuests.length > 0 ? (
            userActiveQuests.map(quest => {
              // Determine if this is a daily quest or an open quest
              const isDailyQuest = dailyQuests.some(q => q.id === quest.id);
              
              return (
                <QuestCard 
                  key={quest.id}
                  challenge={quest}
                  isActive={true}
                  onPress={() => {
                    // Route based on quest type
                    if (isDailyQuest) {
                      router.push(`/challenge-detail/${quest.id}`);
                    } else {
                      router.push(`/creative-challenge/${quest.id}`);
                    }
                  }}
                  showAuthor={!isDailyQuest} // Only show author for open quests
                />
              );
            })
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                You don't have any active quests.
              </Text>
              <Button 
                title="Find Quests" 
                onPress={() => router.push('/quests')}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>
        
        {/* Recommended Quests - Daily Quests */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recommended For You</Text>
          </View>
          
          {recommendedQuests.length > 0 ? (
            recommendedQuests.map(quest => (
              <QuestCard 
                key={quest.id}
                challenge={quest}
                isActive={activeQuests.includes(quest.id)}
                onPress={(quest) => router.push(`/challenge-detail/${quest.id}`)}
                showAuthor={true}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                No daily quests available at the moment.
              </Text>
            </View>
          )}
          
          <Button 
            title="Explore All Quests" 
            variant="outline"
            onPress={() => router.push('/quests')}
            style={styles.exploreButton}
          />
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: 12,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  userStatsContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  greeting: {
    ...typography.heading3,
    marginBottom: 4,
  },
  level: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  },
  emptyStateContainer: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    minWidth: 150,
  },
  exploreButton: {
    marginTop: 8,
  },
});