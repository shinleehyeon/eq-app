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
  Bookmark,
  BookmarkCheck,
  Clock,
} from "lucide-react-native";
import { Linking } from "react-native";
import { WebView } from "react-native-webview";
import { fetchUserDataFromFirebase } from "@/utils/firebase-helpers";
import { database } from "@/config/firebase";
import { ref, get, set } from "firebase/database";
import { useUserStore } from "@/store/user-store";
import mockEcoTips from "@/mocks/eco-tips";

export default function EcoTipDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tip, setTip] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [relatedTips, setRelatedTips] = useState<any[]>([]);
  const { user } = useUserStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const fetchTipData = async () => {
      if (!id) return;

      try {
        // First try to find in mock data
        const mockTip = mockEcoTips.find((tip) => tip.id === id);
        if (mockTip) {
          setTip(mockTip);
          return;
        }

        // If not found in mock data, try Firebase
        const tipRef = ref(database, `learn/${id}`);
        const snapshot = await get(tipRef);

        if (snapshot.exists()) {
          const tipData = snapshot.val();
          // Don't show deleted tips
          if (tipData.isDeleted === true) {
            router.back();
            return;
          }
          setTip({ id, ...tipData });
        }
      } catch (error) {
        console.error("Error fetching tip:", error);
      }
    };

    fetchTipData();
  }, [id]);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (tip?.userId) {
        const authorData = await fetchUserDataFromFirebase(tip.userId);
        if (authorData) {
          setAuthor(authorData);
        }
      }
    };

    fetchAuthor();
  }, [tip?.userId]);

  useEffect(() => {
    const fetchRelatedTips = async () => {
      if (!tip?.category) return;

      try {
        // First get related tips from mock data
        const mockRelatedTips = mockEcoTips
          .filter((t) => t.id !== id && t.category === tip.category)
          .slice(0, 2);

        if (mockRelatedTips.length > 0) {
          setRelatedTips(mockRelatedTips);
          return;
        }

        // If not enough mock data, try Firebase
        const learnRef = ref(database, "learn");
        const snapshot = await get(learnRef);

        if (snapshot.exists()) {
          const allTips = Object.entries(snapshot.val())
            .map(([key, value]: [string, any]) => ({ id: key, ...value }))
            .filter(
              (t) => t.id !== id && t.category === tip.category && !t.isDeleted
            )
            .slice(0, 2);

          setRelatedTips(allTips);
        }
      } catch (error) {
        console.error("Error fetching related tips:", error);
      }
    };

    fetchRelatedTips();
  }, [tip?.category, id]);

  const getYouTubeVideoId = (url: string) => {
    const regex = /(?:\?v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderVideoPlayer = () => {
    if (tip?.resourceType === "video" && tip.videoLink) {
      const videoId = getYouTubeVideoId(tip.videoLink);
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
    return null;
  };

  if (!tip) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${tip.title}\n\n${tip.content}\n\nSource: ${
          tip.source || "EcoBloom App"
        }`,
        title: tip.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDeleteTip = async () => {
    Alert.alert(
      "Delete Eco Tip",
      "Are you sure you want to delete this eco tip?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const tipRef = ref(database, `learn/${id}`);
              await set(tipRef, {
                ...tip,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
              });
              router.back();
            } catch (error) {
              console.error("Error deleting tip:", error);
              Alert.alert("Error", "Failed to delete eco tip");
            }
          },
        },
      ]
    );
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      isBookmarked ? "Removed from Bookmarks" : "Added to Bookmarks",
      isBookmarked
        ? "Tip removed from your bookmarks"
        : "Tip saved to your bookmarks"
    );
  };

  const handleSourceClick = () => {
    if (tip?.sourceLink) {
      Linking.openURL(tip.sourceLink);
    }
  };

  const generateQuizData = (tip) => {
    // Generate quiz based on tip content
    const quizzes = {
      t1: {
        question: "What percentage of all plastic ever made has been recycled?",
        options: ["9%", "25%", "45%", "60%"],
        correctAnswer: 0,
      },
      t2: {
        question:
          "By how much can switching to a plant-based diet reduce your food carbon footprint?",
        options: ["30%", "50%", "73%", "90%"],
        correctAnswer: 2,
      },
      t3: {
        question:
          "What percentage of global carbon emissions does the fashion industry produce?",
        options: ["5%", "10%", "15%", "20%"],
        correctAnswer: 1,
      },
      t4: {
        question:
          "What percentage of global carbon emissions does the internet produce?",
        options: ["1.5%", "2.8%", "3.7%", "5.2%"],
        correctAnswer: 2,
      },
      t5: {
        question: "How much water does a running tap use per minute?",
        options: ["3 liters", "6 liters", "9 liters", "12 liters"],
        correctAnswer: 1,
      },
      t6: {
        question: "What is the main advantage of native plants?",
        options: [
          "They're cheaper",
          "They require less water and pesticides",
          "They grow faster",
          "They're more colorful",
        ],
        correctAnswer: 1,
      },
      t7: {
        question:
          "What percentage of greenhouse gas emissions does transportation account for in the US?",
        options: ["15%", "20%", "25%", "30%"],
        correctAnswer: 3,
      },
      t8: {
        question: "What fraction of all food produced globally is wasted?",
        options: ["One-quarter", "One-third", "One-half", "Two-thirds"],
        correctAnswer: 1,
      },
    };

    return (
      quizzes[tip.id] || {
        question: `What is the main topic of this ${tip.category} tip?`,
        options: [
          `${tip.category} conservation`,
          "General recycling",
          "Water usage",
          "Energy efficiency",
        ],
        correctAnswer: 0,
      }
    );
  };

  const handleQuizAnswer = (answerIndex) => {
    if (quizCompleted) return;

    setSelectedAnswer(answerIndex);
    const quiz = generateQuizData(tip);
    const correct = answerIndex === quiz.correctAnswer;
    setIsCorrect(correct);
    setQuizCompleted(true);

    // Show result after a short delay
    setTimeout(() => {
      Alert.alert(
        correct ? "Correct! 🎉" : "Incorrect 😔",
        correct
          ? "Great job! You've understood the key point of this tip."
          : `The correct answer was: ${quiz.options[quiz.correctAnswer]}`,
        [{ text: "OK" }]
      );
    }, 500);
  };

  const resetQuiz = () => {
    setSelectedAnswer(null);
    setQuizCompleted(false);
    setIsCorrect(null);
    setShowQuiz(false);
  };

  const getCategoryColor = () => {
    switch (tip.category) {
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
        <TouchableOpacity onPress={handleBookmark} style={styles.headerButton}>
          {isBookmarked ? (
            <BookmarkCheck size={24} color={colors.warning} />
          ) : (
            <Bookmark size={24} color={colors.text} />
          )}
        </TouchableOpacity>

        {user?.id === tip?.userId ? (
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
          title: "Eco Tip",
          headerTitleStyle: styles.headerTitle,
          headerRight: renderHeaderRight,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Media Section */}
        {tip.resourceType === "video" && tip.videoLink ? (
          renderVideoPlayer()
        ) : tip.imageUrl ? (
          <Image
            source={{ uri: tip.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          // Show a category-themed placeholder for tips without images
          <View
            style={[
              styles.placeholderContainer,
              { backgroundColor: getCategoryColor() },
            ]}
          >
            <Text style={styles.placeholderTitle}>{tip.title}</Text>
            <Text style={styles.placeholderCategory}>
              {tip.category.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.content}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: getCategoryColor() },
            ]}
          >
            <Text style={styles.categoryText}>
              {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
            </Text>
          </View>

          <Text style={styles.title}>{tip.title}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colors.textSecondary} />
              <Text style={styles.metaText}>2 min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{tip.resourceType || "Tip"}</Text>
            </View>
          </View>

          <Text style={styles.tipContent}>{tip.content}</Text>

          {tip.userId && author && (
            <View style={styles.authorContainer}>
              <Image
                source={{
                  uri:
                    author.avatar ||
                    require("@/assets/images/default-avatar.png"),
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {author.name || "Anonymous"}
                </Text>
                <Text style={styles.authorSubtext}>Author</Text>
              </View>
            </View>
          )}

          {tip.source && (
            <TouchableOpacity
              style={styles.sourceContainer}
              onPress={handleSourceClick}
              disabled={!tip.sourceLink}
            >
              <Text style={styles.sourceLabel}>Source:</Text>
              <View style={styles.sourceContent}>
                <Text
                  style={[
                    styles.sourceText,
                    tip.sourceLink && styles.clickableSource,
                  ]}
                >
                  {tip.source}
                </Text>
                {tip.sourceLink && (
                  <ExternalLink size={16} color={colors.primary} />
                )}
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.quizContainer}>
            <Text style={styles.quizTitle}>Test Your Knowledge</Text>
            <Text style={styles.quizDescription}>
              Did you understand the key points from this eco-tip?
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
                {(() => {
                  const quiz = generateQuizData(tip);
                  return (
                    <>
                      <Text style={styles.quizQuestion}>{quiz.question}</Text>

                      <View style={styles.optionsContainer}>
                        {quiz.options.map((option, index) => (
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
                            ]}
                            onPress={() => handleQuizAnswer(index)}
                            disabled={quizCompleted}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                selectedAnswer === index &&
                                  quizCompleted &&
                                  styles.selectedOptionText,
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      {quizCompleted && (
                        <TouchableOpacity
                          style={styles.resetQuizButton}
                          onPress={resetQuiz}
                        >
                          <Text style={styles.resetQuizButtonText}>
                            Try Again
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  );
                })()}
              </View>
            )}
          </View>

          <View style={styles.relatedTipsContainer}>
            <Text style={styles.relatedTipsTitle}>Related Tips</Text>

            {relatedTips.map((relatedTip) => (
              <TouchableOpacity
                key={relatedTip.id}
                style={styles.relatedTipItem}
                onPress={() => router.push(`/eco-tip-detail/${relatedTip.id}`)}
              >
                <Text style={styles.relatedTipTitle}>{relatedTip.title}</Text>
                <Text style={styles.relatedTipContent} numberOfLines={2}>
                  {relatedTip.content}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
                router.push(`/edit-eco-tip/${id}`);
              }}
            >
              <Pencil size={20} color={colors.text} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleDeleteTip();
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
  tipContent: {
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
});
