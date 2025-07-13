import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Quest } from '@/types';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Calendar, Users, Clock, User, MessageCircle } from 'lucide-react-native';
import { fetchAuthorById, formatTimestamp } from '@/utils/firebase-helpers';
import { database } from '@/config/firebase';
import { ref, get } from 'firebase/database';

interface ChallengeCardProps {
  challenge: Quest;
  isActive?: boolean;
  onPress: (challenge: Quest) => void;
  showAuthor?: boolean;
}

interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

export default function ChallengeCard({ challenge, isActive = false, onPress, showAuthor = false }: ChallengeCardProps) {
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  
  const { 
    title, 
    description, 
    category, 
    difficulty, 
    imageUrl,
    isCollaborative,
    authorId,
    userId,
    submissionDeadline,
    participantsCount = 0,
    completed
  } = challenge;

  // Calculate days left for submission deadline
  const getDaysLeft = () => {
    if (!submissionDeadline) return null;
    
    const deadlineDate = new Date(submissionDeadline);
    const currentDate = new Date();
    
    // Calculate the difference in milliseconds
    const diffTime = deadlineDate.getTime() - currentDate.getTime();
    
    // Convert to days and round
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `${diffDays} days left` : 'Deadline passed';
  };

  // Fetch author data from Firebase
  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!authorId && !userId) return;
      
      setIsLoadingAuthor(true);
      try {
        const id = authorId || userId;
        if (id) {
          const authorData = await fetchAuthorById(id);
          setAuthor(authorData);
        }
      } catch (error) {
        console.error('Error fetching author:', error);
      } finally {
        setIsLoadingAuthor(false);
      }
    };

    if (showAuthor) {
      fetchAuthorData();
    }
  }, [authorId, userId, showAuthor]);

  // Fetch submission count from Firebase
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
    switch (category) {
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
      style={[
        styles.card, 
        isActive && !challenge.completed && styles.activeCard,
        challenge.completed && styles.completedCard
      ]} 
      onPress={() => onPress(challenge)}
      activeOpacity={0.7}
    >
      {imageUrl && (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          resizeMode="cover" 
        />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryIcon()} {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </View>
          
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>
        </View>
        
        <Text style={styles.title}>{title}</Text>
        
        {showAuthor && (
          <View style={styles.authorContainer}>
            {author?.avatarUrl ? (
              <Image 
                source={{ uri: author.avatarUrl }} 
                style={styles.authorAvatar}
              />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <User size={12} color={colors.textSecondary} />
              </View>
            )}
            <Text style={styles.authorName}>
              {author?.name || "Anonymous"}
            </Text>
          </View>
        )}
        
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        {showAuthor && (
        <View style={styles.statFooter}>
          
          <View style={styles.infoItem}>
            <Users size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{submissionCount} submissions</Text>
          </View>
          
          {submissionDeadline && (
            <View style={styles.infoItem}>
              <Calendar size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{getDaysLeft()}</Text>
            </View>
          )}
        </View>)}
        
        <View style={styles.footer}>
          {isCollaborative && (
            <View style={styles.infoItem}>
              <Users size={16} color={colors.secondary} />
              <Text style={styles.infoText}>Team</Text>
            </View>
          )}
        </View>
        
        {isActive && !challenge.completed && (
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>In Progress</Text>
          </View>
        )}
        {challenge.completed && (
          <View style={[styles.activeIndicator, styles.completedIndicator]}>
            <Text style={styles.activeText}>Completed</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  completedCard: {
    borderColor: colors.success,
    borderWidth: 2,
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
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    ...typography.caption,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    ...typography.heading3,
    marginBottom: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 6,
  },
  authorAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  authorName: {
    ...typography.body, // Changed from caption to bodySmall to match description
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 16,
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
  activeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedIndicator: {
    backgroundColor: colors.success,
  },
  activeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});