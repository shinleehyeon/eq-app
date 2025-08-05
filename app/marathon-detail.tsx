import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image
} from 'react-native';
import { Stack, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Trophy, ChevronRight, MapPin, Flag, Star, Crown, Coins } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';

const { width } = Dimensions.get('window');

export default function MarathonDetailScreen() {
  const { selectedPet } = useUserStore();
  const [currentProgress, setCurrentProgress] = useState(4.2); 
  const totalDistance = 10;
  
  const handleViewLeaderboard = () => {
    router.push('/screens/leaderboard');
  };

  const getSelectedPetAnimation = () => {
    switch(selectedPet) {
      case 'bird':
        return require('@/assets/animation/bird.json');
      case 'duck':
        return require('@/assets/animation/duck.json');
      case 'giraffe':
        return require('@/assets/animation/giraffe.json');
      case 'turtle':
      default:
        return require('@/assets/animation/turtle.json');
    }
  };
  
  const milestones = [
    { id: 1, distance: 0, name: 'Start', row: 0, col: 0, icon: Flag },
    { id: 2, distance: 1.2, name: 'First Step', row: 0, col: 1, icon: MapPin },
    { id: 3, distance: 2.5, name: 'Checkpoint 1', row: 0, col: 2, icon: Star },
    { id: 4, distance: 3.7, name: 'Midpoint 1', row: 1, col: 2, icon: MapPin },
    { id: 5, distance: 5, name: 'Halfway', row: 1, col: 1, icon: Star },
    { id: 6, distance: 6.3, name: 'Midpoint 2', row: 1, col: 0, icon: MapPin },
    { id: 7, distance: 7.5, name: 'Checkpoint 2', row: 2, col: 0, icon: Star },
    { id: 8, distance: 8.8, name: 'Final Push', row: 2, col: 1, icon: MapPin },
    { id: 9, distance: 10, name: 'Finish!', row: 2, col: 2, icon: Trophy },
  ];
  
  const getPosition = (row: number, col: number) => {
    const containerWidth = width - 80;
    const badgeSpacing = 120;
    const rowHeight = 140;
    
    let x, y;
    y = 80 + row * rowHeight;
    
    const totalWidth = 2 * badgeSpacing;
    const startX = (containerWidth - totalWidth) / 2;
    x = startX + col * badgeSpacing;
    
    return { x, y };
  };
  
  const createPath = () => {
    const positions = milestones.map(m => getPosition(m.row, m.col));
    let pathData = `M ${positions[0].x} ${positions[0].y}`;
    
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      if (i === 3 || i === 6) {
        const isRightToLeft = i === 6;
        const curveOffset = isRightToLeft ? -100 : 100;
        
        const cp1x = prev.x + curveOffset;
        const cp1y = prev.y + 40;
        const cp2x = curr.x - curveOffset;
        const cp2y = curr.y - 40;
        
        pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        pathData += ` L ${curr.x} ${curr.y}`;
      }
    }
    
    return pathData;
  };
  
  const isCompleted = (distance: number) => distance <= currentProgress;
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Marathon',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.marathonInfoCard}>
          <Image 
            source={require('@/assets/images/ad.png')} 
            style={styles.marathonBanner}
            resizeMode="cover"
          />
          <Text style={styles.marathonTitle}>Eco Marathon Challenge</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>Jan 1, 2025</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>End Date</Text>
              <Text style={styles.dateValue}>Jan 31, 2025</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.marathonCard}>
          <View style={styles.marathonContainer}>
            <Svg width={width - 80} height={520} style={styles.svgContainer}>
              <Path
                d={createPath()}
                stroke="#9CA3AF"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="10,8"
              />
            </Svg>
            
            {milestones.map((milestone) => {
              const completed = isCompleted(milestone.distance);
              const isCurrent = Math.abs(milestone.distance - currentProgress) < 0.5;
              const position = getPosition(milestone.row, milestone.col);
              const Icon = milestone.icon;
              
              return (
                <View
                  key={milestone.id}
                  style={[
                    styles.milestone,
                    { left: position.x - 20, top: position.y - 20 }
                  ]}
                >
                  <View style={[
                    styles.milestoneCircle,
                    completed && styles.completedMilestone,
                    isCurrent && styles.currentMilestone
                  ]}>
                    <Icon 
                      size={16} 
                      color={completed || isCurrent ? 'white' : colors.textSecondary} 
                    />
                  </View>
                  <Text style={[styles.milestoneText, (completed || isCurrent) && styles.completedText]}>
                    {milestone.name}
                  </Text>
                </View>
              );
            })}
            
            {milestones.map((milestone, index) => {
              if (index === 0) return null;
              const prev = milestones[index - 1];
              
              if (currentProgress >= prev.distance && currentProgress <= milestone.distance) {
                const t = (currentProgress - prev.distance) / (milestone.distance - prev.distance);
                const prevPos = getPosition(prev.row, prev.col);
                const currPos = getPosition(milestone.row, milestone.col);
                
                let x, y;
                if (index === 3 || index === 6) {
                  const isRightToLeft = index === 6;
                  const curveOffset = isRightToLeft ? -100 : 100;
                  
                  const cp1x = prevPos.x + curveOffset;
                  const cp1y = prevPos.y + 40;
                  const cp2x = currPos.x - curveOffset;
                  const cp2y = currPos.y - 40;
                  
                  x = Math.pow(1-t, 3) * prevPos.x + 
                      3 * Math.pow(1-t, 2) * t * cp1x + 
                      3 * (1-t) * Math.pow(t, 2) * cp2x + 
                      Math.pow(t, 3) * currPos.x;
                  y = Math.pow(1-t, 3) * prevPos.y + 
                      3 * Math.pow(1-t, 2) * t * cp1y + 
                      3 * (1-t) * Math.pow(t, 2) * cp2y + 
                      Math.pow(t, 3) * currPos.y;
                } else {
                  x = prevPos.x + (currPos.x - prevPos.x) * t;
                  y = prevPos.y + (currPos.y - prevPos.y) * t;
                }
                
                return (
                  <View
                    key="current-marker"
                    style={[styles.currentMarker, { left: x - 25, top: y - 25 }]}
                  >
                    <LottieView
                      source={getSelectedPetAnimation()}
                      autoPlay
                      loop
                      style={styles.petAnimation}
                    />
                  </View>
                );
              }
              return null;
            })}
            
          </View>
        </View>
        
        <View style={styles.progressCard}>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{currentProgress}km</Text>
              <Text style={styles.progressLabel}>Distance</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{totalDistance}km</Text>
              <Text style={styles.progressLabel}>Total</Text>
            </View>
            <View style={styles.progressDivider} />
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{((currentProgress / totalDistance) * 100).toFixed(0)}%</Text>
              <Text style={styles.progressLabel}>Complete</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentProgress / totalDistance) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{((currentProgress / totalDistance) * 100).toFixed(0)}% Complete</Text>
          </View>
        </View>
        
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.leaderboardButton} onPress={handleViewLeaderboard}>
            <Trophy size={20} color="white" />
            <Text style={styles.leaderboardButtonText}>Leaderboard</Text>
            <ChevronRight size={16} color="white" />
          </TouchableOpacity>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>Next Reward</Text>
            <View style={styles.rewardContent}>
              <View style={styles.rewardIcon}>
                <Trophy size={24} color={colors.primary} />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>Eco Runner</Text>
                <Text style={styles.rewardDescription}>Unlock at 5km</Text>
                <View style={styles.rewardPointsContainer}>
                  <Coins size={16} color={colors.warning} />
                  <Text style={styles.rewardPoints}>500</Text>
                </View>
              </View>
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.heading4,
    color: colors.text,
  },
  marathonCard: {
    backgroundColor: colors.card,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    ...typography.heading2,
    color: colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressBarContainer: {
    marginTop: 4,
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
  marathonContainer: {
    position: 'relative',
    height: 520,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  milestone: {
    position: 'absolute',
    alignItems: 'center',
    width: 40,
  },
  milestoneCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedMilestone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  currentMilestone: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
    transform: [{ scale: 1.1 }],
  },
  milestoneText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  completedText: {
    color: colors.text,
    fontWeight: '700',
  },
  currentMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petAnimation: {
    width: 50,
    height: 50,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leaderboardButtonText: {
    ...typography.button,
    color: 'white',
    marginHorizontal: 8,
  },
  rewardCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rewardTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: 16,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 4,
  },
  rewardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rewardPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardPoints: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: '600',
  },
  marathonInfoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border, 
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  marathonBanner: {
    width: '100%',
    height: 120,
  },
  marathonTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 20,
    fontWeight: '700',
  },
  marathonDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  dateValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});