import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Reward } from '@/types';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import Button from './Button';
import { Award, Gift, Leaf, Ticket } from 'lucide-react-native';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ 
  reward, 
  userPoints,
  onRedeem 
}) => {
  const { name, description, pointCost, imageUrl, category, available } = reward;
  
  const canRedeem = userPoints >= pointCost && available;
  
  const getCategoryIcon = () => {
    switch (category) {
      case 'digital':
        return <Award size={18} color={colors.primary} />;
      case 'physical':
        return <Gift size={18} color={colors.primary} />;
      case 'experience':
        return <Ticket size={18} color={colors.primary} />;
      case 'donation':
        return <Leaf size={18} color={colors.primary} />;
      default:
        return <Gift size={18} color={colors.primary} />;
    }
  };
  
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        resizeMode="cover" 
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointCost}>{pointCost}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>
        
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.footer}>
          <View style={styles.categoryContainer}>
            {getCategoryIcon()}
            <Text style={styles.category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
          
          <Button
            title={canRedeem ? "Redeem" : "Not Enough Points"}
            variant={canRedeem ? "primary" : "outline"}
            size="small"
            disabled={!canRedeem}
            onPress={() => onRedeem(reward)}
          />
        </View>
      </View>
      
      {!available && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Currently Unavailable</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    ...typography.heading3,
    flex: 1,
    marginRight: 8,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointCost: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: 'bold',
  },
  pointsLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default RewardCard;