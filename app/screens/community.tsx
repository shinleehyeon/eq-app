import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MessageCircle, Users, Heart, Share2, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Sarah Green',
    content: 'Just completed my first eco quest! Cleaned up 2kg of plastic from the beach. Feeling proud! 🌊',
    likes: 45,
    comments: 12,
    shares: 3,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: 'Mike Earth',
    content: 'My turtle just reached level 10! Thanks to everyone who shared tips on how to level up faster.',
    likes: 78,
    comments: 23,
    shares: 5,
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    author: 'Emma Eco',
    content: 'Started a community garden in my neighborhood. Looking for volunteers to help maintain it!',
    likes: 92,
    comments: 34,
    shares: 12,
    timestamp: '1 day ago'
  },
  {
    id: '4',
    author: 'John Planet',
    content: 'New to EcoQuest! Any tips for a beginner? Excited to start my eco journey!',
    likes: 31,
    comments: 18,
    shares: 2,
    timestamp: '2 days ago'
  }
];

export default function CommunityScreen() {
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

        <TouchableOpacity style={styles.createPostButton}>
          <MessageCircle size={20} color={colors.white} />
          <Text style={styles.createPostText}>Share Your Eco Story</Text>
        </TouchableOpacity>

        <View style={styles.postsContainer}>
          {mockPosts.map(post => (
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
              
              <Text style={styles.postContent}>{post.content}</Text>
              
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Heart size={18} color={colors.textSecondary} />
                  <Text style={styles.actionText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageCircle size={18} color={colors.textSecondary} />
                  <Text style={styles.actionText}>{post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Share2 size={18} color={colors.textSecondary} />
                  <Text style={styles.actionText}>{post.shares}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  postContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});