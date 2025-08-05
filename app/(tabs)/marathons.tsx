import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import {
  Calendar,
  Users,
  Trophy,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { apiClient } from "@/lib/api/client";
import { useUserStore } from "@/store/user-store";

interface Marathon {
  uuid: string;
  title: string;
  description: string;
  status: "active" | "upcoming" | "completed";
  startDate: string;
  endDate: string;
  requiredQuestPoints: number;
  finalMarathonPoints: number;
  finalExperience: number;
  eventImage: string;
  organizer: {
    uuid: string;
    name: string;
    profileImage: string;
  };
  participantCount: number;
  spots: Array<{
    uuid: string;
    name: string;
    description: string;
    milestoneOrder: number;
    requiredQuestPoints: number;
    marathonPointsBonus: number;
    experienceBonus: number;
    milestoneImage: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface MarathonResponse {
  message: string;
  data: Marathon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function MarathonsScreen() {
  const router = useRouter();
  const { accessToken } = useUserStore();
  const [marathons, setMarathons] = useState<Marathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMarathons = async (
    pageNum: number = 1,
    refresh: boolean = false
  ) => {
    try {
      const response = await apiClient.get<MarathonResponse>(
        `/marathons?page=${pageNum}&limit=10`,
        accessToken || undefined
      );

      if (response.success && response.data) {
        const newMarathons = response.data.data || [];
        const pagination = response.data.pagination;

        console.log('Marathon data:', newMarathons);
        console.log('First marathon eventImage:', newMarathons[0]?.eventImage);

        if (refresh) {
          setMarathons(newMarathons);
        } else {
          setMarathons((prev) => [...prev, ...newMarathons]);
        }

        setHasMore(pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching marathons:", error);
      Alert.alert("Error", "Failed to load marathons");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarathons(1, true);
  };

  useEffect(() => {
    fetchMarathons(1, true);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.success;
      case "upcoming":
        return colors.primary;
      case "completed":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const handleMarathonPress = (marathonId: string) => {
    router.push('/marathon-detail');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Marathons",
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            if (hasMore && !loading) {
              fetchMarathons(page + 1);
            }
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.content}>
          {loading && marathons.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading marathons...</Text>
            </View>
          ) : marathons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Trophy size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>No marathons available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new eco marathons!
              </Text>
            </View>
          ) : (
            marathons.map((marathon) => (
              <TouchableOpacity
                key={marathon.uuid}
                style={styles.marathonCard}
                onPress={() => handleMarathonPress(marathon.uuid)}
                activeOpacity={0.7}
              >
                <Image
                  source={
                    marathon.eventImage 
                      ? { uri: marathon.eventImage }
                      : require('@/assets/images/ad.png')
                  }
                  style={styles.marathonImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Image loading error:', error.nativeEvent.error);
                    console.log('Image URL:', marathon.eventImage);
                  }}
                />

                <View style={styles.cardContent}>
                  <View style={styles.statusBadge}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(marathon.status) },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(marathon.status) },
                      ]}
                    >
                      {getStatusText(marathon.status)}
                    </Text>
                  </View>

                  <Text style={styles.marathonTitle}>{marathon.title}</Text>
                  <Text style={styles.marathonDescription} numberOfLines={2}>
                    {marathon.description}
                  </Text>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <Calendar size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {formatDate(marathon.startDate)} -{" "}
                        {formatDate(marathon.endDate)}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Users size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {marathon.participantCount} participants
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <MapPin size={16} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {marathon.spots.length} checkpoints
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rewardsContainer}>
                    <View style={styles.rewardItem}>
                      <Text style={styles.rewardValue}>
                        {marathon.finalMarathonPoints}
                      </Text>
                      <Text style={styles.rewardLabel}>Points</Text>
                    </View>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardItem}>
                      <Text style={styles.rewardValue}>
                        {marathon.finalExperience}
                      </Text>
                      <Text style={styles.rewardLabel}>XP</Text>
                    </View>
                    <View style={styles.rewardDivider} />
                    <View style={styles.rewardItem}>
                      <Text style={styles.rewardValue}>
                        {marathon.requiredQuestPoints}
                      </Text>
                      <Text style={styles.rewardLabel}>Required</Text>
                    </View>
                  </View>

                  <View style={styles.organizerContainer}>
                    <Image
                      source={{ uri: marathon.organizer.profileImage }}
                      style={styles.organizerAvatar}
                    />
                    <Text style={styles.organizerText}>
                      Organized by{" "}
                      <Text style={styles.organizerName}>
                        {marathon.organizer.name}
                      </Text>
                    </Text>
                    <ChevronRight
                      size={20}
                      color={colors.textSecondary}
                      style={styles.chevronIcon}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  header: {
    backgroundColor: colors.background,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    ...typography.heading4,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
  marathonCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  marathonImage: {
    width: "100%",
    height: 120,
  },
  cardContent: {
    padding: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  marathonTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 8,
    fontWeight: "700",
  },
  marathonDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  rewardsContainer: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  rewardItem: {
    flex: 1,
    alignItems: "center",
  },
  rewardValue: {
    ...typography.heading4,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  rewardLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rewardDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  organizerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  organizerName: {
    fontWeight: "600",
    color: colors.text,
  },
  chevronIcon: {
    marginLeft: 8,
  },
});