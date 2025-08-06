import React from "react";
import { View, Text, StyleSheet, FlatList, SafeAreaView } from "react-native";
import { Stack } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import { useUserStore } from "@/store/user-store";
import MarathonLeaderboardItem from "@/components/MarathonLeaderboardItem";

export default function LeaderboardScreen() {
  const { marathonEntries, isLoading } = useLeaderboardStore();
  const { user } = useUserStore();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Marathon Leaderboard",
          headerTitleStyle: styles.headerTitle,
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {marathonEntries && marathonEntries.length > 0
              ? Math.max(
                  ...marathonEntries.map((entry) => entry.completedQuests)
                )
              : 0}
          </Text>
          <Text style={styles.statLabel}>Top Quests</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {marathonEntries ? marathonEntries.length : 0}
          </Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {marathonEntries
              ? (() => {
                  const sortedEntries = [...marathonEntries].sort(
                    (a, b) => b.completedQuests - a.completedQuests
                  );
                  const userIndex = sortedEntries.findIndex(
                    (entry) => entry.userId === user?.id
                  );
                  return userIndex !== -1 ? userIndex + 1 : "-";
                })()
              : "-"}
          </Text>
          <Text style={styles.statLabel}>Your Rank</Text>
        </View>
      </View>

      <FlatList
        data={
          marathonEntries
            ? [...marathonEntries].sort(
                (a, b) => b.completedQuests - a.completedQuests
              )
            : []
        }
        keyExtractor={(item) => item.userId}
        renderItem={({ item, index }) => (
          <MarathonLeaderboardItem
            entry={{ ...item, rank: index + 1 }}
            isCurrentUser={user ? item.userId === user.id : false}
          />
        )}
        contentContainerStyle={styles.leaderboardList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading
                ? "Loading leaderboard..."
                : "No marathon leaderboard data available."}
            </Text>
          </View>
        }
      />
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: "bold",
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  leaderboardList: {
    padding: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
