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
import { X, Star, Coins, ArrowLeft } from 'lucide-react-native';
import Button from '@/components/Button';

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
    owned: false,
  },
  {
    id: 'turtle',
    name: 'Sea Turtle',
    price: 250,
    description: 'A wise turtle that protects ocean life and reduces plastic waste.',
    animationSource: require('@/assets/animation/turtle.json'),
    rarity: 'rare',
    owned: true,
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
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [userCoins] = useState(500); // Mock user coins

  const handlePurchase = (pet: Pet) => {
    console.log('Purchasing:', pet.name);
    setSelectedPet(null);
  };

  const PetCard = ({ pet }: { pet: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petCard,
        { borderColor: rarityColors[pet.rarity] }
      ]}
      onPress={() => setSelectedPet(pet)}
      activeOpacity={0.8}
    >
      <View style={[styles.rarityBadge, { backgroundColor: rarityColors[pet.rarity] }]}>
        <Text style={styles.rarityText}>{pet.rarity.toUpperCase()}</Text>
      </View>
      
      <View style={styles.petAnimationContainer}>
        <LottieView
          source={pet.animationSource}
          autoPlay
          loop
          style={styles.petAnimation}
        />
      </View>
      
      <Text style={styles.petName}>{pet.name}</Text>
      
      <View style={styles.priceContainer}>
        <Coins size={16} color={colors.accent} />
        <Text style={styles.price}>{pet.price}</Text>
      </View>
      
      {pet.owned && (
        <View style={styles.ownedBadge}>
          <Text style={styles.ownedText}>OWNED</Text>
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
          <Coins size={24} color={colors.accent} />
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
                  <Coins size={20} color={colors.accent} />
                  <Text style={styles.modalPrice}>{selectedPet.price} coins</Text>
                </View>

                {selectedPet.owned ? (
                  <View style={styles.ownedContainer}>
                    <Text style={styles.ownedModalText}>You already own this pet!</Text>
                  </View>
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
    color: colors.accent,
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
    color: colors.accent,
    marginLeft: 4,
  },
  ownedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    color: colors.accent,
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
});