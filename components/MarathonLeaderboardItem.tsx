import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Award, Trophy } from "lucide-react-native";

interface MarathonLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userLevel: number;
  marathonPoints: number;
  completedQuests: number;
  progress: number;
  reachedMilestones: number;
  profileImage?: string;
}

interface MarathonLeaderboardItemProps {
  entry: MarathonLeaderboardEntry;
  isCurrentUser?: boolean;
}

const MarathonLeaderboardItem: React.FC<MarathonLeaderboardItemProps> = ({
  entry,
  isCurrentUser = false,
}) => {
  const router = useRouter();
  const {
    rank,
    userId,
    userName,
    userLevel,
    marathonPoints,
    completedQuests,
    profileImage,
  } = entry;

  const getPositionColor = () => {
    switch (rank) {
      case 1:
        return "#FFD700";
      case 2:
        return "#C0C0C0";
      case 3:
        return "#CD7F32";
      default:
        return colors.textSecondary;
    }
  };

  const getPositionIcon = () => {
    if (rank <= 3) {
      return <Award size={20} color={getPositionColor()} />;
    }
    return (
      <Text style={[styles.position, { color: getPositionColor() }]}>
        {rank}
      </Text>
    );
  };

  const handleUserPress = () => {
    if (isCurrentUser) {
      router.push("/(tabs)/profile");
    } else {
      const params = new URLSearchParams({
        userId: userId,
        userName: userName,
        userLevel: userLevel.toString(),
        profileImage: profileImage || "",
        marathonPoints: marathonPoints.toString(),
        completedQuests: completedQuests.toString(),
        rank: rank.toString(),
      }).toString();

      router.push(`/api-user-profile/${userId}?${params}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCurrentUser && styles.currentUserContainer]}
      // onPress={handleUserPress}
    >
      <View style={styles.positionContainer}>{getPositionIcon()}</View>

      <Image
        source={{
          uri:
            profileImage ||
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        }}
        style={styles.avatar}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.quests}>
          Level {userLevel} • {completedQuests} quests
        </Text>
      </View>

      <View style={styles.pointsContainer}>
        <Trophy size={16} color={colors.warning} />
        <Text style={styles.points}>{completedQuests}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currentUserContainer: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
  },
  positionContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  position: {
    ...typography.heading3,
    fontWeight: "bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  quests: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  points: {
    ...typography.heading4,
    color: colors.warning,
    fontWeight: "bold",
  },
});

export default MarathonLeaderboardItem;
