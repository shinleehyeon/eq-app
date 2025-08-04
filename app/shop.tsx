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
import { X, Star, Coins, ArrowLeft, Check, Apple, Gamepad2 } from 'lucide-react-native';
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

interface ShopItem {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
  category: 'food' | 'toy';
  owned: boolean;
}

type TabType = 'pets' | 'food' | 'toys';

const pets: Pet[] = [
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

const foodItems: ShopItem[] = [
  {
    id: 'seaweed',
    name: 'Fresh Seaweed',
    price: 50,
    description: 'Nutritious seaweed that boosts your pet\'s happiness',
    icon: '🌿',
    category: 'food',
    owned: false,
  },
  {
    id: 'organic_seeds',
    name: 'Organic Seeds',
    price: 30,
    description: 'Premium organic seeds for flying pets',
    icon: '🌰',
    category: 'food',
    owned: false,
  },
  {
    id: 'eco_berries',
    name: 'Eco Berries',
    price: 75,
    description: 'Delicious berries that increase pet energy',
    icon: '🫐',
    category: 'food',
    owned: false,
  },
  {
    id: 'bamboo_snack',
    name: 'Bamboo Snack',
    price: 40,
    description: 'Crunchy bamboo treats for gentle giants',
    icon: '🎋',
    category: 'food',
    owned: false,
  },
];

const toyItems: ShopItem[] = [
  {
    id: 'eco_ball',
    name: 'Eco Ball',
    price: 100,
    description: 'A fun ball made from recycled materials',
    icon: '⚽',
    category: 'toy',
    owned: false,
  },
  {
    id: 'puzzle_tree',
    name: 'Puzzle Tree',
    price: 150,
    description: 'Interactive puzzle that teaches about nature',
    icon: '🌳',
    category: 'toy',
    owned: false,
  },
  {
    id: 'water_wheel',
    name: 'Water Wheel',
    price: 120,
    description: 'Spinning wheel toy for aquatic pets',
    icon: '🎡',
    category: 'toy',
    owned: false,
  },
  {
    id: 'flying_ring',
    name: 'Flying Ring',
    price: 80,
    description: 'Colorful ring toy for flying pets',
    icon: '🪁',
    category: 'toy',
    owned: false,
  },
];

export default function ShopScreen() {
  const router = useRouter();
  const { selectedPet: currentPetId, setSelectedPet: setCurrentPet, user } = useUserStore();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pets');
  const [userCoins, setUserCoins] = useState(user?.coins || 500);
  const [ownedPets, setOwnedPets] = useState<string[]>(['duck', 'bird']);
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  const handlePurchasePet = (pet: Pet) => {
    if (userCoins >= pet.price) {
      setUserCoins(userCoins - pet.price);
      setOwnedPets([...ownedPets, pet.id]);
      setCurrentPet(pet.id);
      console.log('Purchased and selected pet:', pet.name);
    }
    setSelectedPet(null);
  };

  const handlePurchaseItem = (item: ShopItem) => {
    if (userCoins >= item.price) {
      setUserCoins(userCoins - item.price);
      setOwnedItems([...ownedItems, item.id]);
      console.log('Purchased item:', item.name);
    }
    setSelectedItem(null);
  };

  const handleSelectPet = (petId: string) => {
    setCurrentPet(petId);
    setSelectedPet(null);
  };

  const PetCard = ({ pet }: { pet: Pet }) => {
    const isOwned = ownedPets.includes(pet.id);
    return (
      <TouchableOpacity
        style={[
          styles.petCard,
          { borderColor: isOwned ? rarityColors[pet.rarity] : colors.border },
          !isOwned && styles.notOwnedCard
        ]}
        onPress={() => setSelectedPet(pet)}
        activeOpacity={0.8}
      >
        {!isOwned && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockBadge}>
              <Coins size={14} color={colors.white} />
              <Text style={styles.lockText}>{pet.price}</Text>
            </View>
          </View>
        )}
        
        <View style={[styles.rarityBadge, { 
          backgroundColor: isOwned ? rarityColors[pet.rarity] : colors.textSecondary 
        }]}>
          <Text style={styles.rarityText}>{pet.rarity.toUpperCase()}</Text>
        </View>
        
        <View style={[styles.petAnimationContainer, !isOwned && styles.grayscale]}>
          <LottieView
            source={pet.animationSource}
            autoPlay
            loop
            style={[styles.petAnimation, !isOwned && { opacity: 0.5 }]}
          />
        </View>
        
        <Text style={[styles.petName, !isOwned && styles.notOwnedText]}>{pet.name}</Text>
        
        {!isOwned ? (
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
  };

  const ItemCard = ({ item }: { item: ShopItem }) => {
    const isOwned = ownedItems.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.itemCard,
          !isOwned && styles.notOwnedCard
        ]}
        onPress={() => setSelectedItem(item)}
        activeOpacity={0.8}
      >
        {!isOwned && (
          <View style={styles.lockOverlay}>
            <View style={styles.lockBadge}>
              <Coins size={14} color={colors.white} />
              <Text style={styles.lockText}>{item.price}</Text>
            </View>
          </View>
        )}
        
        <View style={[styles.itemIconContainer, !isOwned && styles.grayscale]}>
          <Text style={[styles.itemIcon, !isOwned && { opacity: 0.5 }]}>{item.icon}</Text>
        </View>
        
        <Text style={[styles.itemName, !isOwned && styles.notOwnedText]}>{item.name}</Text>
        
        {!isOwned ? (
          <View style={styles.priceContainer}>
            <Coins size={16} color={colors.warning} />
            <Text style={styles.price}>{item.price}</Text>
          </View>
        ) : (
          <View style={styles.ownedBadge}>
            <Text style={styles.ownedText}>OWNED</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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

      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pets' && styles.activeTab]}
            onPress={() => setActiveTab('pets')}
          >
            <Star size={20} color={activeTab === 'pets' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'pets' && styles.activeTabText]}>Pets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'food' && styles.activeTab]}
            onPress={() => setActiveTab('food')}
          >
            <Apple size={20} color={activeTab === 'food' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'food' && styles.activeTabText]}>Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'toys' && styles.activeTab]}
            onPress={() => setActiveTab('toys')}
          >
            <Gamepad2 size={20} color={activeTab === 'toys' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'toys' && styles.activeTabText]}>Toys</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'pets' && (
          <>
            <Text style={styles.sectionTitle}>Available Pets</Text>
            <View style={styles.petsGrid}>
              {pets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'food' && (
          <>
            <Text style={styles.sectionTitle}>Pet Food</Text>
            <View style={styles.itemsGrid}>
              {foodItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </View>
          </>
        )}

        {activeTab === 'toys' && (
          <>
            <Text style={styles.sectionTitle}>Pet Toys</Text>
            <View style={styles.itemsGrid}>
              {toyItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

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

                {ownedPets.includes(selectedPet.id) ? (
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
                    onPress={() => handlePurchasePet(selectedPet)}
                    disabled={userCoins < selectedPet.price}
                    style={styles.purchaseButton}
                  />
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>

            {selectedItem && (
              <>
                <View style={styles.modalItemIcon}>
                  <Text style={styles.modalItemIconText}>{selectedItem.icon}</Text>
                </View>

                <Text style={styles.modalPetName}>{selectedItem.name}</Text>
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>

                <View style={styles.modalPriceContainer}>
                  <Coins size={20} color={colors.warning} />
                  <Text style={styles.modalPrice}>{selectedItem.price} coins</Text>
                </View>

                {ownedItems.includes(selectedItem.id) ? (
                  <View style={styles.selectedContainer}>
                    <Check size={20} color={colors.success} />
                    <Text style={styles.selectedModalText}>Already Owned</Text>
                  </View>
                ) : (
                  <Button
                    title={userCoins >= selectedItem.price ? 'Purchase' : 'Not enough coins'}
                    onPress={() => handlePurchaseItem(selectedItem)}
                    disabled={userCoins < selectedItem.price}
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
  tabContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 25,
    padding: 6,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
    elevation: 4,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.white,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemCard: {
    width: (screenWidth - 48) / 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    elevation: 4,
  },
  itemIconContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  itemIcon: {
    fontSize: 60,
  },
  itemName: {
    ...typography.body,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalItemIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.background,
    borderRadius: 60,
  },
  modalItemIconText: {
    fontSize: 60,
  },
});