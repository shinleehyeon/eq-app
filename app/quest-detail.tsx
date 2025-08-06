import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import {
  ArrowLeft,
  Clock,
  Coins,
  Users,
  Camera,
  MapPin,
  Leaf,
  CheckCircle,
  Share2,
  ImageIcon,
  Upload,
  AlertCircle,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/Button";
import { useUserStore } from "@/store/user-store";
import { apiClient } from "@/lib/api/client";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface QuestData {
  uuid: string;
  title: string;
  description: string;
  status: string;
  targetValue: number;
  currentValue: number;
  rewardMarathonPoints: number;
  rewardExperience: number;
  startDate: string;
  endDate: string;
  completedAt?: string;
  mainImageUrl?: string;
  completionImageUrl?: string;
  successImageUrl?: string;
  requiredObject: string;
  difficulty: string;
  category: string;
  environmentalImpact: string;
  expectedTime: string;
  userId: string;
  marathonEventId?: string;
  createdAt: string;
  updatedAt: string;
  isSelected?: boolean;
  questType?: string;
  subType?: string;
}

interface QuestAttempt {
  uuid: string;
  questId: string;
  userId: string;
  imageUrl: string;
  status: string;
  confidence: number;
  attemptedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuestDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const questId = params.id as string;

  const { user, accessToken } = useUserStore();

  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [questAttempts, setQuestAttempts] = useState<QuestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selecting, setSelecting] = useState(false);

  // Proof submission modal states
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isCompleted = questData?.status === "completed";
  const isActive = questData?.isSelected === true;
  const canAttempt =
    questData?.status === "pending" || questData?.status === "in_progress";

  // 자동 완료되는 퀘스트 타입들
  const isAutoCompleteQuest =
    questData?.questType === "learning_article" ||
    questData?.questType === "learning_video" ||
    questData?.questType === "community";

  // Complete Quest 버튼을 표시할지 결정
  const shouldShowCompleteButton =
    !isCompleted && !isAutoCompleteQuest && canAttempt;

  useEffect(() => {
    if (accessToken && questId) {
      fetchQuestData();
      fetchQuestAttempts();
    }
  }, [accessToken, questId]);

  const fetchQuestData = async () => {
    if (!accessToken || !questId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/quests/${questId}`, accessToken);

      if (
        response.success &&
        response.data &&
        typeof response.data === "object" &&
        "quest" in response.data
      ) {
        setQuestData(response.data.quest as QuestData);
      } else {
        Alert.alert("Error", "Failed to fetch quest data");
      }
    } catch (error) {
      console.error("Error fetching quest data:", error);
      Alert.alert("Error", "Failed to fetch quest data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestAttempts = async () => {
    if (!accessToken || !questId) return;

    try {
      const response = await apiClient.get(
        `/quests/${questId}/my-attempts`,
        accessToken
      );

      if (
        response.success &&
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        setQuestAttempts((response.data.data as QuestAttempt[]) || []);
      }
    } catch (error) {
      console.error("Error fetching quest attempts:", error);
    }
  };

  const handleSelectQuest = async () => {
    if (!accessToken || !questId) {
      Alert.alert("Authentication Required", "Please log in to select quests.");
      return;
    }

    setSelecting(true);

    try {
      if (isActive) {
        // Deselect quest
        const response = await apiClient.post(
          `/quests/${questId}/deselect`,
          {},
          accessToken
        );

        if (response.success) {
          setQuestData((prev) =>
            prev ? { ...prev, isSelected: false } : null
          );
          Alert.alert("Success", "Quest removed from your active quests.");
        } else {
          Alert.alert("Error", response.error || "Failed to deselect quest");
        }
      } else {
        // Select quest
        const response = await apiClient.post(
          `/quests/${questId}/select`,
          {},
          accessToken
        );

        if (response.success) {
          setQuestData((prev) => (prev ? { ...prev, isSelected: true } : null));
          Alert.alert("Success", "Quest added to your active quests!");
        } else {
          Alert.alert("Error", response.error || "Failed to select quest");
        }
      }
    } catch (error) {
      console.error("Error selecting/deselecting quest:", error);
      Alert.alert(
        "Error",
        "Failed to update quest selection. Please try again."
      );
    } finally {
      setSelecting(false);
    }
  };

  const handleCompleteQuest = () => {
    setShowProofModal(true);
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "image.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      // Upload image to backend
      const response = await fetch(`https://eqapi.juany.kr/upload/file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Don't set Content-Type for FormData in React Native
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Upload response:", result);

      // 백엔드 응답 구조에 따라 URL 추출
      let imageUrl = "";
      if (result.url && typeof result.url === "string") {
        imageUrl = result.url;
      } else if (result.url && result.url.url) {
        imageUrl = result.url.url;
      } else if (result.data && result.data.url) {
        imageUrl = result.data.url;
      } else {
        throw new Error("No URL in upload response");
      }

      // URL이 상대 경로인 경우 절대 URL로 변환
      if (imageUrl.startsWith("/")) {
        imageUrl = `https://eqapi.juany.kr${imageUrl}`;
      } else if (!imageUrl.startsWith("http")) {
        imageUrl = `https://eqapi.juany.kr/${imageUrl}`;
      }

      console.log("Final image URL:", imageUrl);
      return imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const submitQuestAttempt = async () => {
    if (!accessToken || !questId || !selectedImage) {
      Alert.alert("Error", "Please select an image to submit");
      return;
    }

    setSubmitting(true);
    setUploadingImage(true);

    try {
      // Upload image first
      const imageUrl = await uploadImage(selectedImage);
      setUploadingImage(false);

      // Submit quest attempt
      const response = await apiClient.post(
        `/quests/${questId}/attempt`,
        {
          imageUrl: imageUrl,
        },
        accessToken
      );

      if (response.success) {
        const validationResult =
          response.data &&
          typeof response.data === "object" &&
          "validationResult" in response.data
            ? (response.data.validationResult as {
                success: boolean;
                confidence: number;
                message: string;
              })
            : { success: false, confidence: 0, message: "Validation failed" };

        if (validationResult.success) {
          Alert.alert(
            "Success! 🎉",
            `Quest completed successfully!\nConfidence: ${(
              validationResult.confidence * 100
            ).toFixed(1)}%\n${validationResult.message}`
          );
        } else {
          Alert.alert(
            "Validation Failed",
            `The image doesn't match the required object.\n\nPlease try again with a another image.`
          );
        }

        // Refresh quest data and attempts
        await fetchQuestData();
        await fetchQuestAttempts();

        setShowProofModal(false);
        setSelectedImage(null);
      } else {
        Alert.alert(
          "Error",
          response.error || "Failed to submit quest attempt"
        );
      }
    } catch (error) {
      console.error("Error submitting quest attempt:", error);
      Alert.alert("Error", "Failed to submit quest attempt. Please try again.");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Camera and photo library permissions are required to upload images.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Select Image", "Choose how you want to add a photo", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return colors.success;
      case "in_progress":
        return colors.warning;
      case "failed":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quest...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!questData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={colors.error} />
          <Text style={styles.errorText}>Quest not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "",
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {questData.mainImageUrl ? (
            <Image
              source={{ uri: questData.mainImageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderImage]}>
              <Leaf size={60} color={colors.white} />
            </View>
          )}
          <View style={styles.heroOverlay} />

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(questData.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(questData.status)}
            </Text>
          </View>
        </View>

        {/* Quest Badges */}
        <View style={styles.badgeContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{questData.category}</Text>
          </View>

          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(questData.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>{questData.difficulty}</Text>
          </View>
        </View>

        {/* Quest Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{questData.title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Coins size={16} color={colors.warning} />
              <Text style={styles.statText}>
                {questData.rewardMarathonPoints} points
              </Text>
            </View>

            <View style={styles.statItem}>
              <Clock size={16} color={colors.info} />
              <Text style={styles.statText}>
                {questData.expectedTime || "30 min"}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Users size={16} color={colors.primary} />
              <Text style={styles.statText}>
                {questData.currentValue}/{questData.targetValue}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(
                      100,
                      (questData.currentValue / questData.targetValue) * 100
                    )}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {questData.currentValue} of {questData.targetValue} completed
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>About this Quest</Text>
            <Text style={styles.description}>{questData.description}</Text>
          </View>

          {/* Required Object - Only show for non-auto-complete quests */}
          {!isAutoCompleteQuest && (
            <View style={styles.requirementContainer}>
              <Text style={styles.sectionTitle}>Required Object</Text>
              <View style={styles.requirementItem}>
                <Leaf size={16} color={colors.primary} />
                <Text style={styles.requirementText}>
                  Detect: {questData.requiredObject}
                </Text>
              </View>
            </View>
          )}

          {/* Impact */}
          {questData.environmentalImpact && (
            <View style={styles.impactContainer}>
              <Text style={styles.sectionTitle}>🌍 Environmental Impact</Text>
              <Text style={styles.impactText}>
                {questData.environmentalImpact}
              </Text>
            </View>
          )}

          {/* Quest Attempts */}
          {questAttempts.length > 0 && (
            <View style={styles.attemptsContainer}>
              <Text style={styles.sectionTitle}>Your Attempts</Text>
              {questAttempts.map((attempt, index) => (
                <View key={attempt.uuid} style={styles.attemptItem}>
                  <View style={styles.attemptHeader}>
                    <Text style={styles.attemptDate}>
                      {new Date(attempt.attemptedAt).toLocaleDateString()}
                    </Text>
                    <View
                      style={[
                        styles.attemptStatus,
                        { backgroundColor: getStatusColor(attempt.status) },
                      ]}
                    >
                      <Text style={styles.attemptStatusText}>
                        {getStatusText(attempt.status)}
                      </Text>
                    </View>
                  </View>
                  {attempt.confidence && (
                    <Text style={styles.confidenceText}>
                      Confidence: {(attempt.confidence * 100).toFixed(1)}%
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Completion Rewards */}
          {isCompleted && questData.completedAt && (
            <View style={styles.rewardsContainer}>
              <Text style={styles.sectionTitle}>🎉 Quest Completed!</Text>
              <View style={styles.rewardItem}>
                <Coins size={16} color={colors.warning} />
                <Text style={styles.rewardText}>
                  +{questData.rewardMarathonPoints} Marathon Points
                </Text>
              </View>
              <View style={styles.rewardItem}>
                <Users size={16} color={colors.primary} />
                <Text style={styles.rewardText}>
                  +{questData.rewardExperience} Experience Points
                </Text>
              </View>
              <Text style={styles.completionDate}>
                Completed on{" "}
                {new Date(questData.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.completedText}>Quest Completed!</Text>
          </View>
        ) : !isActive ? (
          <Button
            title={selecting ? "Selecting..." : "Select Quest"}
            onPress={handleSelectQuest}
            style={styles.singleButton}
            disabled={selecting}
          />
        ) : (
          <View style={styles.buttonRow}>
            {shouldShowCompleteButton && (
              <Button
                title="Complete Quest"
                onPress={handleCompleteQuest}
                style={styles.completeButton}
                disabled={!canAttempt}
              />
            )}
          </View>
        )}
      </View>

      {/* Proof Submission Modal */}
      <Modal
        visible={showProofModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowProofModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Quest Proof</Text>
              <TouchableOpacity onPress={() => setShowProofModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              Take a photo showing how you completed this quest. Make sure the
              required object ({questData.requiredObject}) is clearly visible in
              your image. The AI will automatically validate your submission.
            </Text>

            {selectedImage && (
              <View style={styles.selectedImageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.removeImageText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.photoButtonsContainer}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Camera size={20} color={colors.primary} />
                <Text style={styles.photoButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.photoButton}
                onPress={pickFromGallery}
              >
                <ImageIcon size={20} color={colors.primary} />
                <Text style={styles.photoButtonText}>From Gallery</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={
                uploadingImage
                  ? "Uploading..."
                  : submitting
                  ? "Submitting..."
                  : "Submit Proof"
              }
              onPress={submitQuestAttempt}
              style={styles.submitButton}
              disabled={!selectedImage || submitting || uploadingImage}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return colors.success;
    case "medium":
      return colors.warning;
    case "hard":
      return colors.error;
    default:
      return colors.info;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginTop: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroContainer: {
    position: "relative",
    height: screenHeight * 0.3,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  statusBadge: {
    position: "absolute" as const,
    top: 20,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    ...typography.heading1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 12,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  requirementContainer: {
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requirementText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  impactContainer: {
    backgroundColor: colors.success + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  impactText: {
    ...typography.body,
    color: colors.text,
  },
  attemptsContainer: {
    marginBottom: 24,
  },
  attemptItem: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  attemptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  attemptDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  attemptStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attemptStatusText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: "bold",
  },
  confidenceText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actionContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: 16,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.success + "20",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    ...typography.heading2,
  },
  cancelText: {
    ...typography.body,
    color: colors.primary,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  photoButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  photoButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: "600",
  },
  selectedImageContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: colors.error,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  submitButton: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  singleButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    marginBottom: 16,
  },
  selectButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
  },
  removeButton: {
    backgroundColor: colors.error,
  },
  rewardsContainer: {
    backgroundColor: colors.success + "20",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  rewardText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },
  completionDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 12,
    fontStyle: "italic",
  },
});
