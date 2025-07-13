import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LeaderboardEntry } from '@/types';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Award } from 'lucide-react-native';

interface LeaderboardItemProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ 
  entry, 
  isCurrentUser = false 
}) => {
  const router = useRouter();
  const { position, userId, userName, userAvatar, completedQuestsCount, level } = entry;
  
  const getPositionColor = () => {
    switch (position) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return colors.textSecondary;
    }
  };
  
  const getPositionIcon = () => {
    if (position <= 3) {
      return <Award size={20} color={getPositionColor()} />;
    }
    return <Text style={[styles.position, { color: getPositionColor() }]}>{position}</Text>;
  };
  
  const handleUserPress = () => {
    if (isCurrentUser) {
      router.push('/profile');
    } else {
      router.push(`/user-profile/${userId}`);
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.container, isCurrentUser && styles.currentUserContainer]}
      onPress={handleUserPress}
    >
      <View style={styles.positionContainer}>
        {getPositionIcon()}
      </View>
      
      <Image 
        source={{ uri: userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }} 
        style={styles.avatar} 
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.level}>Level {level}</Text>
      </View>
      
      <View style={styles.questsContainer}>
        <Text style={styles.quests}>{completedQuestsCount}</Text>
        <Text style={styles.questsLabel}>quests</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 8,
  },
  currentUserContainer: {
    backgroundColor: colors.primary + '15', // Primary color with 15% opacity
    borderWidth: 1,
    borderColor: colors.primary,
  },
  positionContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    ...typography.heading3,
    fontWeight: 'bold',
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
    fontWeight: '600',
  },
  level: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  questsContainer: {
    alignItems: 'flex-end',
  },
  quests: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  questsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default LeaderboardItem;