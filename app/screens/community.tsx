import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Stack } from 'expo-router';
import { MessageCircle, Users, TrendingUp, Plus, X, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  image?: string;
  timestamp: string;
}

const initialPosts: Post[] = [
  {
    id: '1',
    author: 'Sarah Green',
    title: 'Beach Cleanup Success!',
    content: 'Just completed my first eco quest! Cleaned up 2kg of plastic from the beach. Feeling proud! 🌊',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: 'Mike Earth',
    title: 'Level 10 Achievement',
    content: 'My turtle just reached level 10! Thanks to everyone who shared tips on how to level up faster.',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    author: 'Emma Eco',
    title: 'Community Garden Project',
    content: 'Started a community garden in my neighborhood. Looking for volunteers to help maintain it!',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    author: 'John Planet',
    title: 'New Member Introduction',
    content: 'New to EcoQuest! Any tips for a beginner? Excited to start my eco journey!',
    timestamp: '2 days ago'
  }
];

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddStory = () => {
    if (storyTitle.trim() && storyContent.trim()) {
      const newPost: Post = {
        id: Date.now().toString(),
        author: 'You',
        title: storyTitle,
        content: storyContent,
        image: selectedImage || undefined,
        timestamp: 'Just now'
      };
      setPosts([newPost, ...posts]);
      setStoryTitle('');
      setStoryContent('');
      setSelectedImage(null);
      setShowAddStory(false);
    } else {
      Alert.alert('Missing Information', 'Please add both title and content for your story.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Community',
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.text,
        }} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.statValue}>2.4K</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={20} color={colors.success} />
            <Text style={styles.statValue}>847</Text>
            <Text style={styles.statLabel}>Posts Today</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={20} color={colors.warning} />
            <Text style={styles.statValue}>15%</Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => setShowAddStory(true)}
        >
          <Plus size={20} color={colors.white} />
          <Text style={styles.createPostText}>Add Your Story</Text>
        </TouchableOpacity>

        <View style={styles.postsContainer}>
          {posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitials}>
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.postInfo}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.timestamp}>{post.timestamp}</Text>
                </View>
              </View>
              
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddStory}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddStory(false)}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContent}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Your Story</Text>
                <TouchableOpacity onPress={() => setShowAddStory(false)}>
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                placeholderTextColor={colors.textSecondary}
                value={storyTitle}
                onChangeText={setStoryTitle}
              />
              
              <TextInput
                style={styles.storyInput}
                placeholder="Share your eco journey..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={storyContent}
                onChangeText={setStoryContent}
              />
              
              <TouchableOpacity 
                style={styles.imageButton}
                onPress={pickImage}
              >
                <Camera size={20} color={colors.primary} />
                <Text style={styles.imageButtonText}>
                  {selectedImage ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
              
              {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              )}
              
              <TouchableOpacity 
                style={styles.postButton}
                onPress={handleAddStory}
              >
                <Text style={styles.postButtonText}>Post Story</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 8,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createPostText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
  postsContainer: {
    padding: 20,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  authorInitials: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postTitle: {
    ...typography.heading4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  postContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    maxHeight: '90%',
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: '600',
  },
  titleInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    ...typography.body,
    color: colors.text,
    marginBottom: 12,
  },
  storyInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    ...typography.body,
    color: colors.text,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  imageButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  selectedImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  postButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: '600',
  },
});