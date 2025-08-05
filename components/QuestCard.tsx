import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Sparkles, Coins, Users, Timer, MapPin, Star } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { fetchAuthorById } from '@/utils/firebase-helpers';

import { Quest } from '@/types';

interface QuestCardProps {
  challenge: Quest;
  isActive: boolean;
  onPress: (quest: Quest) => void;
  showAuthor?: boolean;
  onSelect?: (questId: string) => void;
  onUnselect?: (questId: string) => void;
  selectable?: boolean;
}

interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function QuestCard({ 
  challenge, 
  isActive, 
  onPress, 
  showAuthor = false, 
  onSelect, 
  onUnselect, 
  selectable = false 
}: QuestCardProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  
  // Fetch author data directly from Firebase when needed
  useEffect(() => {
    if (showAuthor && challenge.authorId && !author) {
      fetchAuthorById(challenge.authorId).then(authorData => {
        if (authorData) {
          setAuthor(authorData);
        }
      });
    }
  }, [challenge.authorId, showAuthor]);

  // Skip submission count for now due to Firebase permissions
  // This can be enabled later when Firebase rules are properly configured

  // Calculate days left for submission deadline
  const getDaysLeft = () => {
    const deadline = challenge.endDate || challenge.submissionDeadline;
    if (!deadline) return null;
    
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    
    // Calculate the difference in milliseconds
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    
    // Convert to days and round
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days left` : 'Deadline passed';
  };

  const getDifficultyColor = () => {
    switch (challenge.difficulty) {
      case 'easy':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'hard':
        return colors.error;
      default:
        return colors.info;
    }
  };
  
  const getCategoryIcon = () => {
    switch (challenge.category) {
      case 'energy':
        return '⚡';
      case 'waste':
        return '♻️';
      case 'food':
        return '🍎';
      case 'transport':
        return '🚲';
      case 'water':
        return '💧';
      case 'advocacy':
        return '📣';
      case 'education':
        return '📚';
      case 'creative':
        return '🎨';
      default:
        return '🌱';
    }
  };
  
  const handlePress = () => {
    if (selectable) {
      if (isActive && onUnselect) {
        onUnselect(challenge.uuid || challenge.id!);
      } else if (!isActive && onSelect) {
        onSelect(challenge.uuid || challenge.id!);
      }
    } else {
      onPress(challenge);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.activeCard]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        {/* Left side - Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: challenge.mainImageUrl || challenge.imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18' }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryEmoji}>{getCategoryIcon()}</Text>
          </View>
        </View>
        
        {/* Right side - Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{challenge.title}</Text>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
              <Text style={styles.difficultyText}>
                {challenge.difficulty?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.description} numberOfLines={1}>
            {challenge.description}
          </Text>
          
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Coins size={12} color={colors.warning} />
              <Text style={styles.statText}>{challenge.rewardMarathonPoints || challenge.points || 0}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Timer size={12} color={colors.info} />
              <Text style={styles.statText}>{challenge.expectedTime || `${challenge.duration || 30}m`}</Text>
            </View>
            
            {showAuthor && (challenge.user || author) && (
              <View style={styles.statItem}>
                <Users size={12} color={colors.textSecondary} />
                <Text style={styles.statText}>{challenge.user?.name || author?.name}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Active badge */}
        {isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeCard: {
    borderColor: colors.primary,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyText: {
    ...typography.caption,
    color: 'white',
    fontWeight: '600',
    fontSize: 10,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  categoryIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryEmoji: {
    fontSize: 10,
  },
  activeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});