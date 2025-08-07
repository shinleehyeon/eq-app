import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import { 
  ChevronRight, 
  LogOut, 
  User as UserIcon,
  Coins,
  Trophy,
  Star,
} from 'lucide-react-native';
import { apiClient } from '@/lib/api/client';

interface ProfileData {
  uuid: string;
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  profileImage: string | null;
  level: number;
  experience: number;
  marathonPoints: number;
  mainPetId: string;
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, accessToken, updateProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  const fetchProfileData = React.useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get('/auth/profile', accessToken);
      
      if (response.success && response.data) {
        const profileUser = response.data.user;
        setProfileData(profileUser);
        
        // Sync profileImage to user store as avatar
        if (profileUser.profileImage && profileUser.profileImage !== user?.avatar) {
          updateProfile({
            avatar: profileUser.profileImage,
            name: profileUser.name,
            email: profileUser.email,
          });
        }
      } else {
        console.error('Failed to load profile data:', response.error);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, updateProfile, user?.avatar]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [fetchProfileData])
  );
  
  const handleSignOut = async () => {
    try {
      logout();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>No profile data available</Text>
      </View>
    );
  }
  
  // Profile Header section - use both profileData and user store for avatar
  const defaultAvatar = require('@/assets/images/logo.png');
  
  const getAvatarSource = () => {
    // Priority: user store avatar (most recent) > profileData.profileImage (from API) > default
    if (user?.avatar) {
      return { uri: user.avatar };
    } else if (profileData?.profileImage) {
      return { uri: profileData.profileImage };
    } else {
      return defaultAvatar;
    }
  };
  
  const avatarSource = getAvatarSource();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image 
            source={avatarSource} 
            style={styles.avatar} 
          />
          
          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Coins size={24} color={colors.warning} />
            <Text style={styles.statValue}>{profileData.marathonPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Trophy size={24} color={colors.warning} />
            <Text style={styles.statValue}>{profileData.level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          
          <View style={styles.statItem}>
            <Star size={24} color={colors.warning} />
            <Text style={styles.statValue}>{profileData.experience}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/edit-profile')}
          >
            <View style={styles.menuIconContainer}>
              <UserIcon size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSignOut}
          >
            <View style={styles.menuIconContainer}>
              <LogOut size={20} color={colors.error} />
            </View>
            <Text style={[styles.menuText, { color: colors.error }]}>Sign Out</Text>
            <ChevronRight size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>EcoQuest v1.0.0</Text>
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    ...typography.heading2,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  levelContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  levelLabel: {
    ...typography.heading4,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  experienceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    marginTop: 1,
    marginBottom: 16,
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
    backgroundColor: colors.card,
    marginBottom: 16,
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
  },
  menuContainer: {
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    ...typography.body,
    flex: 1,
  },
  versionContainer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});