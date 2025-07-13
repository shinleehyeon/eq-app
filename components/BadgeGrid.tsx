import React from 'react';
import { View, Text, StyleSheet, Image, FlatList } from 'react-native';
import { Badge } from '@/types';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface BadgeGridProps {
  badges: Badge[];
  emptyMessage?: string;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ 
  badges, 
  emptyMessage = "No badges earned yet. Complete quests to earn badges!" 
}) => {
  const renderBadge = ({ item }: { item: Badge }) => {
    return (
      <View style={styles.badgeContainer}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.badgeImage} 
        />
        <Text style={styles.badgeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.badgeDate}>
          {new Date(item.dateEarned).toLocaleDateString()}
        </Text>
      </View>
    );
  };
  
  if (badges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }
  
  return (
    <FlatList
      data={badges}
      renderItem={renderBadge}
      keyExtractor={(item) => item.id}
      numColumns={3}
      contentContainerStyle={styles.gridContainer}
    />
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingVertical: 8,
  },
  badgeContainer: {
    flex: 1/3, // 3 columns
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  badgeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  badgeName: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDate: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default BadgeGrid;