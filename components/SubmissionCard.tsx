import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { CreativeSubmission } from '@/types';
import { useUserStore } from '@/store/user-store';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Heart, MessageCircle, User, Award } from 'lucide-react-native';
import { fetchAuthorById } from '@/utils/firebase-helpers';

interface SubmissionCardProps {
  submission: CreativeSubmission;
  onPress?: () => void;
}

const SubmissionCard: React.FC<SubmissionCardProps> = ({ 
  submission,
  onPress
}) => {
  const router = useRouter();
  const { users } = useUserStore();
  const [author, setAuthor] = useState(null);
  
  useEffect(() => {
    const getAuthor = async () => {
      const authorData = await fetchAuthorById(submission.userId);
      setAuthor(authorData);
    };
    
    getAuthor();
  }, [submission.userId]);

  const formattedDate = new Date(submission.submissionDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const shouldHideAuthor = author?.settings?.hideAuthoredQuests && author?.settings?.privateProfile;
  
  const handleUserPress = (e: any) => {
    e.stopPropagation();
    if (!shouldHideAuthor) {
      router.push(`/user-profile/${submission.userId}`);
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      {submission.mediaUrl && (
        <Image 
          source={{ uri: submission.mediaUrl }} 
          style={styles.image} 
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{submission.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{submission.description}</Text>
        
        <View style={styles.submissionMeta}>
          <TouchableOpacity 
            style={styles.authorContainer}
            onPress={handleUserPress}
          >
            {shouldHideAuthor ? (
              <View style={styles.anonymousAvatar}>
                <User size={20} color={colors.textSecondary} />
              </View>
            ) : (
              <Image 
                source={{ uri: author?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }} 
                style={styles.avatar} 
              />
            )}
            <Text style={styles.userName}>
              {shouldHideAuthor ? "Anonymous" : author?.name || "Anonymous"}
            </Text>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MessageCircle size={14} color={colors.primary} />
              <Text style={styles.statText}>
                {submission.comments ? Object.keys(submission.comments).length : 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Heart size={14} color={colors.primary} />
              <Text style={styles.statText}>{submission.likes || 0}</Text>
            </View>
            {submission.badgeCount > 0 && (
              <View style={styles.statItem}>
                <Award size={14} color={colors.primary} />
                <Text style={styles.statText}>{submission.badgeCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  content: {
    padding: 16,
  },
  title: {
    ...typography.heading4,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  submissionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18, // Make it circular
    marginRight: 6,
  },
  anonymousAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18, // Make it circular
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  userName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default SubmissionCard;