import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Image
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import LottieView from 'lottie-react-native';
import { X, Star, Coins, ArrowLeft, Check } from 'lucide-react-native';
import Button from '@/components/Button';
import { useUserStore } from '@/store/user-store';

const { width: screenWidth } = Dimensions.get('window');

interface Pet {
  id: string;
  name: string;
  price: number;
  description: string;
  animationSource: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  owned: boolean;
}

const pets: Pet[] = [
  {
    id: 'duck',
    name: 'Eco Duck',
    price: 100,
    description: 'A cheerful duck that loves keeping the environment clean!',
    animationSource: require('@/assets/animation/duck.json'),
    rarity: 'common',
    owned: true,
  },
  {
    id: 'turtle',
    name: 'Sea Turtle',
    price: 250,
    description: 'A wise turtle that protects ocean life and reduces plastic waste.',
    animationSource: require('@/assets/animation/turtle.json'),
    rarity: 'rare',
    owned: false,
  },
  {
    id: 'bird',
    name: 'Sky Guardian',
    price: 200,
    description: 'A graceful bird that monitors air quality and spreads eco-awareness.',
    animationSource: require('@/assets/animation/bird.json'),
    rarity: 'common',
    owned: true,
  },
  {
    id: 'giraffe',
    name: 'Forest Giant',
    price: 500,
    description: 'A gentle giraffe that helps protect forests and plant trees.',
    animationSource: require('@/assets/animation/giraffe.json'),
    rarity: 'epic',
    owned: false,
  },
];

const rarityColors = {
  common: '#9E9E9E',
  rare: '#3F51B5',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

export default function ShopScreen() {
  const router = useRouter();
  const { selectedPet: currentPetId, setSelectedPet: setCurrentPet } = useUserStore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [userCoins] = useState(500); // Mock user coins

  const handlePurchase = (pet: Pet) => {
    console.log('Purchasing:', pet.name);
    setSelectedPet(null);
  };

  const handleSelectPet = (petId: string) => {
    setCurrentPet(petId);
    setSelectedPet(null);
  };

  const PetCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petCard,
        { borderColor: pet.owned ? rarityColors[pet.rarity] : colors.border },
        !pet.owned && styles.notOwnedCard
      ]}
      onPress={() => setSelectedPet(pet)}
      activeOpacity={0.8}
    >
      {!pet.owned && (
        <View style={styles.lockOverlay}>
          <View style={styles.lockBadge}>
            <Coins size={14} color={colors.white} />
            <Text style={styles.lockText}>{pet.price}</Text>
          </View>
        </View>
      )}
      
      <View style={[styles.rarityBadge, { 
        backgroundColor: pet.owned ? rarityColors[pet.rarity] : colors.textSecondary 
      }]}>
        <Text style={styles.rarityText}>{pet.rarity.toUpperCase()}</Text>
      </View>
      
      <View style={[styles.petAnimationContainer, !pet.owned && styles.grayscale]}>
        <LottieView
          source={pet.animationSource}
          autoPlay
          loop
          style={[styles.petAnimation, !pet.owned && { opacity: 0.5 }]}
        />
      </View>
      
      <Text style={[styles.petName, !pet.owned && styles.notOwnedText]}>{pet.name}</Text>
      
      {!pet.owned ? (
        <View style={styles.priceContainer}>
          <Coins size={16} color={colors.warning} />
          <Text style={styles.price}>{pet.price}</Text>
        </View>
      ) : (
        <View style={styles.statusContainer}>
          {currentPetId === pet.id ? (
            <View style={styles.selectedBadge}>
              <Check size={12} color={colors.white} />
              <Text style={styles.ownedText}>SELECTED</Text>
            </View>
          ) : (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedText}>OWNED</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Pet Shop',
          headerTitleStyle: styles.headerTitle,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.header}>
        <View style={styles.coinsContainer}>
          <Coins size={24} color={colors.warning} />
          <Text style={styles.coinsText}>{userCoins}</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Available Pets</Text>
        
        <View style={styles.petsGrid}>
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </View>
      </ScrollView>

      {/* Pet Detail Modal */}
      <Modal
        visible={selectedPet !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPet(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedPet(null)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedPet && (
              <>
                <View style={[styles.modalRarityBadge, { backgroundColor: rarityColors[selectedPet.rarity] }]}>
                  <Text style={styles.modalRarityText}>{selectedPet.rarity.toUpperCase()}</Text>
                </View>

                <View style={styles.modalPetAnimation}>
                  <LottieView
                    source={selectedPet.animationSource}
                    autoPlay
                    loop
                    style={styles.modalAnimation}
                  />
                </View>

                <Text style={styles.modalPetName}>{selectedPet.name}</Text>
                <Text style={styles.modalDescription}>{selectedPet.description}</Text>

                <View style={styles.modalPriceContainer}>
                  <Coins size={20} color={colors.warning} />
                  <Text style={styles.modalPrice}>{selectedPet.price} coins</Text>
                </View>

                {selectedPet.owned ? (
                  currentPetId === selectedPet.id ? (
                    <View style={styles.selectedContainer}>
                      <Check size={20} color={colors.success} />
                      <Text style={styles.selectedModalText}>Currently Selected</Text>
                    </View>
                  ) : (
                    <Button
                      title="Select Pet"
                      onPress={() => handleSelectPet(selectedPet.id)}
                      style={styles.selectButton}
                    />
                  )
                ) : (
                  <Button
                    title={userCoins >= selectedPet.price ? 'Purchase' : 'Not enough coins'}
                    onPress={() => handlePurchase(selectedPet)}
                    disabled={userCoins < selectedPet.price}
                    style={styles.purchaseButton}
                  />
                )}
              </>
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
  headerTitle: {
    ...typography.heading2,
    color: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  coinsText: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
    color: colors.text,
  },
  petsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  petCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  rarityText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  petAnimationContainer: {
    width: '100%',
    height: 120,
    marginVertical: 8,
  },
  petAnimation: {
    width: '100%',
    height: '100%',
  },
  petName: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 4,
  },
  ownedText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  modalRarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalRarityText: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  modalPetAnimation: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  modalAnimation: {
    width: '100%',
    height: '100%',
  },
  modalPetName: {
    ...typography.heading2,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  modalPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalPrice: {
    ...typography.heading3,
    color: colors.warning,
    marginLeft: 8,
  },
  purchaseButton: {
    width: '100%',
  },
  ownedContainer: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ownedModalText: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  selectedModalText: {
    ...typography.body,
    color: colors.success,
    fontWeight: 'bold',
  },
  selectButton: {
    width: '100%',
    backgroundColor: colors.primary,
  },
  ownedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notOwnedCard: {
    backgroundColor: colors.background,
    opacity: 0.9,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  grayscale: {
    opacity: 0.4,
  },
  notOwnedText: {
    color: colors.textSecondary,
  },
  statusContainer: {
    marginTop: 8,
  },
});