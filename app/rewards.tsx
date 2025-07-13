import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView,
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import RewardCard from '@/components/RewardCard';
import rewards from '@/mocks/rewards';

export default function RewardsScreen() {
  const { user, addPoints } = useUserStore();
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const handleRedeemReward = (reward) => {
    if (user.points >= reward.pointCost) {
      // In a real app, this would call an API to process the reward
      Alert.alert(
        "Reward Redeemed!",
        `You've successfully redeemed "${reward.name}". ${
          reward.category === 'physical' || reward.category === 'experience' 
            ? "Check your email for details on how to claim your reward." 
            : "Your reward has been applied to your account."
        }`,
        [
          { 
            text: "OK", 
            onPress: () => {
              // Deduct points
              addPoints(-reward.pointCost);
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Not Enough Points",
        `You need ${reward.pointCost - user.points} more points to redeem this reward.`,
        [{ text: "OK" }]
      );
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Rewards',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{user.points}</Text>
        <Text style={styles.pointsInfo}>
          Complete quests to earn more badges and unlock rewards!
        </Text>
      </View>
      
      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RewardCard 
            reward={item}
            userPoints={user.points}
            onRedeem={handleRedeemReward}
          />
        )}
        contentContainerStyle={styles.rewardsList}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Available Rewards</Text>
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
  pointsContainer: {
    backgroundColor: colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  pointsLabel: {
    ...typography.body,
    color: 'white',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  pointsInfo: {
    ...typography.bodySmall,
    color: 'white',
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  rewardsList: {
    padding: 16,
  },
});