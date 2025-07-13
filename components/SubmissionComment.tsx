import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SubmissionComment as SubmissionCommentType } from '@/types';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { User } from 'lucide-react-native';

interface SubmissionCommentProps {
  comment: SubmissionCommentType;
}

const SubmissionComment: React.FC<SubmissionCommentProps> = ({ comment }) => {
  const router = useRouter();
  const formattedDate = new Date(comment.timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleUserPress = () => {
    router.push(`/user-profile/${comment.userId}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={handleUserPress}
      >
        {comment.userAvatar ? (
          <Image 
            source={{ uri: comment.userAvatar }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={16} color={colors.textSecondary} />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleUserPress}>
            <Text style={styles.userName}>{comment.userName}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>{formattedDate}</Text>
        </View>
        
        <Text style={styles.content}>{comment.content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  content: {
    ...typography.body,
  },
});

export default SubmissionComment;