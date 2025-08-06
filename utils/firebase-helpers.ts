// This file contains mock implementations of Firebase helper functions

import { database, auth } from '../config/firebase';
import { ref, set, get, push, update, remove, query, orderByChild, equalTo } from 'firebase/database';
import { storage } from '../config/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { User, Challenge, Submission, EcoTip, Plant, Reward } from '../types';

/**
 * Mock function to simulate uploading an image
 * @param uri Local URI of the image
 * @param path Storage path where the image should be stored
 * @returns Promise with the download URL
 */
export const uploadImage = async (uri: string, path: string): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Just return the original URI as if it was uploaded
    // In a real implementation, this would upload to Firebase and return a new URL
    return uri;
};

/**
 * Uploads an image to Firebase Storage
 * @param uri Local URI of the image
 * @param path Storage path where the image should be stored
 * @param onProgress Optional callback to track upload progress
 * @returns Promise with the download URL
 */
export const uploadImageToFirebase = async (
  uri: string, 
  path: string, 
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // First compress the image
    const manipulatedImage = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    // Convert URI to Blob
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    // Create a reference to Firebase Storage
    const imageRef = storageRef(storage, path);

    // Upload to Firebase Storage
    const uploadTask = uploadBytesResumable(imageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Formats a timestamp to a readable date string
 * @param timestamp Timestamp or ISO string
 * @param format Format options
 * @returns Formatted date string
 */
export const formatTimestamp = (
  timestamp: any, 
  format: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!timestamp) return '';
  
  let date: Date;
  
  if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString(undefined, format);
};

// User Operations
export const createUser = async (userId: string, userData: Partial<User>) => {
  return set(ref(database, `users/${userId}`), userData);
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  return update(ref(database, `users/${userId}`), updates);
};

export const getUser = async (userId: string) => {
  const snapshot = await get(ref(database, `users/${userId}`));
  return snapshot.val();
};

export const updateUserAvatar = async (userId: string, avatarUrl: string) => {
  try {
    // Update only the avatar field in the user's data
    await update(ref(database, `users/${userId}`), { avatar: avatarUrl });
    return true;
  } catch (error) {
    console.error('Error updating user avatar:', error);
    throw error;
  }
};

export const fetchUserDataFromFirebase = async (userId: string): Promise<User | null> => {
  try {
    // Check if user is authenticated before accessing Firebase
    if (!auth.currentUser) {
      console.warn('User not authenticated, cannot fetch user data from Firebase');
      return null;
    }
    
    const snapshot = await get(ref(database, `users/${userId}`));
    return snapshot.val();
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Handle permission denied errors specifically
    if (error instanceof Error && error.message.includes('Permission denied')) {
      console.warn('Permission denied accessing Firebase database. User may not be properly authenticated.');
    }
    
    return null;
  }
};

/**
 * Fetches user data from Firebase by ID
 * @param userId The ID of the user to fetch
 * @returns Promise with the user data or null
 */
export const fetchAuthorById = async (authorId: string) => {
  if (!authorId) return null;
  
  try {
    // Check if user is authenticated before accessing Firebase
    if (!auth.currentUser) {
      console.warn('User not authenticated, cannot fetch author data from Firebase');
      return null;
    }
    
    const snapshot = await get(ref(database, `users/${authorId}`));
    if (snapshot.exists()) {
      const userData = snapshot.val();
      return {
        id: authorId,
        name: userData.name,
        avatarUrl: userData.avatar
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching author data:', error);
    
    // Handle permission denied errors specifically
    if (error instanceof Error && error.message.includes('Permission denied')) {
      console.warn('Permission denied accessing Firebase database. User may not be properly authenticated.');
    }
    
    return null;
  }
};

// Follow Operations
export const followUser = async (userId: string, followingId: string) => {
  try {
    const followingRef = ref(database, `users/${userId}/following/${followingId}`);
    const followerRef = ref(database, `users/${followingId}/followers/${userId}`);
    
    await Promise.all([
      set(followingRef, true),
      set(followerRef, true)
    ]);
    
    return true;
  } catch (error) {
    console.error('Error following user:', error);
    return false;
  }
};

export const unfollowUser = async (userId: string, followingId: string) => {
  try {
    const followingRef = ref(database, `users/${userId}/following/${followingId}`);
    const followerRef = ref(database, `users/${followingId}/followers/${userId}`);
    
    await Promise.all([
      remove(followingRef),
      remove(followerRef)
    ]);
    
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return false;
  }
};

export const checkIfFollowing = async (userId: string, followingId: string) => {
  try {
    const followingRef = ref(database, `users/${userId}/following/${followingId}`);
    const snapshot = await get(followingRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking follow status:', error);
    return false;
  }
};

// Challenge Operations
export const createOpenQuest = async (challenge: Omit<Challenge, 'id'>) => {
  const newChallengeRef = push(ref(database, 'openQuests'));
  await set(newChallengeRef, { ...challenge, id: newChallengeRef.key });
  return newChallengeRef.key;
};

export const getDailyQuest = async (questId: string) => {
  const snapshot = await get(ref(database, `dailyQuests/${questId}`));
  return snapshot.val();
};

export const getOpenQuest = async (questId: string) => {
  const snapshot = await get(ref(database, `openQuests/${questId}`));
  return snapshot.val();
};

export const getDailyQuests = async () => {
  const snapshot = await get(ref(database, 'dailyQuests'));
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

export const getOpenQuests = async () => {
  const snapshot = await get(ref(database, 'openQuests'));
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

export const getUserOpenQuests = async (userId: string) => {
  const userQuestsRef = query(
    ref(database, 'openQuests'),
    orderByChild('authorId'),
    equalTo(userId)
  );
  const snapshot = await get(userQuestsRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

// Submission Operations
export const createSubmission = async (submission: Omit<Submission, 'id'>) => {
  const newSubmissionRef = push(ref(database, 'submissions'));
  await set(newSubmissionRef, { ...submission, id: newSubmissionRef.key });
  return newSubmissionRef.key;
};

export const getSubmission = async (submissionId: string) => {
  const snapshot = await get(ref(database, `submissions/${submissionId}`));
  return snapshot.val();
};

export const getSubmissionsByChallenge = async (challengeId: string) => {
  const submissionsRef = query(
    ref(database, 'submissions'),
    orderByChild('challengeId'),
    equalTo(challengeId)
  );
  const snapshot = await get(submissionsRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

// EcoTip Operations
export const createEcoTip = async (ecoTip: Omit<EcoTip, 'id'>) => {
  const newEcoTipRef = push(ref(database, 'ecoTips'));
  await set(newEcoTipRef, { ...ecoTip, id: newEcoTipRef.key });
  return newEcoTipRef.key;
};

export const getEcoTip = async (ecoTipId: string) => {
  const snapshot = await get(ref(database, `ecoTips/${ecoTipId}`));
  return snapshot.val();
};

export const getEcoTips = async () => {
  const snapshot = await get(ref(database, 'ecoTips'));
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

// Plant Operations
export const createPlant = async (plant: Omit<Plant, 'id'>) => {
  const newPlantRef = push(ref(database, 'plants'));
  await set(newPlantRef, { ...plant, id: newPlantRef.key });
  return newPlantRef.key;
};

export const getPlant = async (plantId: string) => {
  const snapshot = await get(ref(database, `plants/${plantId}`));
  return snapshot.val();
};

export const getUserPlants = async (userId: string) => {
  const plantsRef = query(
    ref(database, 'plants'),
    orderByChild('userId'),
    equalTo(userId)
  );
  const snapshot = await get(plantsRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};

// Reward Operations
export const createReward = async (reward: Omit<Reward, 'id'>) => {
  const newRewardRef = push(ref(database, 'rewards'));
  await set(newRewardRef, { ...reward, id: newRewardRef.key });
  return newRewardRef.key;
};

export const getReward = async (rewardId: string) => {
  const snapshot = await get(ref(database, `rewards/${rewardId}`));
  return snapshot.val();
};

export const getUserRewards = async (userId: string) => {
  const rewardsRef = query(
    ref(database, 'rewards'),
    orderByChild('userId'),
    equalTo(userId)
  );
  const snapshot = await get(rewardsRef);
  return snapshot.val() ? Object.values(snapshot.val()) : [];
};