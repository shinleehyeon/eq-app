import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import BadgeGrid from '@/components/BadgeGrid';

export default function BadgesScreen() {
  const { user } = useUserStore();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  // Group badges by category
  const badgesByCategory = user.badges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {});
  
  const categories = [
    { id: 'milestone', label: 'Milestones' },
    { id: 'daily-quests', label: 'Daily Quests' },
    { id: 'special', label: 'Special' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Your Badges',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Badge Collection</Text>
        <Text style={styles.statsValue}>
          {user.badges.length} <Text style={styles.statsLabel}>badges earned</Text>
        </Text>
      </View>
      
      <View style={styles.content}>
        {categories.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.label}</Text>
            <BadgeGrid 
              badges={badgesByCategory[category.id] || []}
              emptyMessage={`No ${category.label.toLowerCase()} badges earned yet.`}
            />
          </View>
        ))}
      </View>
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
    backgroundColor: colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  statsTitle: {
    ...typography.body,
    color: 'white',
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  statsLabel: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
});