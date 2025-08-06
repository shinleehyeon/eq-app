import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import { apiClient } from '@/lib/api/client';
import { 
  Award, 
  User as UserIcon,
  Trophy,
  Calendar
} from 'lucide-react-native';

interface UserProfile {
  uuid: string;
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  profileImage: string | null;
  level: number;
  experience: number;
  marathonPoints: number;
  freshSeaweed: number;
  ecoBerries: number;
  organicSeeds: number;
  bambooSnack: number;
  ecoBall: number;
  puzzleTree: number;
  waterWheel: number;
  flyingRing: number;
  petToys: number;
  petFood: number;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApiUserProfileScreen() {
  const params = useLocalSearchParams();
  const { id, userId, userName, userLevel, marathonPoints, completedQuests, rank } = params;
  const router = useRouter();
  const { accessToken } = useUserStore();
  
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [fallbackData, setFallbackData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id || typeof id !== 'string') return;
      
      // Set up fallback data from URL parameters
      if (userName) {
        setFallbackData({
          name: userName,
          level: parseInt(userLevel as string) || 0,
          marathonPoints: parseInt(marathonPoints as string) || 0,
          completedQuests: parseInt(completedQuests as string) || 0,
          rank: parseInt(rank as string) || 0,
          userId: userId || id
        });
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching profile for userId:', id);
        console.log('Access token:', accessToken ? 'Present' : 'Missing');
        console.log('Full API call: GET /users/' + id + '/profile');
        const response = await apiClient.getUserProfile(id, accessToken || undefined);
        console.log('API response:', response);
        
        if (response.success && response.data) {
          setUserData(response.data.user);
        } else {
          console.error('API error response:', response.error);
          // Don't set error if we have fallback data
          if (!fallbackData) {
            setError(response.error || 'Failed to fetch user profile');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Don't set error if we have fallback data
        if (!fallbackData) {
          setError('Failed to fetch user profile');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id, accessToken]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'User Profile',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'User Profile',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.errorContainer}>
          <UserIcon size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>
            {error || 'User profile not found'}
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: userData.name || 'User Profile',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <Image 
            source={
              userData.profileImage 
                ? { uri: userData.profileImage }
                : { uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }
            }
            style={styles.profileAvatar}
          />
          
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          <View style={styles.levelContainer}>
            <Text style={styles.levelLabel}>Level {userData.level}</Text>
            <Text style={styles.experienceText}>{userData.experience} XP</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={24} color={colors.primary} />
            <Text style={styles.statValue}>{userData.marathonPoints}</Text>
            <Text style={styles.statLabel}>Marathon Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Award size={24} color={colors.primary} />
            <Text style={styles.statValue}>{userData.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          
          <View style={styles.statItem}>
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.statValue}>
              {new Date(userData.createdAt).getFullYear()}
            </Text>
            <Text style={styles.statLabel}>Joined</Text>
          </View>
        </View>
        
        <View style={styles.inventorySection}>
          <Text style={styles.sectionTitle}>Pet Inventory</Text>
          
          <View style={styles.inventoryGrid}>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Pet Food</Text>
              <Text style={styles.inventoryItemValue}>{userData.petFood}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Pet Toys</Text>
              <Text style={styles.inventoryItemValue}>{userData.petToys}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Fresh Seaweed</Text>
              <Text style={styles.inventoryItemValue}>{userData.freshSeaweed}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Eco Berries</Text>
              <Text style={styles.inventoryItemValue}>{userData.ecoBerries}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Organic Seeds</Text>
              <Text style={styles.inventoryItemValue}>{userData.organicSeeds}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Bamboo Snack</Text>
              <Text style={styles.inventoryItemValue}>{userData.bambooSnack}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.toysSection}>
          <Text style={styles.sectionTitle}>Pet Toys</Text>
          
          <View style={styles.inventoryGrid}>
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Eco Ball</Text>
              <Text style={styles.inventoryItemValue}>{userData.ecoBall}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Puzzle Tree</Text>
              <Text style={styles.inventoryItemValue}>{userData.puzzleTree}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Water Wheel</Text>
              <Text style={styles.inventoryItemValue}>{userData.waterWheel}</Text>
            </View>
            
            <View style={styles.inventoryItem}>
              <Text style={styles.inventoryItemName}>Flying Ring</Text>
              <Text style={styles.inventoryItemValue}>{userData.flyingRing}</Text>
            </View>
          </View>
        </View>
        
        {userData.lastLoginAt && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <Text style={styles.lastLoginText}>
              Last seen: {new Date(userData.lastLoginAt).toLocaleDateString()}
            </Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  backButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    ...typography.heading2,
    marginBottom: 4,
    color: colors.text,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
  },
  levelLabel: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  experienceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
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
  inventorySection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  toysSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
    color: colors.text,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  inventoryItemName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  inventoryItemValue: {
    ...typography.heading4,
    color: colors.primary,
    fontWeight: 'bold',
  },
  activitySection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  lastLoginText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});