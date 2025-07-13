import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import { 
  Award, 
  Calendar, 
  Heart, 
  MapPin, 
  User as UserIcon,
  X,
  Users,
  Scroll,
  ScrollText,
  BookOpen
} from 'lucide-react-native';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';
import { followUser, unfollowUser, checkIfFollowing, fetchUserDataFromFirebase } from '@/utils/firebase-helpers';
import UserListItem from '@/components/UserListItem';

const defaultAvatar = require('@/assets/images/default-avatar.png');

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, users } = useUserStore(); // Get current logged-in user
  
  const [userData, setUserData] = useState(null);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [followersData, setFollowersData] = useState<any[]>([]);
  const [followingData, setFollowingData] = useState<any[]>([]);
  const [wisdomCount, setWisdomCount] = useState(0);
  
  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      if (!id) return;
      
      try {
        // Try getting from store first
        const userFromStore = users?.find(u => u.id === id);
        if (userFromStore) {
          if (isMounted) {
            setUserData(userFromStore);
            setIsLoading(false);
            
            // After setting basic user data, fetch additional data
            await fetchAdditionalData(userFromStore);
          }
          return;
        }

        // If not in store, fetch from Firebase
        const userRef = ref(database, `users/${id}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists() && isMounted) {
          const fetchedUserData = {
            ...snapshot.val(),
            id: id
          };
          setUserData(fetchedUserData);
          setIsLoading(false);
          
          // After setting basic user data, fetch additional data
          await fetchAdditionalData(fetchedUserData);
        } else {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchAdditionalData = async (currentUserData) => {
      if (!isMounted || !currentUserData) return;

      try {
        // Fetch follow status
        if (user?.id) {
          const following = await checkIfFollowing(user.id, id);
          if (isMounted) setIsFollowing(following);
        }

        // Fetch followers and following
        const [followersSnap, followingSnap, submissionsSnap] = await Promise.all([
          get(ref(database, `users/${id}/followers`)),
          get(ref(database, `users/${id}/following`)),
          get(ref(database, 'questSubmissions'))
        ]);

        if (!isMounted) return;

        // Process followers/following
        const followersList = followersSnap.exists() ? Object.keys(followersSnap.val()) : [];
        const followingList = followingSnap.exists() ? Object.keys(followingSnap.val()) : [];

        setFollowersCount(followersList.length);
        setFollowingCount(followingList.length);

        // Fetch user data for followers/following in parallel
        const [followersData, followingData] = await Promise.all([
          Promise.all(followersList.map(async (followerId) => {
            try {
              const userData = await fetchUserDataFromFirebase(followerId);
              return userData;
            } catch (error) {
              console.warn(`Failed to fetch follower data for ${followerId}:`, error);
              return null;
            }
          })),
          Promise.all(followingList.map(async (followingId) => {
            try {
              const userData = await fetchUserDataFromFirebase(followingId);
              return userData;
            } catch (error) {
              console.warn(`Failed to fetch following data for ${followingId}:`, error);
              return null;
            }
          }))
        ]);

        if (!isMounted) return;

        setFollowersData(followersData.filter(Boolean));
        setFollowingData(followingData.filter(Boolean));

        // Process submissions
        if (submissionsSnap.exists()) {
          const allSubmissions = submissionsSnap.val();
          const filteredSubmissions = Object.keys(allSubmissions)
            .filter(key => allSubmissions[key].userId === id)
            .map(key => ({
              id: key,
              ...allSubmissions[key]
            }));
          
          if (isMounted) setUserSubmissions(filteredSubmissions);
        }

        // Fetch wisdom count
        const learnRef = ref(database, 'learn');
        const learnSnap = await get(learnRef);
        
        if (learnSnap.exists()) {
          const learnEntries = Object.values(learnSnap.val());
          const userWisdomCount = learnEntries.filter(
            (entry: any) => entry.userId === id
          ).length;
          setWisdomCount(userWisdomCount);
        }

        // Fetch completed quests counts from both locations
        const [dailyQuestsSnap, openQuestsSnap] = await Promise.all([
          get(ref(database, `users/${id}/dailyQuestCompleted`)),
          get(ref(database, `users/${id}/openQuestCompleted`))
        ]);

        const dailyCount = dailyQuestsSnap.exists() ? Object.keys(dailyQuestsSnap.val()).length : 0;
        const openCount = openQuestsSnap.exists() ? Object.keys(openQuestsSnap.val()).length : 0;

        const totalQuestsCount = dailyCount + openCount;
        if (isMounted) {
          setUserData(prev => ({
            ...prev,
            completedQuests: totalQuestsCount
          }));
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [id, users, user]);
  
  const handleFollowPress = async () => {
    if (!user || !id) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(user.id, id);
        setFollowersCount(prev => prev - 1);
      } else {
        await followUser(user.id, id);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const openFollowersModal = () => {
    setModalType('followers');
    setModalVisible(true);
  };
  
  const openFollowingModal = () => {
    setModalType('following');
    setModalVisible(true);
  };
  
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
  
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: 'User Not Found',
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.errorContainer}>
          <UserIcon size={48} color={colors.textSecondary} />
          <Text style={styles.errorText}>User profile not found</Text>
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
            source={userData.avatar ? 
              { uri: userData.avatar } : 
              defaultAvatar
            } 
            style={styles.profileAvatar}
          />
          
          <Text style={styles.userName}>{userData.name || 'Anonymous User'}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>
          
          {/* Stats */}
          <View style={styles.followStatsContainer}>
            <TouchableOpacity 
              style={styles.followStat}
              onPress={openFollowersModal}
            >
              <Text style={styles.followStatValue}>{followersCount}</Text>
              <Text style={styles.followStatLabel}>Followers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.followStat}
              onPress={openFollowingModal}
            >
              <Text style={styles.followStatValue}>{followingCount}</Text>
              <Text style={styles.followStatLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ScrollText size={24} color={colors.primary} />
            <Text style={styles.statValue}>{userSubmissions.length}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
                    
          <View style={styles.statItem}>
            <Scroll size={24} color={colors.primary} />
            <Text style={styles.statValue}>
              {userData.completedQuests || 0}
            </Text>
            <Text style={styles.statLabel}>Quests</Text>
          </View>
          
          <View style={styles.statItem}>
            <Award size={24} color={colors.primary} />
            <Text style={styles.statValue}>
              {userSubmissions.reduce((sum, sub) => sum + (sub.badgeCount || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>

          <View style={styles.statItem}>
            <BookOpen size={24} color={colors.primary} />
            <Text style={styles.statValue}>{wisdomCount}</Text>
            <Text style={styles.statLabel}>Wisdom</Text>
          </View>
        </View>
        
        {userSubmissions.length > 0 && (
          <View style={styles.submissionsSection}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            
            {userSubmissions.slice(0, 3).map(submission => (
              <TouchableOpacity 
                key={submission.id}
                style={styles.submissionCard}
                onPress={() => router.push(`/submission-detail/${submission.id}`)}
              >
                <Image 
                  source={{ uri: submission.mediaUrl }} 
                  style={styles.submissionImage}
                  resizeMode="cover"
                />
                <View style={styles.submissionContent}>
                  <Text style={styles.submissionTitle}>{submission.title}</Text>
                  <Text style={styles.submissionDescription} numberOfLines={2}>
                    {submission.description}
                  </Text>
                  <View style={styles.submissionStats}>
                    <View style={styles.statBadge}>
                      <Heart size={14} color={colors.primary} />
                      <Text style={styles.statBadgeText}>{submission.likes || 0}</Text>
                    </View>
                    {submission.badgeCount > 0 && (
                      <View style={styles.statBadge}>
                        <Award size={14} color={colors.primary} />
                        <Text style={styles.statBadgeText}>{submission.badgeCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            
            {userSubmissions.length > 3 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push(`/submissions?userId=${id}`)}
              >
                <Text style={styles.viewAllButtonText}>
                  View All Submissions
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {user && id && user.id !== id && (
          <TouchableOpacity 
            style={styles.followButton}
            onPress={handleFollowPress}
          >
            <Text style={styles.followButtonText}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      {/* Followers/Following Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalType === 'followers' ? 'Followers' : 'Following'}
              </Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {modalType === 'followers' && followersData.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Users size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No followers yet</Text>
              </View>
            )}
            
            {modalType === 'following' && followingData.length === 0 && (
              <View style={styles.emptyStateContainer}>
                <Users size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>Not following anyone yet</Text>
              </View>
            )}
            
            <ScrollView style={styles.modalList}>
              {modalType === 'followers' && followersData.map((userData) => (
                <UserListItem 
                  key={userData.id}
                  user={userData}
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/user-profile/${userData.id}`);
                  }}
                />
              ))}
              
              {modalType === 'following' && followingData.map((userData) => (
                <UserListItem 
                  key={userData.id}
                  user={userData}
                  onPress={() => {
                    setModalVisible(false);
                    router.push(`/user-profile/${userData.id}`);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 1,
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
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  levelContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
  },
  levelLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary,
    fontSize: 16,
  },
  followStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  followStat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  followStatValue: {
    ...typography.heading3,
    fontWeight: 'bold',
  },
  followStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
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
  submissionsSection: {
    padding: 16,
    backgroundColor: colors.card,
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  submissionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
  },
  submissionImage: {
    width: 100,
    height: 100,
    backgroundColor: colors.border,
  },
  submissionContent: {
    flex: 1,
    padding: 12,
  },
  submissionTitle: {
    ...typography.heading4,
    marginBottom: 4,
  },
  submissionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  submissionStats: {
    flexDirection: 'row',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statBadgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewAllButton: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  viewAllButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  followButton: {
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  followButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.heading3,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
  },
});