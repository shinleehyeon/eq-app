import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert
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

export default function PetDetailScreen() {
  const router = useRouter();
  const { selectedPet, user } = useUserStore();
  const [foodCount, setFoodCount] = useState(5);
  const [toyCount, setToyCount] = useState(3);

  // Get animation source based on selected pet
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

  // Mock pet data based on selected pet
  const getPetData = (): PetData => {
    switch(selectedPet) {
      case 'turtle':
        return {
          name: 'Sea Turtle',
          level: 5,
          experience: 60,
          happiness: 85,
          hunger: 30,
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
          happiness: 90,
          hunger: 25,
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
          happiness: 75,
          hunger: 40,
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
          happiness: 85,
          hunger: 30,
          abilities: ['Water Conservation', 'Ocean Cleanup'],
          personality: 'Playful and energetic',
          favoriteFood: 'Seaweed Snacks',
          birthdate: '2024-01-15',
        };
    }
  };

  const currentPet = getPetData();

  const handleFeedPet = () => {
    if (foodCount > 0) {
      setFoodCount(foodCount - 1);
      Alert.alert('Success!', `${currentPet.name} enjoyed the food! Happiness increased!`);
    } else {
      Alert.alert('No Food', 'You need to buy food from the shop first!');
    }
  };

  const handlePlayWithPet = () => {
    if (toyCount > 0) {
      setToyCount(toyCount - 1);
      Alert.alert('Success!', `${currentPet.name} had fun playing! Energy increased!`);
    } else {
      Alert.alert('No Toys', 'You need to buy toys from the shop first!');
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
        {/* Pet Animation */}
        <View style={styles.petContainer}>
          <LottieView
            source={getAnimationSource()}
            autoPlay
            loop
            style={styles.petAnimation}
          />
        </View>

        {/* Pet Info */}
        <View style={styles.petInfoSection}>
          <Text style={styles.petName}>{currentPet.name}</Text>
          <Text style={styles.petPersonality}>{currentPet.personality}</Text>
        </View>

        {/* Pet Stats */}
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

        {/* Pet Details */}
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

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Apple size={32} color={colors.success} />
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Feed Pet</Text>
                <Text style={styles.actionCount}>Food available: {foodCount}</Text>
              </View>
            </View>
            <Button
              title="Feed"
              onPress={handleFeedPet}
              disabled={foodCount === 0}
              style={[styles.actionButton, { backgroundColor: colors.success }]}
            />
          </View>

          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Gamepad2 size={32} color={colors.primary} />
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Play with Pet</Text>
                <Text style={styles.actionCount}>Toys available: {toyCount}</Text>
              </View>
            </View>
            <Button
              title="Play"
              onPress={handlePlayWithPet}
              disabled={toyCount === 0}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
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
  },
  petAnimation: {
    width: 200,
    height: 200,
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
    gap: 16,
  },
  actionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 4,
  },
  actionCount: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actionButton: {
    width: '100%',
  },
});