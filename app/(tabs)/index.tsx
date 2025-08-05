import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
  Modal,
  Easing
} from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import { Award, Calendar, Info, ShoppingBag, X, Heart, Utensils, Trophy, Coins, Target, CheckCircle, Route, Users, PawPrint } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { apiClient } from '@/lib/api/client';

const { width: screenWidth } = Dimensions.get('window');

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

const FloatingPetBackground = ({ children }) => {
  const floatAnimation = React.useRef(new Animated.Value(0)).current;
  const rotateAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: -1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = floatAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const translateX = rotateAnimation.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-10, 0, 10],
  });

  const scale = floatAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1],
  });

  return (
    <Animated.View
      style={[
        styles.petBackground,
        {
          transform: [{ translateY }, { translateX }, { scale }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, initializeUser, selectedPet, accessToken, updateCoins, setSelectedPet } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTurtleAnimating, setIsTurtleAnimating] = useState(true);
  const [showPetModal, setShowPetModal] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [mainPetData, setMainPetData] = useState<any>(null);
  const [displayCoins, setDisplayCoins] = useState(0);
  const animationRef = React.useRef(null);
  const timeoutRef = React.useRef<number | null>(null);
  const animatedCoinValue = useRef(new Animated.Value(0)).current;
  
  const getAnimationSource = () => {
    const petType = mainPetData?.type || selectedPet;
    switch(petType) {
      case 'turtle':
        return require('@/assets/animation/turtle.json');
      case 'bird':
        return require('@/assets/animation/bird.json');
      case 'parrot':
        return require('@/assets/animation/bird.json');
      case 'giraffe':
        return require('@/assets/animation/giraffe.json');
      case 'duck':
        return require('@/assets/animation/duck.json');
      default:
        return require('@/assets/animation/bird.json');
    }
  };

  const getPetAbilities = (type: string) => {
    switch(type) {
      case 'turtle':
        return ['Ocean Protection', 'Plastic Cleanup'];
      case 'bird':
      case 'parrot':
        return ['Air Quality Monitor', 'Eco-awareness'];
      case 'giraffe':
        return ['Tree Protection', 'Forest Care'];
      case 'duck':
      default:
        return ['Water Conservation', 'Ocean Cleanup'];
    }
  };

  const getPetPersonality = (type: string) => {
    switch(type) {
      case 'turtle':
        return 'Wise and calm';
      case 'bird':
      case 'parrot':
        return 'Graceful and alert';
      case 'giraffe':
        return 'Gentle and caring';
      case 'duck':
      default:
        return 'Playful and energetic';
    }
  };

  const getPetFavoriteFood = (type: string) => {
    switch(type) {
      case 'turtle':
        return 'Seaweed';
      case 'bird':
      case 'parrot':
        return 'Seeds';
      case 'giraffe':
        return 'Leaves';
      case 'duck':
      default:
        return 'Seaweed Snacks';
    }
  };

  const currentPet = mainPetData ? {
    name: mainPetData.name,
    level: mainPetData.level,
    experience: mainPetData.experienceProgress || 0,
    happiness: mainPetData.happiness,
    hunger: mainPetData.hunger,
    abilities: getPetAbilities(mainPetData.type),
    personality: getPetPersonality(mainPetData.type),
    favoriteFood: getPetFavoriteFood(mainPetData.type),
    birthdate: new Date(mainPetData.createdAt).toLocaleDateString(),
  } : null;
  
  useEffect(() => {
    const ensureUserInitialization = async () => {
      try {
        if (accessToken) {
          const [profileResult, mainPetResult] = await Promise.all([
            apiClient.getProfile(accessToken),
            apiClient.getMainPet(accessToken)
          ]);
          
          if (profileResult.success && profileResult.data) {
            setProfileData(profileResult.data.user);
            const coins = profileResult.data.user.marathonPoints || 0;
            setDisplayCoins(coins);
            animatedCoinValue.setValue(coins);
            updateCoins(coins);
          }
          
          if (mainPetResult.success && mainPetResult.data) {
            setMainPetData(mainPetResult.data.mainPet);
            setSelectedPet(mainPetResult.data.mainPet.type);
          }
        }
        
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
  }, [accessToken]);

  const animateCoins = useCallback(() => {
    const targetCoins = user?.coins !== undefined ? user.coins : (profileData?.marathonPoints || 0);
    
    const listener = animatedCoinValue.addListener(({ value }) => {
      setDisplayCoins(Math.floor(value));
    });

    animatedCoinValue.setValue(0);
    
    Animated.timing(animatedCoinValue, {
      toValue: targetCoins,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedCoinValue.removeListener(listener);
    };
  }, [user?.coins, profileData?.marathonPoints, animatedCoinValue]);

  useFocusEffect(
    useCallback(() => {
      const cleanup = animateCoins();
      
      const refreshMainPet = async () => {
        if (accessToken) {
          const mainPetResult = await apiClient.getMainPet(accessToken);
          if (mainPetResult.success && mainPetResult.data) {
            setMainPetData(mainPetResult.data.mainPet);
            setSelectedPet(mainPetResult.data.mainPet.type);
          }
        }
      };
      
      refreshMainPet();
      return cleanup;
    }, [animateCoins, accessToken])
  );

  useEffect(() => {
    if (profileData || user) {
      animateCoins();
    }
  }, [user?.coins, animateCoins]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  if (isInitializing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  const currentUser = user || {
    id: 'default',
    name: 'Guest User',
    email: 'guest@example.com',
    level: 1,
    streak: 0,
    coins: 0,
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

  const completedQuests = currentUser?.completedQuests || [];
  

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userStatsContainer}>
          <View style={styles.nameCoinsContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{currentUser.name}</Text>
            </View>
            
            <View style={styles.coinsContainer}>
              <Coins size={28} color={colors.warning} />
              <Text style={styles.coinsText}>{displayCoins}</Text>
            </View>
          </View>
        </View>

        <View style={styles.questStatsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Active Quests</Text>
            </View>
            
            <View style={styles.statItem}>
              <CheckCircle size={20} color={colors.success} />
              <Text style={styles.statValue}>{completedQuests.length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <PawPrint size={20} color={colors.success} />
              <Text style={styles.statValue}>{(profileData?.petToys || 0) + (profileData?.petFood || 0)}</Text>
              <Text style={styles.statLabel}>Pet Items</Text>
            </View>
          </View>
        </View>

        <View style={styles.marathonStatusContainer}>
          <View style={styles.marathonStatusInfo}>
            <View style={styles.marathonStatusHeader}>
              <Route size={16} color={colors.primary} />
              <Text style={styles.marathonStatusTitle}>Eco Marathon Challenge</Text>
            </View>
            <View style={styles.marathonStatusFooter}>
              <View style={styles.marathonStatusDot} />
              <Text style={styles.marathonStatusText}>Participating</Text>
            </View>
          </View>
        </View>

        <View style={styles.petSection}>
          <View style={styles.petCard}>
            <View style={styles.petHeader}>
              <Text style={styles.sectionTitle}>Your Eco Pet</Text>
            </View>
            
            <View style={styles.petAnimationWrapper}>
              <FloatingPetBackground>
                <LottieView
                  ref={animationRef}
                  source={getAnimationSource()}
                  autoPlay={isTurtleAnimating}
                  loop={false}
                  style={[
                    styles.petAnimation,
                    (mainPetData?.type === 'duck' || selectedPet === 'duck') && styles.petAnimationDuck,
                    (mainPetData?.type === 'turtle' || selectedPet === 'turtle') && styles.petAnimationTurtle,
                    (mainPetData?.type === 'giraffe' || selectedPet === 'giraffe') && styles.petAnimationGiraffe,
                    (mainPetData?.type === 'bird' || mainPetData?.type === 'parrot' || selectedPet === 'bird') && styles.petAnimationBird,
                  ]}
                  onAnimationFinish={() => {
                    setIsTurtleAnimating(false);
                    timeoutRef.current = setTimeout(() => {
                      setIsTurtleAnimating(true);
                      if (animationRef.current) {
                        (animationRef.current as any).play();
                      }
                    }, 2000);
                  }}
                />
              </FloatingPetBackground>
              
              <AnimatedBubble size={20} position={{ position: 'absolute', top: '10%', left: '15%' }} delay={0} />
              <AnimatedBubble size={15} position={{ position: 'absolute', top: '20%', right: '20%' }} delay={1} />
              <AnimatedBubble size={25} position={{ position: 'absolute', bottom: '15%', left: '10%' }} delay={2} />
              <AnimatedBubble size={18} position={{ position: 'absolute', bottom: '25%', right: '15%' }} delay={3} />
              <AnimatedBubble size={12} position={{ position: 'absolute', top: '40%', left: '5%' }} delay={4} />
              
              <View style={styles.petStats}>
                <View style={styles.statBar}>
                </View>
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.detailButton]}
                onPress={() => {
                  if (mainPetData?.uuid) {
                    router.push(`/pet-detail?uuid=${mainPetData.uuid}`);
                  } else {
                    router.push('/pet-detail');
                  }
                }}
              >
                <Info size={18} color={colors.white} />
                <Text style={styles.buttonText}>Pet Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.shopButton]}
                onPress={() => router.push('/shop')}
              >
                <ShoppingBag size={18} color={colors.white} />
                <Text style={styles.buttonText}>Pet Shop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        <View style={styles.communitySection}>
          <TouchableOpacity 
            style={styles.communityButton}
            onPress={() => router.push('/screens/community')}
          >
            <Users size={20} color={colors.white} />
            <Text style={styles.communityButtonText}>Go to Community</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
            
      <Modal
        visible={showPetModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPetModal(false)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pet Details</Text>
            </View>
            
            <View style={styles.modalPetContainer}>
              <LottieView
                source={getAnimationSource()}
                autoPlay
                loop
                style={styles.modalPetAnimation}
              />
            </View>
            
            <View style={styles.petInfoSection}>
              <Text style={styles.modalPetName}>{currentPet?.name || 'Loading...'}</Text>
              <Text style={styles.petPersonality}>{currentPet?.personality || ''}</Text>
            </View>
            
            <View style={styles.statsSection}>
              <View style={styles.statRow}>
                <View style={styles.modalStatItem}>
                  <Trophy size={16} color={colors.primary} />
                  <Text style={styles.statTitle}>Level</Text>
                  <Text style={styles.modalStatValue}>{currentPet?.level || 0}</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Utensils size={16} color={colors.warning} />
                  <Text style={styles.statTitle}>Hunger</Text>
                  <Text style={styles.modalStatValue}>{currentPet?.hunger || 0}%</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Heart size={16} color={colors.error} />
                  <Text style={styles.statTitle}>Happiness</Text>
                  <Text style={styles.modalStatValue}>{currentPet?.happiness || 0}%</Text>
                </View>
              </View>
              
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Experience</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${currentPet?.experience || 0}%` }]} />
                </View>
                <Text style={styles.progressText}>{currentPet?.experience || 0}% to next level</Text>
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Abilities:</Text>
                <Text style={styles.detailValue}>{currentPet?.abilities?.join(', ') || 'Loading...'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Favorite Food:</Text>
                <Text style={styles.detailValue}>{currentPet?.favoriteFood || 'Loading...'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Birthday:</Text>
                <Text style={styles.detailValue}>{currentPet?.birthdate || 'Loading...'}</Text>
              </View>
            </View>
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
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nameCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 21,
    color: colors.text,
    fontWeight: '700',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinsText: {
    ...typography.heading3,
    color: colors.warning,
    fontWeight: 'bold',
  },
  questStatsContainer: {
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
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
    paddingBottom: 16,
  },
  petCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
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
    position: 'relative',
    overflow: 'hidden',
  },
  petBackground: {
    width: screenWidth * 0.45,
    height: screenWidth * 0.45,
    backgroundColor: '#E1F5FE',
    borderRadius: screenWidth * 0.225,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
    borderWidth: 2,
    borderColor: '#B3E5FC',
  },
  petAnimation: {
    width: '90%',
    height: '90%',
  },
  petAnimationDuck: {
    width: '110%',
    height: '110%',
  },
  petAnimationTurtle: {
    width: '100%',
    height: '100%',
  },
  petAnimationBird: {
    width: '90%',
    height: '90%',
  },
  petAnimationGiraffe: {
    width: '80%',
    height: '80%',
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(144, 202, 249, 0.5)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(100, 181, 246, 0.7)',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailButton: {
    backgroundColor: colors.primary,
  },
  shopButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...typography.heading2,
    color: colors.text,
  },
  modalPetContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPetAnimation: {
    width: 150,
    height: 150,
  },
  petInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalPetName: {
    ...typography.heading2,
    color: colors.primary,
    marginBottom: 8,
  },
  petPersonality: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsSection: {
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalStatValue: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  detailsSection: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  communitySection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  communityButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  communityButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  marathonStatusContainer: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  marathonStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  marathonStatusInfo: {
    flex: 1,
  },
  marathonStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
    marginTop: 3,
  },
  marathonStatusTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  marathonStatusFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  marathonStatusText: {
    ...typography.caption,
    color: colors.success,
    marginLeft: 0,
    fontWeight: '600',
  },
});