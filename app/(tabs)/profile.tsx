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
  Modal,
  Alert
} from 'react-native';
import { Stack, useRouter, router } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import { useQuestsStore } from '@/store/challenges-store';
import BadgeGrid from '@/components/BadgeGrid';
import Button from '@/components/Button';
import UserListItem from '@/components/UserListItem';
import ChallengeCard from '@/components/ChallengeCard';
import { 
  Award, 
  Calendar, 
  ChevronRight, 
  LogOut, 
  Scroll,
  ScrollText,
  Settings, 
  User as UserIcon,
  Users,
  X,
  BookOpen,
  Heart,
  MessageCircle
} from 'lucide-react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';

const fetchUserDataFromFirebase = async (userId: string) => {
  try {
    const database = getDatabase();
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.error('No user data found in Firebase.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data from Firebase:', error);
    return null;
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, clearUser } = useUserStore();
  const { quests } = useQuestsStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [authoredQuests, setAuthoredQuests] = useState<any[]>([]);
  const [followersData, setFollowersData] = useState<any[]>([]);
  const [followingData, setFollowingData] = useState<any[]>([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [questCompletionCount, setQuestCompletionCount] = useState(0);
  const [wisdomCount, setWisdomCount] = useState(0);
  const [submissionsModalVisible, setSubmissionsModalVisible] = useState(false);
  const [userSubmissionsData, setUserSubmissionsData] = useState<any[]>([]);
  const [questsModalVisible, setQuestsModalVisible] = useState(false);
  const [completedQuestsData, setCompletedQuestsData] = useState<any[]>([]);
  const [wisdomModalVisible, setWisdomModalVisible] = useState(false);
  const [userWisdomData, setUserWisdomData] = useState<any[]>([]);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const auth = getAuth();
        if (!auth.currentUser?.uid) {
          setIsInitializing(false);
          return;
        }

        const userData = await fetchUserDataFromFirebase(auth.currentUser.uid);
        if (userData) {
          useUserStore.getState().setUser({ ...userData, id: auth.currentUser.uid });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setIsInitializing(false);
    }
  }, [user]);
  
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) return;

      try {
        const database = getDatabase();

        // Fetch submissions count
        const submissionsRef = ref(database, 'questSubmissions');
        const submissionsSnap = await get(submissionsRef);
        
        if (submissionsSnap.exists()) {
          const submissions = Object.values(submissionsSnap.val()).filter(
            (sub: any) => sub.userId === user.id
          );
          setSubmissionCount(submissions.length);
        }

        // Fetch completed quests counts
        const dailyQuestsRef = ref(database, `users/${user.id}/dailyQuestCompleted`);
        const openQuestsRef = ref(database, `users/${user.id}/openQuestCompleted`);
        
        const [dailySnap, openSnap] = await Promise.all([
          get(dailyQuestsRef),
          get(openQuestsRef)
        ]);

        const dailyCount = dailySnap.exists() ? Object.keys(dailySnap.val()).length : 0;
        const openCount = openSnap.exists() ? Object.keys(openSnap.val()).length : 0;
        
        setQuestCompletionCount(dailyCount + openCount);

        // Fetch wisdom count (eco tips/articles authored by user)
        const learnRef = ref(database, 'learn');
        const learnSnap = await get(learnRef);
        
        if (learnSnap.exists()) {
          const learnEntries = Object.values(learnSnap.val());
          const userWisdomCount = learnEntries.filter(
            (entry: any) => entry.userId === user.id
          ).length;
          setWisdomCount(userWisdomCount);
        }

      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [user?.id]);
  
  useEffect(() => {
    // Find quests authored by this user with proper null checks
    if (user?.id && quests?.length > 0) {
      const userQuests = quests.filter(quest => quest?.authorId === user.id) || [];
      setAuthoredQuests(userQuests);
    } else {
      setAuthoredQuests([]);
    }
  }, [user, quests]);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (user?.followers || user?.following) {
        const followersList = user.followers ? Object.keys(user.followers) : [];
        const followingList = user.following ? Object.keys(user.following) : [];
        
        // Fetch followers data
        const followersPromises = followersList.map(id => fetchUserDataFromFirebase(id));
        const followersResults = await Promise.all(followersPromises);
        setFollowersData(followersResults.filter(user => user !== null));
        
        // Fetch following data
        const followingPromises = followingList.map(id => fetchUserDataFromFirebase(id));
        const followingResults = await Promise.all(followingPromises);
        setFollowingData(followingResults.filter(user => user !== null));
      }
    };
    
    fetchFollowData();
  }, [user]);

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      if (!user?.id) return;
      
      try {
        const database = getDatabase();
        const submissionsRef = ref(database, 'questSubmissions');
        const snapshot = await get(submissionsRef);
        
        if (snapshot.exists()) {
          const submissions = Object.entries(snapshot.val())
            .filter(([_, submission]: [string, any]) => submission.userId === user.id)
            .map(([id, data]: [string, any]) => ({
              id,
              ...data
            }));
          setUserSubmissionsData(submissions);
        }
      } catch (error) {
        console.error('Error fetching user submissions:', error);
      }
    };

    fetchUserSubmissions();
  }, [user?.id]);

  useEffect(() => {
    const fetchCompletedQuests = async () => {
      if (!user?.id) return;
      
      try {
        const database = getDatabase();
        const dailyRef = ref(database, `users/${user.id}/dailyQuestCompleted`);
        const openRef = ref(database, `users/${user.id}/openQuestCompleted`);
        
        const [dailySnap, openSnap] = await Promise.all([
          get(dailyRef),
          get(openRef)
        ]);

        let allQuests = [];
        
        if (dailySnap.exists()) {
          const dailyQuests = await Promise.all(
            Object.entries(dailySnap.val()).map(async ([id, data]: [string, any]) => {
              // Fetch daily quest details
              const questRef = ref(database, `dailyQuests/${data.questId}`);
              const questSnap = await get(questRef);
              const questData = questSnap.exists() ? questSnap.val() : null;
              
              return {
                id,
                ...data,
                type: 'daily',
                title: questData?.title || `Daily Quest #${data.questId}`,
                description: questData?.description || '',
                imageUrl: questData?.imageUrl || null
              };
            })
          );
          allQuests.push(...dailyQuests);
        }
        
        if (openSnap.exists()) {
          const openQuests = await Promise.all(
            Object.entries(openSnap.val()).map(async ([id, data]: [string, any]) => {
              // Fetch open quest details
              const questRef = ref(database, `openQuests/${data.questId}`);
              const questSnap = await get(questRef);
              const questData = questSnap.exists() ? questSnap.val() : null;
              
              return {
                id,
                ...data,
                type: 'open',
                title: questData?.title || `Creative Quest #${data.questId}`,
                description: questData?.description || '',
                imageUrl: questData?.imageUrl || null
              };
            })
          );
          allQuests.push(...openQuests);
        }

        // Sort by completion date
        allQuests.sort((a, b) => 
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );

        setCompletedQuestsData(allQuests);
      } catch (error) {
        console.error('Error fetching completed quests:', error);
      }
    };

    fetchCompletedQuests();
  }, [user?.id]);

  useEffect(() => {
    const fetchUserWisdom = async () => {
      if (!user?.id) return;
      
      try {
        const database = getDatabase();
        const learnRef = ref(database, 'learn');
        const snapshot = await get(learnRef);
        
        if (snapshot.exists()) {
          const wisdom = Object.entries(snapshot.val())
            .filter(([_, data]: [string, any]) => data.userId === user.id)
            .map(([id, data]: [string, any]) => ({
              id,
              ...data
            }));
          setUserWisdomData(wisdom);
        }
      } catch (error) {
        console.error('Error fetching user wisdom:', error);
      }
    };

    fetchUserWisdom();
  }, [user?.id]);
  
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      
      // Use logout instead of clearUser since that's what's available in your store
      logout();
      
      // Navigate to sign in screen
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };
  
  if (isInitializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
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
  
  const openFollowersModal = () => {
    setModalType('followers');
    setModalVisible(true);
  };
  
  const openFollowingModal = () => {
    setModalType('following');
    setModalVisible(true);
  };

  // Convert followers/following objects to arrays with proper null checks
  const followers = currentUser.followers ? Object.keys(currentUser.followers) : [];
  const following = currentUser.following ? Object.keys(currentUser.following) : [];
  const badges = currentUser.badges || [];
  const completedQuests = currentUser.completedQuests || [];
  const userSubmissions = currentUser.submissions || [];
  
  // Profile Header section
  const defaultAvatar = require('@/assets/images/default-avatar.png');
  const avatarSource = currentUser?.avatar ? { uri: currentUser.avatar } : defaultAvatar;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Profile',
          headerTitleStyle: styles.headerTitle,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSettingsPress}
              style={styles.headerButton}
            >
              <Settings size={24} color={colors.text} />
            </TouchableOpacity>
          ),
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
          
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          
          {/* Followers/Following Stats */}
          <View style={styles.followStatsContainer}>
            <TouchableOpacity 
              style={styles.followStat} 
              onPress={openFollowersModal}
            >
              <Text style={styles.followStatValue}>{followers.length}</Text>
              <Text style={styles.followStatLabel}>Followers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.followStat}
              onPress={openFollowingModal}
            >
              <Text style={styles.followStatValue}>{following.length}</Text>
              <Text style={styles.followStatLabel}>Following</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setSubmissionsModalVisible(true)}
          >
            <ScrollText size={24} color={colors.primary} />
            <Text style={styles.statValue}>{submissionCount}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setQuestsModalVisible(true)}
          >
            <Scroll size={24} color={colors.primary} />
            <Text style={styles.statValue}>{questCompletionCount}</Text>
            <Text style={styles.statLabel}>Quests</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setBadgeModalVisible(true)}
          >
            <Award size={24} color={colors.primary} />
            <Text style={styles.statValue}>{badges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setWisdomModalVisible(true)}
          >
            <BookOpen size={24} color={colors.primary} />
            <Text style={styles.statValue}>{wisdomCount}</Text>
            <Text style={styles.statLabel}>Wisdom</Text>
          </TouchableOpacity>
        </View>
        
        {/* Badges */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Badges</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/badges')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <BadgeGrid badges={badges.slice(0, 6)} />
        </View>
        
        {/* Authored Quests */}
        {authoredQuests.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Created Quests</Text>
              {authoredQuests.length > 3 && (
                <TouchableOpacity 
                  style={styles.seeAllButton}
                  onPress={() => router.push('/open-quests')}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <ChevronRight size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            
            {authoredQuests.slice(0, 3).map(quest => (
              <ChallengeCard
                key={quest.id}
                challenge={quest}
                onPress={() => router.push(`/challenge-detail/${quest.id}`)}
              />
            ))}
          </View>
        )}
        
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

      {/* Submissions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={submissionsModalVisible}
        onRequestClose={() => setSubmissionsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submissions</Text>
              <TouchableOpacity 
                onPress={() => setSubmissionsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {userSubmissionsData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <ScrollText size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No submissions yet</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {userSubmissionsData.map((submission) => (
                  <TouchableOpacity
                    key={submission.id}
                    style={styles.submissionItem}
                    onPress={() => {
                      setSubmissionsModalVisible(false);
                      router.push(`/submission-detail/${submission.id}`);
                    }}
                  >
                    <Image 
                      source={{ uri: submission.mediaUrl }}
                      style={styles.submissionImage}
                      resizeMode="cover"
                    />
                    <View style={styles.submissionContent}>
                      <Text style={styles.submissionTitle} numberOfLines={1}>
                        {submission.title}
                      </Text>
                      <Text style={styles.submissionDescription} numberOfLines={2}>
                        {submission.description}
                      </Text>
                      <View style={styles.submissionStats}>
                        <View style={styles.statBadge}>
                          <Heart size={14} color={colors.primary} />
                          <Text style={styles.statBadgeText}>{submission.likes || 0}</Text>
                        </View>
                        <View style={styles.statBadge}>
                          <MessageCircle size={14} color={colors.primary} />
                          <Text style={styles.statBadgeText}>
                            {Object.keys(submission.comments || {}).length}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Quests Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={questsModalVisible}
        onRequestClose={() => setQuestsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completed Quests</Text>
              <TouchableOpacity 
                onPress={() => setQuestsModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {completedQuestsData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Scroll size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No quests completed yet</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {completedQuestsData.map((quest) => (
                  <TouchableOpacity
                    key={quest.id}
                    style={styles.submissionItem}
                    onPress={() => {
                      setQuestsModalVisible(false);
                      router.push(`/${quest.type === 'daily' ? 'challenge' : 'creative-challenge'}/${quest.questId}`);
                    }}
                  >
                    {quest.imageUrl ? (
                      <Image 
                        source={{ uri: quest.imageUrl }}
                        style={styles.submissionImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.submissionImage, styles.placeholderImage]}>
                        <ScrollText size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.submissionContent}>
                      <Text style={styles.submissionTitle} numberOfLines={1}>
                        {quest.title}
                      </Text>
                      <Text style={styles.submissionDescription} numberOfLines={2}>
                        {quest.description}
                      </Text>
                      <View style={styles.submissionStats}>
                        <View style={styles.statBadge}>
                          <ScrollText size={14} color={colors.primary} />
                          <Text style={styles.statBadgeText}>
                            {quest.type === 'daily' ? 'Daily' : 'Creative'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Wisdom Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={wisdomModalVisible}
        onRequestClose={() => setWisdomModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Wisdom</Text>
              <TouchableOpacity 
                onPress={() => setWisdomModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {userWisdomData.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <BookOpen size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No wisdom shared yet</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {userWisdomData.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.submissionItem}
                    onPress={() => {
                      setWisdomModalVisible(false);
                      router.push(`/eco-tip-detail/${item.id}`);
                    }}
                  >
                    {item.imageUrl ? (
                      <Image 
                        source={{ uri: item.imageUrl }}
                        style={styles.submissionImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.submissionImage, styles.placeholderImage]}>
                        <BookOpen size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.submissionContent}>
                      <Text style={styles.submissionTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.submissionDescription} numberOfLines={2}>
                        {item.content}
                      </Text>
                      <View style={styles.submissionStats}>
                        <View style={styles.statBadge}>
                          <BookOpen size={14} color={colors.primary} />
                          <Text style={styles.statBadgeText}>
                            {item.resourceType || 'Eco Tip'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Badge Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={badgeModalVisible}
        onRequestClose={() => setBadgeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Badges</Text>
              <TouchableOpacity 
                onPress={() => setBadgeModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {badges.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Award size={40} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No badges earned yet</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalList}>
                {badges.map((badge) => (
                  <TouchableOpacity
                    key={badge.id}
                    style={styles.submissionItem}
                    onPress={() => {
                      setBadgeModalVisible(false);
                      // Optionally navigate to badge detail if you have that screen
                      // router.push(`/badge-detail/${badge.id}`);
                    }}
                  >
                    {badge.imageUrl ? (
                      <Image 
                        source={{ uri: badge.imageUrl }}
                        style={styles.submissionImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.submissionImage, styles.placeholderImage]}>
                        <Award size={24} color={colors.textSecondary} />
                      </View>
                    )}
                    <View style={styles.submissionContent}>
                      <Text style={styles.submissionTitle} numberOfLines={1}>
                        {badge.title || badge.name}
                      </Text>
                      <Text style={styles.submissionDescription} numberOfLines={2}>
                        {badge.description || "Complete challenges to earn this badge"}
                      </Text>
                      <View style={styles.submissionStats}>
                        <View style={styles.statBadge}>
                          <Award size={14} color={colors.primary} />
                          <Text style={styles.statBadgeText}>
                            {badge.category || 'Achievement'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
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
  headerButton: {
    padding: 8,
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
  submissionItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
  },
  submissionImage: {
    width: '33%',
    height: '100%',
  },
  submissionContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  submissionTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 4,
  },
  submissionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  submissionStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBadgeText: {
    ...typography.caption,
    color: colors.primary,
  },
  placeholderImage: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});