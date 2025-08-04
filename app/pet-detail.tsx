import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import LottieView from 'lottie-react-native';
import { ArrowLeft, Heart, Utensils, Trophy, Gamepad2, Apple } from 'lucide-react-native';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user-store';

const { width: screenWidth } = Dimensions.get('window');

interface PetData {
  name: string;
  level: number;
  experience: number;
  happiness: number;
  hunger: number;
  abilities: string[];
  personality: string;
  favoriteFood: string;
  birthdate: string;
}

interface OwnedItem {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function PetDetailScreen() {
  const router = useRouter();
  const { selectedPet, user } = useUserStore();
  const [expandedCard, setExpandedCard] = useState<'feed' | 'play' | null>(null);
  const [petStats, setPetStats] = useState({ happiness: 85, hunger: 30 });
  const [showLoveAnimation, setShowLoveAnimation] = useState(false);
  const feedAnimation = useRef(new Animated.Value(0)).current;
  const playAnimation = useRef(new Animated.Value(0)).current;
  const [foodItems, setFoodItems] = useState<OwnedItem[]>([
    { id: 'seaweed', name: 'Fresh Seaweed', icon: '🌿', count: 3 },
    { id: 'eco_berries', name: 'Eco Berries', icon: '🫐', count: 2 },
    { id: 'organic_seeds', name: 'Organic Seeds', icon: '🌰', count: 1 },
  ]);
  const [toyItems, setToyItems] = useState<OwnedItem[]>([
    { id: 'eco_ball', name: 'Eco Ball', icon: '⚽', count: 2 },
    { id: 'puzzle_tree', name: 'Puzzle Tree', icon: '🌳', count: 1 },
    { id: 'water_wheel', name: 'Water Wheel', icon: '🎡', count: 1 },
  ]);

  const getAnimationSource = () => {
    switch(selectedPet) {
      case 'turtle':
        return require('@/assets/animation/turtle.json');
      case 'bird':
        return require('@/assets/animation/bird.json');
      case 'giraffe':
        return require('@/assets/animation/giraffe.json');
      case 'duck':
      default:
        return require('@/assets/animation/duck.json');
    }
  };

  const getPetData = (): PetData => {
    switch(selectedPet) {
      case 'turtle':
        return {
          name: 'Sea Turtle',
          level: 5,
          experience: 60,
          happiness: petStats.happiness,
          hunger: petStats.hunger,
          abilities: ['Ocean Protection', 'Plastic Cleanup'],
          personality: 'Wise and calm',
          favoriteFood: 'Seaweed',
          birthdate: '2024-01-10',
        };
      case 'bird':
        return {
          name: 'Sky Guardian',
          level: 4,
          experience: 45,
          happiness: petStats.happiness,
          hunger: petStats.hunger,
          abilities: ['Air Quality Monitor', 'Eco-awareness'],
          personality: 'Graceful and alert',
          favoriteFood: 'Seeds',
          birthdate: '2024-02-01',
        };
      case 'giraffe':
        return {
          name: 'Forest Giant',
          level: 7,
          experience: 80,
          happiness: petStats.happiness,
          hunger: petStats.hunger,
          abilities: ['Tree Protection', 'Forest Care'],
          personality: 'Gentle and caring',
          favoriteFood: 'Leaves',
          birthdate: '2023-12-20',
        };
      case 'duck':
      default:
        return {
          name: 'Ocean Duck',
          level: 5,
          experience: 60,
          happiness: petStats.happiness,
          hunger: petStats.hunger,
          abilities: ['Water Conservation', 'Ocean Cleanup'],
          personality: 'Playful and energetic',
          favoriteFood: 'Seaweed Snacks',
          birthdate: '2024-01-15',
        };
    }
  };

  const currentPet = getPetData();
  const totalFood = foodItems.reduce((sum, item) => sum + item.count, 0);
  const totalToys = toyItems.reduce((sum, item) => sum + item.count, 0);

  const showLoveEffect = () => {
    setShowLoveAnimation(true);
    setTimeout(() => {
      setShowLoveAnimation(false);
    }, 2000);
  };

  const handleFeedPet = (item: OwnedItem) => {
    if (petStats.hunger === 0) {
      Alert.alert(
        "Pet is Full!",
        `${currentPet.name} is not hungry right now. Try playing with them instead!`,
        [{ text: "OK" }]
      );
      return;
    }
    
    if (item.count > 0) {
      setFoodItems(prev => 
        prev.map(food => 
          food.id === item.id 
            ? { ...food, count: food.count - 1 }
            : food
        )
      );
      setPetStats(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 15)
      }));
      showLoveEffect();
      setExpandedCard(null);
    }
  };

  const handlePlayWithPet = (item: OwnedItem) => {
    if (petStats.happiness === 100) {
      Alert.alert(
        "Pet is Very Happy!",
        `${currentPet.name} is already at maximum happiness! Maybe try feeding them instead?`,
        [{ text: "OK" }]
      );
      return;
    }
    
    if (item.count > 0) {
      setToyItems(prev => 
        prev.map(toy => 
          toy.id === item.id 
            ? { ...toy, count: toy.count - 1 }
            : toy
        )
      );
      setPetStats(prev => ({
        ...prev,
        happiness: Math.min(100, prev.happiness + 10)
      }));
      showLoveEffect();
      setExpandedCard(null);
    }
  };

  const toggleCard = (cardType: 'feed' | 'play') => {
    const isExpanding = expandedCard !== cardType;
    const animation = cardType === 'feed' ? feedAnimation : playAnimation;
    
    if (isExpanding) {
      setExpandedCard(cardType);
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setExpandedCard(null);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Pet Details',
          headerTitleStyle: styles.headerTitle,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.petContainer}>
          <LottieView
            source={getAnimationSource()}
            autoPlay
            loop
            style={styles.petAnimation}
          />
          {showLoveAnimation && (
            <View style={styles.loveAnimationContainer}>
              <LottieView
                source={require('@/assets/animation/love.json')}
                autoPlay
                loop={false}
                style={styles.loveAnimation}
              />
            </View>
          )}
        </View>

        <View style={styles.petInfoSection}>
          <Text style={styles.petName}>{currentPet.name}</Text>
          <Text style={styles.petPersonality}>{currentPet.personality}</Text>
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionCard, expandedCard === 'feed' && styles.expandedCard]}
              onPress={() => toggleCard('feed')}
            >
              <View style={styles.actionHeader}>
                <Apple size={24} color={colors.white} />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Feed Pet</Text>
                  <Text style={styles.actionCount}>Items: {totalFood}</Text>
                </View>
              </View>
              
              {expandedCard === 'feed' && (
                <Animated.View style={[
                  styles.itemsList,
                  {
                    opacity: feedAnimation,
                    maxHeight: feedAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                  }
                ]}>
                  {foodItems.filter(item => item.count > 0).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemButton}
                      onPress={() => handleFeedPet(item)}
                    >
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCount}>×{item.count}</Text>
                    </TouchableOpacity>
                  ))}
                  {foodItems.filter(item => item.count > 0).length === 0 && (
                    <Text style={styles.emptyText}>No food available. Visit the shop!</Text>
                  )}
                </Animated.View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, expandedCard === 'play' && styles.expandedCard]}
              onPress={() => toggleCard('play')}
            >
              <View style={styles.actionHeader}>
                <Gamepad2 size={24} color={colors.white} />
                <View style={styles.actionInfo}>
                  <Text style={styles.actionTitle}>Play with Pet</Text>
                  <Text style={styles.actionCount}>Items: {totalToys}</Text>
                </View>
              </View>
              
              {expandedCard === 'play' && (
                <Animated.View style={[
                  styles.itemsList,
                  {
                    opacity: playAnimation,
                    maxHeight: playAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                  }
                ]}>
                  {toyItems.filter(item => item.count > 0).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.itemButton}
                      onPress={() => handlePlayWithPet(item)}
                    >
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCount}>×{item.count}</Text>
                    </TouchableOpacity>
                  ))}
                  {toyItems.filter(item => item.count > 0).length === 0 && (
                    <Text style={styles.emptyText}>No toys available. Visit the shop!</Text>
                  )}
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Trophy size={20} color={colors.primary} />
              <Text style={styles.statTitle}>Level</Text>
              <Text style={styles.statValue}>{currentPet.level}</Text>
            </View>
            <View style={styles.statItem}>
              <Utensils size={20} color={colors.warning} />
              <Text style={styles.statTitle}>Hunger</Text>
              <Text style={styles.statValue}>{currentPet.hunger}%</Text>
            </View>
            <View style={styles.statItem}>
              <Heart size={20} color={colors.error} />
              <Text style={styles.statTitle}>Happiness</Text>
              <Text style={styles.statValue}>{currentPet.happiness}%</Text>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Experience</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${currentPet.experience}%` }]} />
            </View>
            <Text style={styles.progressText}>{currentPet.experience}% to next level</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Abilities:</Text>
            <Text style={styles.detailValue}>{currentPet.abilities.join(', ')}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Favorite Food:</Text>
            <Text style={styles.detailValue}>{currentPet.favoriteFood}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Birthday:</Text>
            <Text style={styles.detailValue}>{currentPet.birthdate}</Text>
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
  headerTitle: {
    ...typography.heading2,
    color: colors.primary,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  petContainer: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  petAnimation: {
    width: 200,
    height: 200,
  },
  loveAnimationContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 10,
  },
  loveAnimation: {
    width: 150,
    height: 150,
  },
  petInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  petName: {
    ...typography.heading1,
    color: colors.primary,
    marginBottom: 8,
  },
  petPersonality: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statValue: {
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
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
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
  actionsSection: {
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  expandedCard: {
    flex: 2,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  actionCount: {
    ...typography.caption,
    color: colors.white,
    opacity: 0.8,
  },
  itemsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemName: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  itemCount: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 12,
  },
});