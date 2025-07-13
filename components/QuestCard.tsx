import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, Award, Users } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { fetchAuthorById } from '@/utils/firebase-helpers';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';

interface QuestCardProps {
  challenge: any;
  isActive: boolean;
  onPress: (quest: any) => void;
  showAuthor?: boolean;
}

interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function QuestCard({ challenge, isActive, onPress, showAuthor = false }: QuestCardProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  
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

  // Fetch submission count
  useEffect(() => {
    const fetchSubmissionCount = async () => {
      try {
        const submissionsRef = ref(database, 'questSubmissions');
        const snapshot = await get(submissionsRef);
        
        if (snapshot.exists()) {
          const submissions = Object.values(snapshot.val());
          const count = submissions.filter(
            (submission: any) => submission.questId === challenge.id
          ).length;
          setSubmissionCount(count);
        }
      } catch (error) {
        console.error('Error fetching submission count:', error);
      }
    };

    fetchSubmissionCount();
  }, [challenge.id]);

  // Calculate days left for submission deadline
  const getDaysLeft = () => {
    if (!challenge.submissionDeadline) return null;
    
    const deadlineDate = new Date(challenge.submissionDeadline);
    const currentDate = new Date();
    
    // Calculate the difference in milliseconds
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    
    // Convert to days and round
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days left` : 'Deadline passed';
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
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
  
  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.activeCard]}
      onPress={() => onPress(challenge)}
    >
      <Image 
        source={{ uri: challenge.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryIcon()} {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
            </Text>
          </View>
          {challenge.difficulty && (
            <View style={styles.categoryBadge}>
              <Text style={[
                styles.difficulty,
                challenge.difficulty === 'easy' && styles.easyDifficulty,
                challenge.difficulty === 'medium' && styles.mediumDifficulty,
                challenge.difficulty === 'hard' && styles.hardDifficulty,
              ]}>
                {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.title}>{challenge.title}</Text>
        
        {/* Author information */}
        {showAuthor && (
          <View style={styles.authorContainer}>
            {author?.avatarUrl ? (
              <Image 
                source={{ uri: author.avatarUrl }} 
                style={styles.authorAvatar}
              />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Users size={12} color={colors.textSecondary} />
              </View>
            )}
            <Text style={styles.authorName}>
              {author?.name || challenge.authorName || ""}
            </Text>
          </View>
        )}
        
        <Text style={styles.description} numberOfLines={2}>
          {challenge.description}
        </Text>

        {showAuthor && (
        <View style={styles.statFooter}>
          <View style={styles.statItem}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.statText}>{submissionCount} Submissions</Text>
          </View>
          
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{getDaysLeft()}</Text>
            </View>
        </View>)}
                
        {challenge.points > 0 && (
          <View style={styles.pointsContainer}>
            <Award size={14} color={colors.primary} />
            <Text style={styles.pointsText}>{challenge.points} points</Text>
          </View>
        )}
        
        {isActive && (
          <View style={styles.activeLabel}>
            <Text style={styles.activeLabelText}>In Progress</Text>
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
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeCard: {
    borderColor: colors.primary,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: colors.border,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingTop: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  category: {
    ...typography.caption,
    color: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  difficulty: {
    ...typography.caption,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  easyDifficulty: {
    color: '#4CAF50',
  },
  mediumDifficulty: {
    color: '#FF9800',
  },
  hardDifficulty: {
    color: '#F44336',
  },
  title: {
    ...typography.heading4,
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 6,
  },
  authorAvatarPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  authorName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  description: {
    ...typography.body,
    marginBottom: 12,
  },
  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  activeLabel: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeLabelText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
});