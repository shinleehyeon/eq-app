import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  animated?: boolean;
  showPercentage?: boolean;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = colors.border,
  fillColor = colors.primary,
  animated = true,
  showPercentage = false,
  label,
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.progressContainer, { height, backgroundColor }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${clampedProgress * 100}%`,
              backgroundColor: fillColor,
            }
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(clampedProgress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.caption,
    marginBottom: 4,
  },
  progressContainer: {
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  percentage: {
    ...typography.caption,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;