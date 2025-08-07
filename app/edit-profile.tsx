import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useUserStore } from "@/store/user-store";
import Button from "@/components/Button";
import { ArrowLeft, Camera, Image as ImageIcon } from "lucide-react-native";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { apiClient } from "@/lib/api/client";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, accessToken } = useUserStore();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  
  // Fetch current profile data and sync avatar
  useEffect(() => {
    const fetchCurrentProfile = async () => {
      if (!accessToken) return;
      
      try {
        const response = await apiClient.get('/auth/profile', accessToken);
        if (response.success && response.data?.user) {
          const profileUser = response.data.user;
          console.log('Edit Profile - fetched profileImage:', profileUser.profileImage);
          console.log('Edit Profile - current user avatar:', user?.avatar);
          
          // Update avatar state with the most recent profile image
          if (profileUser.profileImage) {
            setAvatar(profileUser.profileImage);
          }
        }
      } catch (error) {
        console.error('Error fetching current profile:', error);
      }
    };
    
    fetchCurrentProfile();
  }, [accessToken]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permission required",
        "Please grant camera and photo library permissions to change your avatar.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleChoosePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0].uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select photo");
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    try {
      // First compress the image
      const manipulatedImage = await manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );

      const formData = new FormData();
      const filename = `avatar_${user?.id}_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: manipulatedImage.uri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`https://eqapi.juany.kr/upload/file/system`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      console.log("Upload response:", result);

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

      // Ensure URL is absolute
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      let profileImageUrl = user?.avatar || "";

      // If a new image was selected (local URI), upload it first
      if (avatar && avatar !== user?.avatar && (avatar.startsWith('file://') || avatar.startsWith('content://'))) {
        try {
          setUploadProgress(10);
          profileImageUrl = await uploadImage(avatar);
          setUploadProgress(70);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          Alert.alert("Error", "Failed to upload profile image. Please try again.");
          return;
        }
      } else if (avatar) {
        // If it's already a URL (not changed), use it
        profileImageUrl = avatar;
      }

      setUploadProgress(80);

      const profileData = {
        name: name.trim(),
        email: email.trim(),
        profileImage: profileImageUrl,
      };

      const apiResponse = await apiClient.updateProfile(
        profileData,
        accessToken || undefined
      );

      if (apiResponse.success) {
        await updateProfile({
          name,
          email,
          avatar: profileImageUrl,
        });

        setUploadProgress(100);
        
        Alert.alert("Success", "Profile updated successfully", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", apiResponse.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const defaultAvatar = require("@/assets/images/logo.png");
  
  // Handle avatar display properly
  const getAvatarSource = () => {
    if (avatar) {
      // If it's a local file (starts with file:// or content://) or a URL
      return { uri: avatar };
    } else if (user?.avatar) {
      // If user has an avatar URL
      return { uri: user.avatar };
    } else {
      // Default avatar
      return defaultAvatar;
    }
  };
  
  const avatarSource = getAvatarSource();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Edit Profile",
          headerTitleStyle: styles.headerTitle,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Image source={avatarSource} style={styles.avatar} />

          <View style={styles.avatarButtons}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handleTakePhoto}
            >
              <Camera size={20} color={colors.white} />
              <Text style={styles.avatarButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarButton}
              onPress={handleChoosePhoto}
            >
              <ImageIcon size={20} color={colors.white} />
              <Text style={styles.avatarButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.uploadProgressContainer}>
            <Text style={styles.uploadProgressText}>
              Uploading image: {Math.round(uploadProgress)}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          </View>
        )}

        {/* Save Button */}
        <Button
          title={isLoading ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={isLoading}
          style={styles.saveButton}
        />

        {isLoading && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.heading2,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  avatarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 140,
    justifyContent: "center",
  },
  avatarButtonText: {
    color: colors.white,
    marginLeft: 8,
    fontWeight: "600",
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  saveButton: {
    marginTop: 8,
  },
  loadingIndicator: {
    marginTop: 16,
  },
  uploadProgressContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
  },
  uploadProgressText: {
    ...typography.bodySmall,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});
