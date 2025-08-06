import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import LottieView from "lottie-react-native";
import {
  ArrowLeft,
  Heart,
  Utensils,
  Trophy,
  Gamepad2,
  Apple,
} from "lucide-react-native";
import Button from "@/components/Button";
import { useUserStore } from "@/store/user-store";
import { apiClient } from "@/lib/api/client";

const { width: screenWidth } = Dimensions.get("window");

interface PetData {
  uuid: string;
  name: string;
  type: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  experienceProgress: number;
  happiness: number;
  hunger: number;
  status: string;
  petImage: string | null;
  lastFedAt: string | null;
  lastPlayedAt: string | null;
  createdAt: string;
  isMainPet?: boolean;
}

interface OwnedItem {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function PetDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const petUuid = params.uuid as string;
  const { selectedPet, user, accessToken } = useUserStore();
  const [petData, setPetData] = useState<PetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<"feed" | "play" | null>(
    null
  );
  const [loveAnimations, setLoveAnimations] = useState<
    { id: number; x: number; y: number }[]
  >([]);
  const feedAnimation = useRef(new Animated.Value(0)).current;
  const playAnimation = useRef(new Animated.Value(0)).current;
  const [foodItems, setFoodItems] = useState<OwnedItem[]>([]);
  const [toyItems, setToyItems] = useState<OwnedItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);

  useEffect(() => {
    fetchPetData();
    fetchUserItems();
  }, [petUuid]);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      if (!accessToken) {
        Alert.alert("Error", "No authentication token found");
        return;
      }

      if (!petUuid) {
        const mainPetResponse = await apiClient.getMainPet(accessToken);
        if (mainPetResponse.success && mainPetResponse.data) {
          setPetData(mainPetResponse.data.mainPet);
        } else {
          Alert.alert("Error", "Failed to fetch main pet");
        }
      } else {
        const response = await apiClient.getPetDetail(petUuid, accessToken);
        if (response.success && response.data) {
          setPetData(response.data.pet);
        } else {
          Alert.alert("Error", response.error || "Failed to fetch pet data");
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
      Alert.alert("Error", "Failed to load pet data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      setItemsLoading(true);
      if (!accessToken) {
        return;
      }

      const response = await apiClient.getMyItems(accessToken);
      if (response.success && response.data) {
        const items = response.data.items;

        const foodIconMap: { [key: string]: string } = {
          fresh_seaweed: "🌿",
          eco_berries: "🫐",
          organic_seeds: "🌰",
          bamboo_snack: "🎋",
        };

        const toyIconMap: { [key: string]: string } = {
          eco_ball: "⚽",
          puzzle_tree: "🌳",
          water_wheel: "🎡",
          flying_ring: "🪁",
        };

        const foods = items
          .filter((item) => item.type === "food")
          .map((item) => ({
            id: item.name,
            name: item.displayName,
            icon: foodIconMap[item.name] || "🍃",
            count: item.quantity,
          }));

        const toys = items
          .filter((item) => item.type === "toy")
          .map((item) => ({
            id: item.name,
            name: item.displayName,
            icon: toyIconMap[item.name] || "🎮",
            count: item.quantity,
          }));

        setFoodItems(foods);
        setToyItems(toys);
      }
    } catch (error) {
      console.error("Error fetching user items:", error);
    } finally {
      setItemsLoading(false);
    }
  };

  const getAnimationSource = () => {
    const type = petData?.type || selectedPet;
    switch (type) {
      case "turtle":
        return require("@/assets/animation/turtle.json");
      case "bird":
      case "parrot":
      case "otter":
        return require("@/assets/animation/bird.json");
      case "giraffe":
        return require("@/assets/animation/giraffe.json");
      case "duck":
      default:
        return require("@/assets/animation/duck.json");
    }
  };

  const getPetPersonality = (type: string) => {
    switch (type) {
      case "turtle":
        return "Wise and calm";
      case "bird":
      case "otter":
        return "Graceful and alert";
      case "giraffe":
        return "Gentle and caring";
      case "duck":
      default:
        return "Playful and energetic";
    }
  };

  const getPetAbilities = (type: string) => {
    switch (type) {
      case "turtle":
        return ["Ocean Protection", "Plastic Cleanup"];
      case "bird":
      case "otter":
        return ["Air Quality Monitor", "Eco-awareness"];
      case "giraffe":
        return ["Tree Protection", "Forest Care"];
      case "duck":
      default:
        return ["Water Conservation", "Ocean Cleanup"];
    }
  };

  const getPetFavoriteFood = (type: string) => {
    switch (type) {
      case "turtle":
        return "Seaweed";
      case "bird":
        return "Seeds";
      case "giraffe":
        return "Leaves";
      case "duck":
      default:
        return "Seaweed Snacks";
    }
  };
  const totalFood = foodItems.reduce((sum, item) => sum + item.count, 0);
  const totalToys = toyItems.reduce((sum, item) => sum + item.count, 0);

  const showLoveEffect = () => {
    const positions = [
      { x: -100, y: 20 },
      { x: 0, y: 0 },
      { x: 100, y: 20 },
    ];

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const id = Date.now() + i;
        const basePos = positions[i];
        const x = basePos.x + (-20 + Math.random() * 40);
        const y = basePos.y + (-20 + Math.random() * 40);

        setLoveAnimations((prev) => [...prev, { id, x, y }]);

        setTimeout(() => {
          setLoveAnimations((prev) => prev.filter((anim) => anim.id !== id));
        }, 2000);
      }, i * 200);
    }
  };

  const handleFeedPet = async (item: OwnedItem) => {
    if (!petData) return;

    if (petData.hunger === 0) {
      Alert.alert(
        "Pet is Full!",
        `${petData.name} is not hungry right now. Try playing with them instead!`,
        [{ text: "OK" }]
      );
      return;
    }

    if (item.count > 0) {
      try {
        const response = await apiClient.useItem(
          petData.uuid,
          item.id,
          accessToken || undefined
        );

        if (response.success && response.data) {
          setPetData(response.data.pet);

          setFoodItems((prev) =>
            prev.map((food) =>
              food.id === item.id ? { ...food, count: food.count - 1 } : food
            )
          );

          showLoveEffect();
          setExpandedCard(null);

          if (response.data.leveledUp) {
            Alert.alert(
              "Level Up!",
              `${response.data.pet.name} has reached level ${response.data.pet.level}!`,
              [{ text: "Great!" }]
            );
          }
        } else {
          Alert.alert("Error", response.error || "Failed to use item");
        }
      } catch (error) {
        console.error("Error using item:", error);
        Alert.alert("Error", "Failed to use item");
      }
    }
  };

  const handlePlayWithPet = async (item: OwnedItem) => {
    if (!petData) return;

    if (item.count > 0) {
      try {
        const response = await apiClient.useItem(
          petData.uuid,
          item.id,
          accessToken || undefined
        );

        if (response.success && response.data) {
          setPetData(response.data.pet);

          setToyItems((prev) =>
            prev.map((toy) =>
              toy.id === item.id ? { ...toy, count: toy.count - 1 } : toy
            )
          );

          showLoveEffect();
          setExpandedCard(null);

          if (response.data.leveledUp) {
            Alert.alert(
              "Level Up!",
              `${response.data.pet.name} has reached level ${response.data.pet.level}!`,
              [{ text: "Great!" }]
            );
          }
        } else {
          Alert.alert("Error", response.error || "Failed to use item");
        }
      } catch (error) {
        console.error("Error using item:", error);
        Alert.alert("Error", "Failed to use item");
      }
    }
  };

  const toggleCard = (cardType: "feed" | "play") => {
    const isExpanding = expandedCard !== cardType;
    const animation = cardType === "feed" ? feedAnimation : playAnimation;

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
          title: "Pet Details",
          headerTitleStyle: styles.headerTitle,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : petData ? (
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
            {loveAnimations.map((anim) => (
              <View
                key={anim.id}
                style={[
                  styles.loveAnimationContainer,
                  {
                    transform: [{ translateX: anim.x }, { translateY: anim.y }],
                  },
                ]}
              >
                <LottieView
                  source={require("@/assets/animation/love.json")}
                  autoPlay
                  loop={false}
                  style={styles.loveAnimation}
                />
              </View>
            ))}
          </View>

          <View style={styles.petInfoSection}>
            <Text style={styles.petName}>{petData.name}</Text>
            <Text style={styles.petPersonality}>
              {getPetPersonality(petData.type)}
            </Text>
          </View>

          <View style={styles.actionsSection}>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  expandedCard === "feed" && styles.expandedCard,
                ]}
                onPress={() => toggleCard("feed")}
              >
                <View style={styles.actionHeader}>
                  <Apple size={24} color={colors.white} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Feed Pet</Text>
                    <Text style={styles.actionCount}>
                      Items: {itemsLoading ? "..." : totalFood}
                    </Text>
                  </View>
                </View>

                {expandedCard === "feed" && (
                  <Animated.View
                    style={[
                      styles.itemsList,
                      {
                        opacity: feedAnimation,
                        maxHeight: feedAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 300],
                        }),
                      },
                    ]}
                  >
                    {foodItems
                      .filter((item) => item.count > 0)
                      .map((item) => (
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
                    {itemsLoading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : foodItems.filter((item) => item.count > 0).length ===
                      0 ? (
                      <Text style={styles.emptyText}>
                        No food available. Visit the shop!
                      </Text>
                    ) : null}
                  </Animated.View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionCard,
                  expandedCard === "play" && styles.expandedCard,
                ]}
                onPress={() => toggleCard("play")}
              >
                <View style={styles.actionHeader}>
                  <Gamepad2 size={24} color={colors.white} />
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Play with Pet</Text>
                    <Text style={styles.actionCount}>
                      Items: {itemsLoading ? "..." : totalToys}
                    </Text>
                  </View>
                </View>

                {expandedCard === "play" && (
                  <Animated.View
                    style={[
                      styles.itemsList,
                      {
                        opacity: playAnimation,
                        maxHeight: playAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 300],
                        }),
                      },
                    ]}
                  >
                    {toyItems
                      .filter((item) => item.count > 0)
                      .map((item) => (
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
                    {itemsLoading ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : toyItems.filter((item) => item.count > 0).length ===
                      0 ? (
                      <Text style={styles.emptyText}>
                        No toys available. Visit the shop!
                      </Text>
                    ) : null}
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
                <Text style={styles.statValue}>{petData.level}</Text>
              </View>
              <View style={styles.statItem}>
                <Utensils size={20} color={colors.warning} />
                <Text style={styles.statTitle}>Hunger</Text>
                <Text style={styles.statValue}>{petData.hunger}</Text>
              </View>
              <View style={styles.statItem}>
                <Heart size={20} color={colors.error} />
                <Text style={styles.statTitle}>Happiness</Text>
                <Text style={styles.statValue}>{petData.happiness}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>Experience</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(0, petData.experienceProgress)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                You need to get{" "}
                {petData.experienceToNextLevel - petData.experience} XP to next
                level
              </Text>
            </View>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Abilities:</Text>
              <Text style={styles.detailValue}>
                {getPetAbilities(petData.type).join(", ")}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Favorite Food:</Text>
              <Text style={styles.detailValue}>
                {getPetFavoriteFood(petData.type)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Birthday:</Text>
              <Text style={styles.detailValue}>
                {new Date(petData.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load pet data</Text>
          <Button title="Retry" onPress={fetchPetData} />
        </View>
      )}
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
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
  },
  petAnimation: {
    width: 200,
    height: 200,
  },
  loveAnimationContainer: {
    position: "absolute",
    top: 50,
    left: "50%",
    marginLeft: -60,
    zIndex: 10,
  },
  loveAnimation: {
    width: 120,
    height: 120,
  },
  petInfoSection: {
    alignItems: "center",
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
    fontStyle: "italic",
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
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statValue: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: "bold",
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
    overflow: "hidden",
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  detailValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: "right",
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: "row",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: "bold",
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
    borderTopColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  itemButton: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
});
