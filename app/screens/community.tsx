import React, { useState, useEffect } from "react";
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
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { Stack } from "expo-router";
import {
  MessageCircle,
  Users,
  TrendingUp,
  Plus,
  X,
  Camera,
  Heart,
  Eye,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { apiClient } from "@/lib/api/client";
import { useUserStore } from "@/store/user-store";

interface CommunityPost {
  uuid: string;
  title: string;
  content: string;
  thumbnail: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  authorId: string;
  authorName: string;
  authorProfileImage: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateCommunityDto {
  title: string;
  content: string;
  thumbnail?: string;
  tags?: string[];
}

interface CommunityStats {
  totalMembers: number;
  todayPosts: number;
  growthRate: number;
}

export default function CommunityScreen() {
  const { accessToken } = useUserStore();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [stats, setStats] = useState<CommunityStats>({
    totalMembers: 0,
    todayPosts: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyContent, setStoryContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(
        "/community/stats",
        accessToken || undefined
      );
      if (response.success && response.data) {
        setStats((response.data as any).stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      const response = await apiClient.get(
        `/community?page=${pageNum}&limit=10`,
        accessToken || undefined
      );

      if (response.success && response.data) {
        const newPosts = (response.data as any).data || [];
        const pagination = (response.data as any).pagination;

        if (refresh) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }

        setHasMore(pagination.hasNext);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
    fetchPosts(1, true);
  };

  useEffect(() => {
    fetchStats();
    fetchPosts(1, true);
  }, []);

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

  const handleAddStory = async () => {
    if (!storyTitle.trim() || !storyContent.trim()) {
      Alert.alert(
        "Missing Information",
        "Please add both title and content for your story."
      );
      return;
    }

    if (!accessToken) {
      Alert.alert("Authentication Required", "Please log in to post a story.");
      return;
    }

    try {
      let thumbnailUrl: string | undefined;

      // If there's a selected image, upload it first
      if (selectedImage) {
        const formData = new FormData();

        // React Native에서 파일 업로드를 위한 올바른 형식
        const fileInfo = {
          uri: selectedImage,
          type: "image/jpeg",
          name: "image.jpg",
        };

        formData.append("file", fileInfo as any);

        try {
          // FormData를 위한 별도의 fetch 요청
          const response = await fetch(
            `https://eqapi.juany.kr/upload/file/system`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                // Content-Type은 자동으로 설정되도록 제거
              },
              body: formData,
            }
          );

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorText}`
            );
          }

          const result = await response.json();
          console.log("Upload response:", result);
          console.log("result.url type:", typeof result.url);
          console.log("result.url value:", result.url);

          // 백엔드 응답: { url: { url: string, fileName: string, fileSize: number } }
          if (result.url) {
            if (typeof result.url === "string") {
              thumbnailUrl = result.url;
            } else if (result.url.url) {
              thumbnailUrl = result.url.url;
            } else {
              console.error("Invalid URL structure:", result.url);
              throw new Error("Invalid URL structure");
            }
          } else {
            console.error("Unexpected response structure:", result);
            throw new Error("Invalid response structure");
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError);
          Alert.alert("Error", "Failed to upload image");
          return;
        }
      }

      const createPostData: CreateCommunityDto = {
        title: storyTitle.trim(),
        content: storyContent.trim(),
        thumbnail: thumbnailUrl,
        tags: [], // You can add tag functionality later
      };

      const response = await apiClient.post(
        "/community",
        createPostData,
        accessToken
      );

      if (response.success) {
        Alert.alert("Success", "Your story has been posted!");
        setStoryTitle("");
        setStoryContent("");
        setSelectedImage(null);
        setShowAddStory(false);
        // Refresh the posts list
        fetchPosts(1, true);
      } else {
        Alert.alert("Error", response.error || "Failed to post story");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to post story");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  const getAuthorInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Community",
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            if (hasMore && !loading) {
              fetchPosts(page + 1);
            }
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color={colors.primary} />
            <Text style={styles.statValue}>
              {stats.totalMembers >= 1000
                ? `${(stats.totalMembers / 1000).toFixed(1)}K`
                : stats.totalMembers.toString()}
            </Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <MessageCircle size={20} color={colors.success} />
            <Text style={styles.statValue}>{stats.todayPosts}</Text>
            <Text style={styles.statLabel}>Posts Today</Text>
          </View>
          <View style={styles.statItem}>
            <TrendingUp size={20} color={colors.warning} />
            <Text style={styles.statValue}>{stats.growthRate}%</Text>
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
          {loading && posts.length === 0 ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share your eco journey!
              </Text>
            </View>
          ) : (
            posts.map((post) => (
              <View key={post.uuid} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.authorAvatar}>
                    {post.authorProfileImage ? (
                      <Image
                        source={{ uri: post.authorProfileImage }}
                        style={styles.authorProfileImage}
                      />
                    ) : (
                      <Text style={styles.authorInitials}>
                        {getAuthorInitials(post.authorName)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.postInfo}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.timestamp}>
                      {formatTimestamp(post.createdAt)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent}>{post.content}</Text>

                {post.thumbnail && (
                  <Image
                    source={{ uri: post.thumbnail }}
                    style={styles.postImage}
                  />
                )}

                <View style={styles.postStats}>
                  <View style={styles.stat}>
                    <Eye size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{post.viewCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Heart size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{post.likeCount}</Text>
                  </View>
                  <View style={styles.stat}>
                    <MessageCircle size={16} color={colors.textSecondary} />
                    <Text style={styles.statText}>{post.commentCount}</Text>
                  </View>
                </View>

                {post.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {post.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
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
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
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
                    {selectedImage ? "Change Photo" : "Add Photo"}
                  </Text>
                </TouchableOpacity>

                {selectedImage && (
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.selectedImage}
                  />
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
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    ...typography.heading3,
    color: colors.text,
    marginTop: 8,
    fontWeight: "bold",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createPostText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "600",
  },
  postsContainer: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  authorProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorInitials: {
    ...typography.body,
    color: colors.white,
    fontWeight: "bold",
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  timestamp: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postTitle: {
    ...typography.heading4,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 8,
  },
  postContent: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    maxHeight: "90%",
    minHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
    fontWeight: "600",
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
    textAlignVertical: "top",
    marginBottom: 12,
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  imageButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  selectedImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  postButtonText: {
    ...typography.button,
    color: colors.white,
    fontWeight: "600",
  },
});
