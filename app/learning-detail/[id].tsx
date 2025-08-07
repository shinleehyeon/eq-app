import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import {
  ExternalLink,
  Share2,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react-native";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { useUserStore } from "@/store/user-store";
import { apiClient } from "@/lib/api/client";

interface LearningItem {
  uuid: string;
  title: string;
  content: string;
  category: string;
  type: string;
  difficulty: string;
  status: string;
  thumbnail: string;
  links: string[];
  viewCount: number;
  likeCount: number;
  author: {
    uuid: string;
    name: string;
  };
  authorName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface LearningDetailResponse {
  message: string;
  article: LearningItem;
}

export default function LearningDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [learning, setLearning] = useState<LearningDetailResponse | null>(null);
  const [relatedLearnings, setRelatedLearnings] = useState<LearningItem[]>([]);
  const { user, accessToken } = useUserStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSolved, setQuizSolved] = useState(false);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [videoQuestCompleted, setVideoQuestCompleted] = useState(false);

  useEffect(() => {
    const fetchLearningData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await apiClient.get(
          `/learning/${id}`,
          accessToken || undefined
        );

        if (response.success && response.data) {
          setLearning(response.data as LearningDetailResponse);
        } else {
          Alert.alert("Error", "Learning content not found");
          router.back();
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load learning content");
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningData();
  }, [id, accessToken]);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!id || !accessToken) return;

      try {
        const solvedResponse = await apiClient.checkQuizSolvedByArticle(
          id as string,
          accessToken
        );
        if (solvedResponse.success && solvedResponse.data) {
          setQuizSolved(solvedResponse.data.isSolved);
          if (solvedResponse.data.isSolved && solvedResponse.data.isCorrect) {
            setQuizCompleted(true);
            setIsCorrect(true);
          }
        }

        try {
          const quizResponse = await apiClient.getLearningQuizByArticleId(
            id as string,
            accessToken
          );
          if (quizResponse.success && quizResponse.data) {
            setQuiz(quizResponse.data.quiz);
          }
        } catch (error: any) {
          if (error?.message?.includes('404')) {
            console.log("This learning article has no quiz - this is normal.");
          } else {
            console.error("Error fetching quiz:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuizData();
  }, [id, accessToken]);

  useEffect(() => {
    const fetchRelatedLearnings = async () => {
      if (!learning?.article?.category) return;

      try {
        const response = await apiClient.getLearningList(
          "articles",
          1,
          3,
          accessToken || undefined
        );

        if (response.success && response.data) {
          const related = response.data.data
            .filter((item: LearningItem) => item.uuid !== id)
            .slice(0, 2);
          setRelatedLearnings(related);
        }
      } catch (error) {
        console.error("Error fetching related learnings:", error);
      }
    };

    fetchRelatedLearnings();
  }, [learning?.article?.category, id, accessToken]);

  useEffect(() => {
    if (
      !learning?.article ||
      learning.article.type !== "videos" ||
      videoQuestCompleted
    )
      return;

    const timer = setInterval(() => {
      setVideoWatchTime((prev) => {
        const newTime = prev + 1;
        if (newTime === 30 && !videoQuestCompleted) {
          // API 요청을 한 번만 보냄
          completeVideoQuest();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [learning?.article, videoQuestCompleted]);

  const completeVideoQuest = async () => {
    if (!accessToken || !learning?.article || videoQuestCompleted) return;

    try {
      const response = await apiClient.post(
        `/quests/completed-watch-video`,
        {},
        accessToken
      );

      if (response.success) {
        setVideoQuestCompleted(true);
        Alert.alert(
          "Quest Complete! 🎉", 
          "Video watching quest has been completed successfully!"
        );
      } else {
        Alert.alert(
          "Quest Failed",
          response.error || "Failed to complete video quest. Please try again."
        );
      }
    } catch (error) {
      console.error("Error completing video quest:", error);
      Alert.alert(
        "Error",
        "An error occurred while completing the quest. Please check your connection and try again."
      );
    }
  };


  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:\?v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = () => {
    if (learning?.article?.links && learning.article.links.length > 0) {
      const videoLink = learning.article.links.find(
        (link: string) =>
          link.includes("youtube.com") || link.includes("youtu.be")
      );

      if (videoLink) {
        const videoId = getYouTubeVideoId(videoLink);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        return (
          <View style={styles.videoContainer}>
            <WebView
              style={styles.video}
              source={{ uri: embedUrl }}
              allowsFullscreenVideo
              javaScriptEnabled
            />
          </View>
        );
      }
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: "Learn",
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!learning) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: "Learn",
            headerTitleStyle: styles.headerTitle,
          }} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Learning content not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${learning.article.title}\n\n${
          learning.article.content
        }\n\nSource: ${learning.article.links?.[0] || "EcoBloom App"}`,
        title: learning.article.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDeleteLearning = async () => {
    Alert.alert(
      "Delete Learning",
      "Are you sure you want to delete this learning content?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiClient.delete(
                `/learning/${id}`,
                accessToken || undefined
              );
              if (response.success) {
                router.back();
              } else {
                Alert.alert("Error", "Failed to delete learning content");
              }
            } catch (error) {
              console.error("Error deleting learning:", error);
              Alert.alert("Error", "Failed to delete learning content");
            }
          },
        },
      ]
    );
  };

  const handleSourceClick = () => {
    if (learning?.article?.links && learning.article.links.length > 0) {
      Linking.openURL(learning.article.links[0]);
    }
  };

  const handleQuizAnswer = async (answerIndex: number) => {
    if (quizCompleted || !quiz || !accessToken) return;

    setQuizLoading(true);
    setSelectedAnswer(answerIndex);

    try {
      const response = await apiClient.submitQuizAnswer(
        quiz.uuid,
        answerIndex,
        accessToken
      );

      if (response.success && response.data) {
        const correct = response.data.isCorrect;
        setIsCorrect(correct);

        if (correct) {
          setQuizCompleted(true);
          setQuizSolved(true);

          setTimeout(() => {
            const rewardText = `\n\n🎉 Rewards Earned!\nMarathon Points: +${response.data?.earnedMarathonPoints}\nExperience: +${response.data?.earnedExperience}`;

            Alert.alert(
              "Correct! 🎉",
              `Excellent! You understood the key points of this learning well.${rewardText}`,
              [{ text: "OK" }]
            );
          }, 500);
        } else {
          setTimeout(() => {
            Alert.alert("Incorrect 😔", `Please try again!`, [
              { text: "Try Again" },
            ]);
          }, 500);
        }
      } else {
        Alert.alert("Error", "Failed to submit quiz.");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      Alert.alert("Error", "An error occurred while submitting the quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setIsCorrect(null);
    setShowQuiz(false);
  };

  const retryQuiz = () => {
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setIsCorrect(null);
  };

  const getCategoryColor = () => {
    switch (learning.article.category) {
      case "energy":
        return "#FFC107";
      case "waste":
        return "#4CAF50";
      case "food":
        return "#FF5722";
      case "transport":
        return "#2196F3";
      case "water":
        return "#03A9F4";
      case "advocacy":
        return "#9C27B0";
      case "education":
        return "#3F51B5";
      default:
        return colors.primary;
    }
  };

  const renderHeaderRight = () => {
    return (
      <View style={styles.headerActions}>
        {user?.id === learning?.article?.author?.uuid ? (
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={styles.headerButton}
          >
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Learn",
          headerTitleStyle: styles.headerTitle,
          headerRight: renderHeaderRight,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderVideoPlayer() ||
          (learning.article.thumbnail ? (
            <Image
              source={{ uri: learning.article.thumbnail }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.placeholderContainer,
                { backgroundColor: getCategoryColor() },
              ]}
            >
              <Text style={styles.placeholderTitle}>
                {learning.article.title}
              </Text>
              <Text style={styles.placeholderCategory}>
                {`${learning.article.category}`.toUpperCase()}
              </Text>
            </View>
          ))}

        <View style={styles.content}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor() },
            ]}
          >
            <Text style={styles.categoryText}>
              {`${learning.article.category}`.charAt(0).toUpperCase() +
                `${learning.article.category}`.slice(1)}
            </Text>
          </View>

          <Text style={styles.title}>{learning.article.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>3 min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>
                Difficulty: {learning.article.difficulty}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>
                {learning.article.viewCount} views
              </Text>
            </View>
          </View>

          <Text style={styles.learningContent}>{learning.article.content}</Text>

          {learning.article.author && (
            <View style={styles.authorContainer}>
              <View style={styles.authorAvatar}>
                <User size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {learning.article.author.name || "Anonymous"}
                </Text>
                <Text style={styles.authorSubtext}>Author</Text>
              </View>
            </View>
          )}

          {learning.article.links && learning.article.links.length > 0 && (
            <TouchableOpacity
              style={styles.sourceContainer}
              onPress={handleSourceClick}
            >
              <Text style={styles.sourceLabel}>Source:</Text>
              <View style={styles.sourceContent}>
                <Text style={[styles.sourceText, styles.clickableSource]}>
                  {learning.article.links[0]}
                </Text>
                <ExternalLink size={16} color={colors.primary} />
              </View>
            </TouchableOpacity>
          )}

          {quiz && learning?.article?.type !== "videos" && (
            <View style={styles.quizContainer}>
              {quizSolved && isCorrect ? (
                <View style={styles.quizCompletedContainer}>
                  <Text style={styles.quizCompletedText}>
                    ✅ Correct answer!
                  </Text>
                  <Text style={styles.quizCompletedSubtext}>
                    Rewards: Marathon Points +{quiz.rewardMarathonPoints}, Experience +
                    {quiz.rewardExperience}
                  </Text>
                </View>
              ) : quizSolved && !isCorrect ? (
                <View style={styles.quizIncorrectContainer}>
                  <Text style={styles.quizIncorrectText}>
                    ❌ Quiz completed but incorrect
                  </Text>
                  <Text style={styles.quizIncorrectSubtext}>
                    Try again to get the correct answer!
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.quizTitle}>Knowledge Test</Text>
                  <Text style={styles.quizDescription}>
                    Check if you understood the key points of this learning content!
                  </Text>

                  {!showQuiz ? (
                    <TouchableOpacity
                      style={styles.startQuizButton}
                      onPress={() => setShowQuiz(true)}
                    >
                      <Text style={styles.startQuizButtonText}>Start Quiz</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.quizContent}>
                      <Text style={styles.quizQuestion}>{quiz.title}</Text>

                      <View style={styles.optionsContainer}>
                        {quiz.options.map((option: string, index: number) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.optionButton,
                              selectedAnswer === index &&
                                (isCorrect === true
                                  ? styles.correctOption
                                  : isCorrect === false
                                  ? styles.incorrectOption
                                  : styles.selectedOption),
                              quizCompleted &&
                                isCorrect === false &&
                                index === quiz.correctAnswerIndex &&
                                styles.correctOption,
                            ]}
                            onPress={() => handleQuizAnswer(index)}
                            disabled={quizCompleted || quizLoading}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                selectedAnswer === index &&
                                  quizCompleted &&
                                  styles.selectedOptionText,
                                quizCompleted &&
                                  isCorrect === false &&
                                  index === quiz.correctAnswerIndex &&
                                  styles.correctOptionText,
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {quizLoading && (
                        <View style={styles.quizLoadingContainer}>
                          <Text style={styles.quizLoadingText}>Submitting...</Text>
                        </View>
                      )}

                      {quizCompleted && isCorrect && (
                        <TouchableOpacity
                          style={styles.resetQuizButton}
                          onPress={resetQuiz}
                        >
                          <Text style={styles.resetQuizButtonText}>
                            Retake Quiz
                          </Text>
                        </TouchableOpacity>
                      )}

                      {quizCompleted && !isCorrect && (
                        <TouchableOpacity
                          style={styles.retryQuizButton}
                          onPress={retryQuiz}
                        >
                          <Text style={styles.retryQuizButtonText}>
                            Try Again
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {learning?.article?.type === "videos" && (
            <View style={styles.quizContainer}>
              <Text style={styles.quizTitle}>Watch Video</Text>
              <Text style={styles.quizDescription}>
                Complete your learning by watching the video!
              </Text>

              {videoQuestCompleted ? (
                <View style={styles.quizCompletedContainer}>
                  <Text style={styles.quizCompletedText}>
                    ✅ Video watch completed!
                  </Text>
                  <Text style={styles.quizCompletedSubtext}>
                    Quest has been completed!
                  </Text>
                </View>
              ) : (
                <View style={styles.videoTimerContainer}>
                  <Text style={styles.videoTimerText}>
                    {videoWatchTime >= 30 ? 0 : 30 - videoWatchTime} seconds left
                  </Text>
                  <Text style={styles.videoTimerSubtext}>
                    Quest will be completed after watching for 30 seconds
                  </Text>
                </View>
              )}
            </View>
          )}

          {relatedLearnings.length > 0 && (
            <View style={styles.relatedTipsContainer}>
              <Text style={styles.relatedTipsTitle}>Related Learning</Text>

              {relatedLearnings.map((relatedLearning) => (
                <TouchableOpacity
                  key={relatedLearning.uuid}
                  style={styles.relatedTipItem}
                  onPress={() =>
                    router.push(`/learning-detail/${relatedLearning.uuid}`)
                  }
                >
                  <Text style={styles.relatedTipTitle}>
                    {relatedLearning.title}
                  </Text>
                  <Text style={styles.relatedTipContent} numberOfLines={2}>
                    {relatedLearning.content}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
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
                router.push(`/learning-detail/${id}`);
              }}
            >
              <Pencil size={20} color={colors.text} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleDeleteLearning();
              }}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>
                Delete
              </Text>
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
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
  headerTitle: {
    ...typography.heading3,
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  clickableSource: {
    color: colors.primary,
    textDecorationLine: "underline",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  image: {
    width: "100%",
    height: 200,
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    ...typography.heading3,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholderCategory: {
    ...typography.caption,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  videoContainer: {
    width: "100%",
    height: 200,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  video: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    ...typography.heading2,
    marginBottom: 16,
  },
  learningContent: {
    ...typography.body,
    lineHeight: 24,
    marginBottom: 24,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  authorSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sourceContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sourceLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  sourceContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sourceText: {
    ...typography.body,
    fontStyle: "italic",
    flex: 1,
  },
  quizContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quizTitle: {
    ...typography.heading3,
    marginBottom: 8,
  },
  quizDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  startQuizButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  startQuizButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  quizContent: {
    width: "100%",
  },
  quizQuestion: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.success + "20",
  },
  incorrectOption: {
    borderColor: colors.error,
    backgroundColor: colors.error + "20",
  },
  optionText: {
    ...typography.body,
    color: colors.text,
  },
  selectedOptionText: {
    fontWeight: "600",
  },
  resetQuizButton: {
    backgroundColor: colors.textSecondary + "20",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "center",
  },
  resetQuizButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  relatedTipsContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
  },
  relatedTipsTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  relatedTipItem: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  relatedTipTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  relatedTipContent: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuText: {
    ...typography.body,
  },
  quizCompletedContainer: {
    backgroundColor: colors.success + "20",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quizCompletedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: "600",
    marginBottom: 4,
  },
  quizCompletedSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  quizLoadingContainer: {
    alignItems: "center",
    padding: 16,
  },
  quizLoadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  retryQuizButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  retryQuizButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  correctOptionText: {
    ...typography.body,
    color: colors.success,
    fontWeight: "600",
  },
  quizIncorrectContainer: {
    backgroundColor: colors.error + "20",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quizIncorrectText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
    marginBottom: 4,
  },
  quizIncorrectSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
  videoTimerContainer: {
    backgroundColor: colors.primary + "20",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  videoTimerText: {
    ...typography.heading3,
    color: colors.primary,
    fontWeight: "600",
    marginBottom: 4,
  },
  videoTimerSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
