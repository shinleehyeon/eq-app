import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated
} from 'react-native';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import { Award, Calendar, Leaf } from 'lucide-react-native';
import LottieView from 'lottie-react-native';

const { width: screenWidth } = Dimensions.get('window');

// Bubble Animation Component
const AnimatedBubble = ({ size, position, delay = 0 }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000 + delay * 500,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 2000 + delay * 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          ...position,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    />
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser } = useUserStore();
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
  
  // Don't render anything until initialization is complete
  if (isInitializing) {
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

        {/* Pet Section */}
        <View style={styles.petSection}>
          <View style={styles.petCard}>
            <View style={styles.petHeader}>
              <Text style={styles.sectionTitle}>Your Eco Pet</Text>
            </View>
            
            {/* Pet Animation */}
            <View style={styles.petAnimationWrapper}>
              <View style={styles.petBackground}>
                {/* Bubble Animations */}
                <AnimatedBubble size={20} position={{ top: '10%', left: '15%' }} delay={0} />
                <AnimatedBubble size={15} position={{ top: '20%', right: '20%' }} delay={1} />
                <AnimatedBubble size={25} position={{ bottom: '15%', left: '10%' }} delay={2} />
                <AnimatedBubble size={18} position={{ bottom: '25%', right: '15%' }} delay={3} />
                <AnimatedBubble size={12} position={{ top: '40%', left: '5%' }} delay={4} />
                
                <LottieView
                  source={require('@/assets/animation/turtle.json')}
                  autoPlay
                  loop
                  style={styles.petAnimation}
                />
              </View>
              
              {/* Pet Status Bars */}
              <View style={styles.petStats}>
                <View style={styles.statBar}>
                  <Text style={styles.statBarLabel}>Growth</Text>
                  <View style={styles.statBarTrack}>
                    <View style={[styles.statBarFill, { width: '60%', backgroundColor: colors.primary }]} />
                  </View>
                </View>
              </View>
            </View>
            
            {/* Shop Button */}
            <Button
              title="Visit Pet Shop"
              onPress={() => {
                // Navigation will be added later
                console.log('Navigate to shop');
              }}
              style={styles.shopButton}
            />
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
  petSection: {
    padding: 16,
  },
  petCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 8,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  petBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  petBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  petAnimationWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petBackground: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    backgroundColor: '#E8F5E9',
    borderRadius: screenWidth * 0.3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary + '20',
  },
  petAnimation: {
    width: '90%',
    height: '90%',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  petStats: {
    width: '100%',
    paddingHorizontal: 10,
  },
  statBar: {
    marginBottom: 12,
  },
  statBarLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statBarTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  petInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petName: {
    ...typography.heading2,
    color: colors.primary,
    marginBottom: 8,
  },
  petMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  shopButton: {
    width: '100%',
  },
});