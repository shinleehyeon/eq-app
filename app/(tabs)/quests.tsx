import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { Stack, useRouter, useFocusEffect } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useQuestsStore } from "@/store/challenges-store";
import { useUserStore } from "@/store/user-store";
import QuestCard from "@/components/QuestCard";
import { ArrowRight, Sparkles, Globe, CheckCircle } from "lucide-react-native";
import { apiClient } from "@/lib/api/client";

interface OpenQuest {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  category: string;
  difficulty: string;
  isCreativeChallenge: boolean;
  points: number;
  authorId: string;
}

export default function QuestsScreen() {
  const router = useRouter();
  const { openQuests, fetchOpenQuests } = useQuestsStore();
  const { accessToken } = useUserStore();
  const [allDailyQuests, setAllDailyQuests] = useState<any[]>([]);
  const [completedQuests, setCompletedQuests] = useState<any[]>([]);

  const fetchAllDailyQuests = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await apiClient.get("/quests/daily", accessToken);

      if (
        response.success &&
        response.data &&
        typeof response.data === "object"
      ) {
        const quests = (response.data as any).data || response.data || [];
        setAllDailyQuests(quests);
      } else {
        console.error("Failed to fetch daily quests:", response.error);
        setAllDailyQuests([]);
      }
    } catch (error) {
      console.error("Error fetching daily quests:", error);
      setAllDailyQuests([]);
    }
  }, [accessToken]);

  const fetchCompletedQuests = useCallback(() => {
    // 선택된 퀘스트 중에서 완료된 퀘스트만 필터링
    const completedSelectedQuests = allDailyQuests.filter(
      (quest) => quest.isSelected === true && quest.status === "completed"
    );
    setCompletedQuests(completedSelectedQuests);
  }, [allDailyQuests]);

  useEffect(() => {
    fetchOpenQuests();
  }, [fetchOpenQuests]);

  useFocusEffect(
    useCallback(() => {
      fetchAllDailyQuests();
    }, [fetchAllDailyQuests])
  );

  // allDailyQuests가 변경될 때마다 완료된 퀘스트 업데이트
  useEffect(() => {
    fetchCompletedQuests();
  }, [fetchCompletedQuests]);

  const selectedQuests = allDailyQuests.filter(
    (quest) => quest.isSelected === true && quest.status !== "completed"
  );
  const selectedQuests_includeCompleted = allDailyQuests.filter(
    (quest) => quest.isSelected === true
  );
  const availableDailyQuests = allDailyQuests.filter(
    (quest) => quest.isSelected !== true
  );

  const allQuests = [...availableDailyQuests, ...openQuests];
  const availableQuests = allQuests;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Quests",
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Selected Quests Section */}
        {selectedQuests.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Sparkles size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  My Selected Quests ({selectedQuests_includeCompleted.length}
                  /5)
                </Text>
              </View>
            </View>

            {selectedQuests.map((quest) => (
              <QuestCard
                key={quest.uuid || quest.id}
                challenge={quest}
                onPress={() =>
                  router.push(`/quest-detail?id=${quest.uuid || quest.id}`)
                }
                showAuthor={false}
                isActive={true}
              />
            ))}
          </View>
        )}

        {/* Available Quests Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Globe size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Available Quests</Text>
            </View>
            <Text style={styles.seeAllText}>
              Select up to {5 - selectedQuests_includeCompleted.length} more
              quests
            </Text>
          </View>

          {availableQuests.map((quest) => (
            <QuestCard
              key={quest.uuid || quest.id}
              challenge={quest}
              isActive={false}
              onPress={() =>
                router.push(`/quest-detail?id=${quest.uuid || quest.id}`)
              }
              showAuthor={false}
            />
          ))}
        </View>

        {/* Completed Quests Section */}
        {completedQuests.length > 0 && (
          <View style={styles.completedSectionContainer}>
            <View style={styles.completedSectionHeader}>
              <View style={styles.completedSectionTitleContainer}>
                <CheckCircle size={20} color={colors.white} />
                <Text style={styles.completedSectionTitle}>
                  Today's Completed Quests ({completedQuests.length})
                </Text>
              </View>
            </View>

            <View style={styles.completedQuestsContainer}>
              {completedQuests.map((quest) => (
                <QuestCard
                  key={quest.uuid || quest.id}
                  challenge={quest}
                  isActive={false}
                  onPress={() =>
                    router.push(`/quest-detail?id=${quest.uuid || quest.id}`)
                  }
                  showAuthor={false}
                  isCompleted={true}
                />
              ))}
            </View>
          </View>
        )}
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.heading3,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  questCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    flexDirection: "row",
    height: 80,
  },
  questImage: {
    width: 80,
    height: 80,
  },
  questContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  questTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  questDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  completedSectionContainer: {
    marginBottom: 24,
    backgroundColor: colors.success + "15",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success + "30",
  },
  completedSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completedSectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  completedSectionTitle: {
    ...typography.heading3,
    marginLeft: 8,
    color: colors.success,
    fontWeight: "bold",
  },
  completedQuestsContainer: {
    gap: 8,
  },
});
