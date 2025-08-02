import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { Stack, router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Trophy, ChevronRight, MapPin, Flag, Star } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

const { width } = Dimensions.get('window');

export default function MarathonScreen() {
  const [currentProgress, setCurrentProgress] = useState(3.5); // 3.5km 진행
  const totalDistance = 10; // 총 10km
  
  const handleViewLeaderboard = () => {
    router.push('/screens/leaderboard');
  };
  
  // 지그재그 경로를 위한 마일스톤 정의
  const milestones = [
    // 첫 번째 줄 (왼쪽 정렬)
    { id: 1, distance: 0, name: '시작', row: 0, col: 0, icon: Flag },
    { id: 2, distance: 1.2, name: '첫걸음', row: 0, col: 1, icon: MapPin },
    { id: 3, distance: 2.5, name: '체크포인트1', row: 0, col: 2, icon: Star },
    // 두 번째 줄 (오른쪽 정렬)
    { id: 4, distance: 3.7, name: '중간점1', row: 1, col: 2, icon: MapPin },
    { id: 5, distance: 5, name: '중간지점', row: 1, col: 1, icon: Star },
    { id: 6, distance: 6.3, name: '중간점2', row: 1, col: 0, icon: MapPin },
    // 세 번째 줄 (왼쪽 정렬)
    { id: 7, distance: 7.5, name: '체크포인트2', row: 2, col: 0, icon: Star },
    { id: 8, distance: 8.8, name: '막바지', row: 2, col: 1, icon: MapPin },
    { id: 9, distance: 10, name: '완주!', row: 2, col: 2, icon: Trophy },
  ];
  
  // 지그재그 위치 계산
  const getPosition = (row: number, col: number) => {
    const containerWidth = width - 80;
    const badgeSpacing = 120; // 뱃지 간 간격 (더 넓게)
    const rowHeight = 140; // 행 간격도 더 넓게
    
    let x, y;
    y = 80 + row * rowHeight;
    
    if (row === 0) {
      // 첫 번째 줄: 오른쪽으로 이동된 왼쪽 정렬
      x = 80 + col * badgeSpacing;
    } else if (row === 1) {
      // 두 번째 줄: 오른쪽 정렬
      x = containerWidth - 50 - (2 - col) * badgeSpacing;
    } else {
      // 세 번째 줄: 오른쪽으로 이동된 왼쪽 정렬
      x = 80 + col * badgeSpacing;
    }
    
    return { x, y };
  };
  
  // 직선과 곡선 경로 생성
  const createPath = () => {
    const positions = milestones.map(m => getPosition(m.row, m.col));
    let pathData = `M ${positions[0].x} ${positions[0].y}`;
    
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      // 행이 바뀌는 지점에서만 곡선 사용
      if (i === 3 || i === 6) {
        // 세로 연결 구간 (부드러운 S자 곡선)
        const isRightToLeft = i === 6; // 6번째는 오른쪽에서 왼쪽으로
        const curveOffset = isRightToLeft ? -100 : 100;
        
        const cp1x = prev.x + curveOffset;
        const cp1y = prev.y + 40;
        const cp2x = curr.x - curveOffset;
        const cp2y = curr.y - 40;
        
        pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
      } else {
        // 같은 행에서의 연결 (직선)
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
        {/* 헤더 */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Eco Marathon</Text>
          <Text style={styles.subtitle}>친환경 여정을 완주하세요!</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressStats}>
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>{currentProgress}km</Text>
                <Text style={styles.progressLabel}>진행 거리</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>{totalDistance}km</Text>
                <Text style={styles.progressLabel}>총 거리</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.progressValue}>{((currentProgress / totalDistance) * 100).toFixed(0)}%</Text>
                <Text style={styles.progressLabel}>완료</Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(currentProgress / totalDistance) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{((currentProgress / totalDistance) * 100).toFixed(0)}% 완료</Text>
            </View>
          </View>
        </View>
        
        {/* 마라톤 경로 */}
        <View style={styles.marathonCard}>
          <View style={styles.marathonContainer}>
            <Svg width={width - 80} height={520} style={styles.svgContainer}>
              {/* 전체 경로 (점선) */}
              <Path
                d={createPath()}
                stroke={colors.border}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="8,6"
              />
              
              {/* 완료된 경로 (실선) */}
              <Path
                d={createPath()}
                stroke={colors.primary}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(currentProgress / totalDistance) * 2000}, 2000`}
              />
            </Svg>
            
            {/* 마일스톤 */}
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
                    { left: position.x - 35, top: position.y - 35 }
                  ]}
                >
                  <View style={[
                    styles.milestoneCircle,
                    completed && styles.completedMilestone,
                    isCurrent && styles.currentMilestone
                  ]}>
                    <Icon 
                      size={24} 
                      color={completed || isCurrent ? 'white' : colors.textSecondary} 
                    />
                  </View>
                  <Text style={[styles.milestoneText, (completed || isCurrent) && styles.completedText]}>
                    {milestone.name}
                  </Text>
                  <Text style={[styles.distanceText, (completed || isCurrent) && styles.completedDistanceText]}>
                    {milestone.distance}km
                  </Text>
                </View>
              );
            })}
            
            {/* 현재 위치 마커 */}
            {milestones.map((milestone, index) => {
              if (index === 0) return null;
              const prev = milestones[index - 1];
              
              if (currentProgress >= prev.distance && currentProgress <= milestone.distance) {
                const t = (currentProgress - prev.distance) / (milestone.distance - prev.distance);
                const prevPos = getPosition(prev.row, prev.col);
                const currPos = getPosition(milestone.row, milestone.col);
                
                // 경로 상의 위치 계산
                let x, y;
                if (index === 3 || index === 6) {
                  // S자 곡선 구간
                  const isRightToLeft = index === 6;
                  const curveOffset = isRightToLeft ? -100 : 100;
                  
                  const cp1x = prevPos.x + curveOffset;
                  const cp1y = prevPos.y + 40;
                  const cp2x = currPos.x - curveOffset;
                  const cp2y = currPos.y - 40;
                  
                  // 베지어 곡선 공식
                  x = Math.pow(1-t, 3) * prevPos.x + 
                      3 * Math.pow(1-t, 2) * t * cp1x + 
                      3 * (1-t) * Math.pow(t, 2) * cp2x + 
                      Math.pow(t, 3) * currPos.x;
                  y = Math.pow(1-t, 3) * prevPos.y + 
                      3 * Math.pow(1-t, 2) * t * cp1y + 
                      3 * (1-t) * Math.pow(t, 2) * cp2y + 
                      Math.pow(t, 3) * currPos.y;
                } else {
                  // 직선 구간
                  x = prevPos.x + (currPos.x - prevPos.x) * t;
                  y = prevPos.y + (currPos.y - prevPos.y) * t;
                }
                
                return (
                  <View
                    key="current-marker"
                    style={[styles.currentMarker, { left: x - 25, top: y - 25 }]}
                  >
                    <LottieView
                      source={require('@/assets/animation/turtle.json')}
                      autoPlay
                      loop
                      style={styles.turtleAnimation}
                    />
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
        
        {/* 하단 섹션 */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.leaderboardButton} onPress={handleViewLeaderboard}>
            <Trophy size={20} color="white" />
            <Text style={styles.leaderboardButtonText}>순위보기</Text>
            <ChevronRight size={16} color="white" />
          </TouchableOpacity>
          
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>다음 보상</Text>
            <View style={styles.rewardContent}>
              <View style={styles.rewardIcon}>
                <Trophy size={24} color={colors.primary} />
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>친환경 러너</Text>
                <Text style={styles.rewardDescription}>5km 달성 시 획득</Text>
                <Text style={styles.rewardPoints}>+500 포인트</Text>
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
    backgroundColor: colors.card,
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
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainTitle: {
    ...typography.heading1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.card,
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
  marathonCard: {
    backgroundColor: colors.card,
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
    width: 70,
  },
  milestoneCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedMilestone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  distanceText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 10,
  },
  completedDistanceText: {
    color: colors.textSecondary,
  },
  currentMarker: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turtleAnimation: {
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
  rewardPoints: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});