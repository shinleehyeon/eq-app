import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Stack } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useLeaderboardStore } from '@/store/leaderboard-store';
import { useUserStore } from '@/store/user-store';
import LeaderboardItem from '@/components/LeaderboardItem';

export default function LeaderboardScreen() {
  const { 
    entries, 
    timeframe, 
    scope, 
    fetchLeaderboard, 
    setTimeframe, 
    setScope,
    isLoading
  } = useLeaderboardStore();
  const { user } = useUserStore();
  
  useEffect(() => {
    fetchLeaderboard(timeframe, scope);
  }, [timeframe, scope]);
  
  const timeframeOptions = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'allTime', label: 'All Time' },
  ];
  
  const scopeOptions = [
    { id: 'local', label: 'Local' },
    { id: 'global', label: 'Global' },
  ];
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Leaderboard',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Time:</Text>
          <View style={styles.filterOptions}>
            {timeframeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  timeframe === option.id && styles.activeFilterOption
                ]}
                onPress={() => setTimeframe(option.id as 'weekly' | 'monthly' | 'allTime')}
              >
                <Text 
                  style={[
                    styles.filterOptionText,
                    timeframe === option.id && styles.activeFilterOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Scope:</Text>
          <View style={styles.filterOptions}>
            {scopeOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterOption,
                  scope === option.id && styles.activeFilterOption
                ]}
                onPress={() => setScope(option.id as 'local' | 'global')}
              >
                <Text 
                  style={[
                    styles.filterOptionText,
                    scope === option.id && styles.activeFilterOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {entries.length > 0 ? entries[0].completedQuestsCount : 0}
          </Text>
          <Text style={styles.statLabel}>Top Quests</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {entries.length}
          </Text>
          <Text style={styles.statLabel}>Participants</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {user ? user.completedQuests?.length || 0 : 0}
          </Text>
          <Text style={styles.statLabel}>Your Quests</Text>
        </View>
      </View>
      
      <FlatList
        data={entries}
        keyExtractor={(item) => item.userId}
        renderItem={({ item }) => (
          <LeaderboardItem 
            entry={item}
            isCurrentUser={user ? item.userId === user.id : false}
          />
        )}
        contentContainerStyle={styles.leaderboardList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Loading leaderboard...' : 'No leaderboard data available.'}
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
  filtersContainer: {
    backgroundColor: colors.card,
    padding: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  activeFilterOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});