import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Share
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useUserStore } from '@/store/user-store';
import Button from '@/components/Button';
import { 
  Award, 
  Calendar, 
  Heart,
  MessageCircle,
  Send,
  Share2,
  ThumbsUp,
  User as UserIcon,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react-native';
import { database } from '@/config/firebase';
import { fetchAuthorById } from '@/utils/firebase-helpers';
import { ref, get, runTransaction, push, set } from 'firebase/database';

// Add this function just before formatRelativeTime

// Format date in a readable format
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Add this function to format relative time

// Format time relative to now (e.g., "2 hours ago")
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 30) {
    return formatDate(dateString);
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else {
    return 'Just now';
  }
};

// Comment type definition
interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  isDeleted: boolean;
}

// Comment with user data for display
interface CommentWithUser extends Comment {
  userName: string;
  userAvatar: string;
}

interface Author {
  id: string;
  name: string;
  avatarUrl: string;
}

export default function SubmissionDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, users } = useUserStore();
  
  const [submission, setSubmission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [author, setAuthor] = useState(null);
  const [relatedQuest, setRelatedQuest] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  
  // Fetch the submission data from Firebase
  useEffect(() => {
    const fetchSubmission = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching submission details for ID:', id);
        
        // Get the specific submission from Firebase
        const submissionRef = ref(database, `questSubmissions/${id}`);
        const snapshot = await get(submissionRef);
        
        if (snapshot.exists()) {
          const submissionData = snapshot.val();
          console.log('Submission data:', submissionData);
          setSubmission(submissionData);
          
          // Find the author
          if (submissionData.userId && users) {
            const authorData = await fetchAuthorById(submissionData.userId);
            setAuthor(authorData);
          }

          // Check if the current user has liked this submission
          if (user) {
            const userLikesRef = ref(database, `users/${user.id}/likedSubmissions/${id}`);
            const likesSnapshot = await get(userLikesRef);
            setIsLiked(likesSnapshot.exists());
          }
          
          // Fetch the related quest
          if (submissionData.questId) {
            try {
              const questRef = ref(database, `openQuests/${submissionData.questId}`);
              const questSnapshot = await get(questRef);
              
              if (questSnapshot.exists()) {
                setRelatedQuest(questSnapshot.val());
              } else {
                console.log('Related quest not found');
              }
            } catch (error) {
              console.error('Error fetching related quest:', error);
            }
          }
          
          // Fetch and process comments
          if (submissionData.comments) {
            const commentsArray = Array.isArray(submissionData.comments) 
              ? submissionData.comments 
              : Object.values(submissionData.comments);
            
            // Enrich comments with user data
            const enrichedComments = await Promise.all(commentsArray.map(async (comment: Comment) => {
              // First try to find user in the local users array
              let commentUser = users?.find(u => u.id === comment.userId);
              
              // If not found in local state, fetch from Firebase directly
              if (!commentUser && comment.userId) {
                try {
                  const userRef = ref(database, `users/${comment.userId}`);
                  const userSnapshot = await get(userRef);
                  if (userSnapshot.exists()) {
                    commentUser = userSnapshot.val();
                  }
                } catch (error) {
                  console.error('Error fetching comment user:', error);
                }
              }
              
              return {
                ...comment,
                userName: commentUser?.name || `User ${comment.userId.slice(0, 5)}`,
                userAvatar: commentUser?.avatar || `https://ui-avatars.com/api/?name=${commentUser?.name || 'U'}&background=random`,
              };
            }));
            
            // Sort comments by timestamp (newest first)
            const sortedComments = enrichedComments.sort((a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            
            setComments(sortedComments);
          }
        } else {
          console.log('Submission not found');
        }
      } catch (error) {
        console.error('Error fetching submission:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubmission();
  }, [id, users, user]);
  
  const handleLike = async () => {
    if (!user || !submission) return;
    
    try {
      // Get current likes count first
      const submissionRef = ref(database, `questSubmissions/${id}`);
      const submissionSnapshot = await get(submissionRef);
      const currentLikes = submissionSnapshot.val()?.likes || 0;

      // Update submission likes count
      await set(ref(database, `questSubmissions/${id}/likes`), isLiked ? currentLikes - 1 : currentLikes + 1);

      // Update user's liked submissions
      const userLikesRef = ref(database, `users/${user.id}/likedSubmissions/${id}`);
      if (isLiked) {
        // Remove like
        await set(userLikesRef, null);
      } else {
        // Add like
        await set(userLikesRef, true);
      }
      
      // Update local state
      setSubmission(prev => ({
        ...prev,
        likes: isLiked ? currentLikes - 1 : currentLikes + 1
      }));
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // Create the comment data
      const commentData: Comment = {
        id: Date.now().toString(),
        userId: user.id,
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
        isDeleted: false,
      };
      
      // Add to Firebase
      const commentRef = ref(database, `questSubmissions/${id}/comments`);
      const newCommentRef = push(commentRef);
      commentData.id = newCommentRef.key || commentData.id;
      await set(newCommentRef, commentData);
      
      // Add to local state with user info
      const newCommentWithUser: CommentWithUser = {
        ...commentData,
        userName: user.name || `User ${user.id.slice(0, 5)}`,
        userAvatar: user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name || 'U'}&background=random`,
      };
      
      // Update state
      setComments([newCommentWithUser, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteSubmission = async () => {
    Alert.alert(
      "Delete Submission",
      "Are you sure you want to delete this submission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const submissionRef = ref(database, `questSubmissions/${id}`);
              await set(submissionRef, {
                ...submission,
                isDeleted: true,
                deletedAt: new Date().toISOString()
              });
              router.back();
            } catch (error) {
              console.error('Error deleting submission:', error);
              Alert.alert('Error', 'Failed to delete submission');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my submission: ${submission.title}\n\n${submission.description}`,
        title: submission.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderHeaderRight = () => {
    if (user?.id === submission?.userId) {
      return (
        <TouchableOpacity 
          onPress={() => setMenuVisible(true)}
          style={styles.headerButton}
        >
          <MoreVertical size={24} color={colors.text} />
        </TouchableOpacity>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  if (!submission) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Submission not found</Text>
      </View>
    );
  }
  
  function calculateDaysLeft(submissionDeadline: any): React.ReactNode {
    throw new Error('Function not implemented.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Submission Details',
          headerTitleStyle: styles.headerTitle,
          headerRight: renderHeaderRight,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image 
          source={{ uri: submission.mediaUrl }} // Changed from submission.imageUrl
          style={styles.image} 
          resizeMode="contain"
        />
        
        <View style={styles.content}>
          {relatedQuest && (
            <TouchableOpacity 
              style={styles.questLink}
              onPress={() => router.push(`/creative-challenge/${relatedQuest.id}`)}
            >
              <Text style={styles.questLinkText}>{relatedQuest.title}</Text>
            </TouchableOpacity>
          )}
          
          <Text style={styles.title}>{submission.title}</Text>
          <Text style={styles.description}>{submission.description}</Text>
          
          {author && (
            <TouchableOpacity 
              onPress={() => router.push(`/user-profile/${author.id}`)}
              accessibilityLabel={`View ${author.name}'s profile`}
            >
              <View style={styles.authorContainer}>
                <View style={styles.authorInfo}>
                  <Image 
                    source={{ uri: author.avatarUrl }}
                    style={styles.authorAvatar}
                  />
                  <Text style={styles.authorText}>{author.name}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          
          <View style={styles.likesContainer}>
            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
              <Heart size={20} color={isLiked ? colors.primary : colors.textSecondary} />
              <Text style={styles.likesText}>{submission.likes || 0} Likes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>Comments</Text>
            {/* Comments List */}
            {comments.length > 0 ? (
              <View style={styles.commentsList}>
                {comments
                  .filter(comment => !comment.isDeleted)
                  .map((comment, index) => (
                    <View key={comment.id || index} style={styles.commentItem}>
                      {/* Make avatar clickable */}
                      <TouchableOpacity 
                        onPress={() => router.push(`/user-profile/${comment.userId}`)}
                        accessibilityLabel={`View ${comment.userName}'s profile`}
                      >
                        <Image 
                          source={{ uri: comment.userAvatar }}
                          style={styles.commentAvatar}
                        />
                      </TouchableOpacity>
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          {/* Make username clickable */}
                          <TouchableOpacity 
                            onPress={() => router.push(`/user-profile/${comment.userId}`)}
                            accessibilityLabel={`View ${comment.userName}'s profile`}
                          >
                            <Text style={styles.commentUserName}>{comment.userName}</Text>
                          </TouchableOpacity>
                          <Text style={styles.commentTime}>
                            {formatRelativeTime(comment.timestamp)}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.content}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <View style={styles.emptyCommentsContainer}>
                <Text style={styles.emptyCommentsText}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            )}
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.commentInputContainer}
        >
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            editable={!isSubmittingComment}
          />
          <TouchableOpacity onPress={handleCommentSubmit} disabled={isSubmittingComment}>
            <Send size={24} color={colors.primary} />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ScrollView>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push(`/edit-submission/${id}`);
              }}
            >
              <Pencil size={20} color={colors.text} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleDeleteSubmission();
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleShare();
              }}
            >
              <Share2 size={20} color={colors.text} />
              <Text style={styles.menuText}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  headerTitle: {
    ...typography.heading3,
  },
  scrollContent: {
    padding: 16,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: colors.card,
  },
  content: {
    padding: 16,
  },
  questLink: {
    marginBottom: 12,
  },
  questLinkText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.heading2,
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15', // Primary color with 15% opacity
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  authorInfo: {
    marginLeft: 12,
    flexDirection: 'row',
  },
  authorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginRight: 12,
  },
  authorText: {
    ...typography.heading3,
    marginLeft: 8,
    marginTop: 8,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likesText: {
    ...typography.body,
    color: colors.text,
  },
  commentsContainer: {
    marginTop: 24,
  },
  commentsTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  commentsList: {
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  commentText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  emptyCommentsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: -16,
    marginLeft: -16,
    marginRight: -16,
    backgroundColor: colors.card,
    padding: 16,
  },
  commentInput: {
    flex: 1,
    ...typography.body,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuText: {
    ...typography.body,
  },
  headerButton: {
    padding: 8,
  },
});