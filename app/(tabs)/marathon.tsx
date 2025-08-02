import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Stack, router } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Trophy, MapPin, Clock, Target } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MarathonScreen() {
  const [currentDistance, setCurrentDistance] = useState(2.3);
  const totalDistance = 10;
  const progress = (currentDistance / totalDistance) * 100;
  
  const milestones = [
    { distance: 0, name: '시작점', completed: true },
    { distance: 2.5, name: '첫 번째 체크포인트', completed: false },
    { distance: 5, name: '중간 지점', completed: false },
    { distance: 7.5, name: '마지막 체크포인트', completed: false },
    { distance: 10, name: '도착점', completed: false },
  ];
  
  const handleViewLeaderboard = () => {
    router.push('/(tabs)/leaderboard');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Marathon',
          headerTitleStyle: styles.headerTitle,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Eco Marathon</Text>
          <Text style={styles.subtitle}>친환경 여정을 완주하세요</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <MapPin size={20} color={colors.primary} />
              <Text style={styles.statValue}>{currentDistance}km</Text>
              <Text style={styles.statLabel}>진행 거리</Text>
            </View>
            
            <View style={styles.statItem}>
              <Target size={20} color={colors.primary} />
              <Text style={styles.statValue}>{totalDistance}km</Text>
              <Text style={styles.statLabel}>목표 거리</Text>
            </View>
            
            <View style={styles.statItem}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.statValue}>3일</Text>
              <Text style={styles.statLabel}>경과 시간</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{progress.toFixed(0)}% 완료</Text>
          </View>
        </View>
        
        <View style={styles.roadContainer}>
          <View style={styles.road}>
            {milestones.map((milestone, index) => (
              <View 
                key={index} 
                style={[
                  styles.milestone,
                  { left: `${(milestone.distance / totalDistance) * 100}%` }
                ]}
              >
                <View style={[
                  styles.milestonePoint,
                  milestone.distance <= currentDistance && styles.completedMilestone
                ]} />
                <Text style={styles.milestoneText}>{milestone.name}</Text>
                <Text style={styles.milestoneDistance}>{milestone.distance}km</Text>
              </View>
            ))}
            
            <View 
              style={[
                styles.currentPosition,
                { left: `${progress}%` }
              ]}
            >
              <View style={styles.positionMarker} />
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.leaderboardButton}
          onPress={handleViewLeaderboard}
        >
          <Trophy size={20} color="white" />
          <Text style={styles.leaderboardButtonText}>순위보기</Text>
        </TouchableOpacity>
        
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>다음 보상</Text>
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Trophy size={24} color={colors.primary} />
            </View>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>친환경 전사</Text>
              <Text style={styles.rewardDescription}>5km 달성 시 획득</Text>
              <Text style={styles.rewardPoints}>+100 포인트</Text>
            </View>
          </View>
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
  headerTitle: {
    ...typography.heading2,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    ...typography.heading1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressContainer: {
    backgroundColor: colors.card,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading3,
    marginTop: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: 8,
    color: colors.textSecondary,
  },
  roadContainer: {
    height: 200,
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  road: {
    flex: 1,
    backgroundColor: colors.border,
    borderRadius: 8,
    position: 'relative',
  },
  milestone: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: -20 }, { translateY: -60 }],
  },
  milestonePoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 3,
    borderColor: colors.card,
    marginLeft: 12,
  },
  completedMilestone: {
    backgroundColor: colors.primary,
  },
  milestoneText: {
    ...typography.caption,
    marginTop: 4,
    width: 100,
    textAlign: 'center',
    marginLeft: -30,
  },
  milestoneDistance: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginLeft: -30,
    width: 100,
  },
  currentPosition: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
  },
  positionMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: 'white',
    marginLeft: -15,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  leaderboardButtonText: {
    ...typography.button,
    color: 'white',
    marginLeft: 8,
  },
  rewardsSection: {
    margin: 16,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
  },
  rewardCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    ...typography.heading4,
    marginBottom: 4,
  },
  rewardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rewardPoints: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});