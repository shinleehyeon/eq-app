import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Badge, Plant } from '@/types';
import { fetchUserDataFromFirebase, updateUser } from '@/utils/firebase-helpers';

interface UserState {
  user: User | null;
  users: User[];
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<User['settings']>) => void;
  completeQuest: (questId: string, proofUrl?: string) => Promise<void>;
  addBadge: (badge: Badge) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  setUser: (userData: Partial<User>, accessToken?: string) => void;
  addPlant: (plant: Plant) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      accessToken: null,
      isLoading: false,
      error: null,
      
      initializeUser: async () => {
        try {
          const userId = 'mockUserId'; // Replace with actual logic to get the user ID
          const userData = await fetchUserDataFromFirebase(userId);
          if (userData) {
            set({ user: userData });
          } else {
            set({ error: 'Failed to fetch user data' });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          set({ error: errorMessage, isLoading: false });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyA_WQ52u74sNqG_PZzJg6LpTotp8V2i7hY',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Failed to login');
          }

          const data = await response.json();

          const user: User = {
            id: data.localId, // Store localId as user id
            name: data.displayName || '',
            email: data.email,
            avatar: data.avatar,
            level: 1, // Default level, update as needed
            streak: 0, // Default streak, update as needed
            completedQuests: [],
            badges: [],
            plants: [],
            followers: [],
            following: [],
            settings: {
              notifications: true,
              darkMode: false,
              language: 'en',
              privateProfile: false,
              hideEmail: false,
              hideAuthoredQuests: false,
            },
          };

          set({ user, isLoading: false });
        } catch (error) {
          set({
            error: (error instanceof Error ? error.message : 'Failed to login. Please try again.'),
            isLoading: false
          });
        }
      },
      
      logout: () => {
        set({ user: null, accessToken: null });
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would make an API call here
          // For demo purposes, we'll just simulate registration
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create a new user
          const newUser: User = {
            id: `user${Date.now()}`,
            name,
            email,
            avatar: '', // Default avatar value, replace with actual logic if needed
            level: 1,
            streak: 0,
            completedQuests: [],
            badges: [],
            plants: [],
            followers: [],
            following: [],
            settings: {
              notifications: true,
              darkMode: false,
              language: 'en',
              privateProfile: false,
              hideEmail: false,
              hideAuthoredQuests: false
            }
          };
          
          set({ user: newUser, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to register. Please try again.', isLoading: false });
        }
      },
      
      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;


        set({ user: { ...user, ...updates } });
      },
      
      updateSettings: (settings) => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { 
            ...user, 
            settings: { ...user.settings, ...settings } 
          } 
        });
      },
      
      completeQuest: async (questId, proofUrl) => {
        try {
          const { user } = get();
          if (!user) return;

          const updatedUser = {
            ...user,
            completedQuests: [...user.completedQuests, questId]
          };

          // Add proofUrl to Firebase if provided
          if (proofUrl) {
            // Store the proof URL in Firebase
            // This would be implemented in a real app
          }

          set({ user: updatedUser });
        } catch (error) {
          console.error('Error completing quest:', error);
          throw error;
        }
      },
      
      addBadge: (badge) => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { 
            ...user, 
            badges: [...user.badges, badge] 
          } 
        });
      },
      
      incrementStreak: () => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { 
            ...user, 
            streak: user.streak + 1 
          } 
        });
      },
      
      resetStreak: () => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { 
            ...user, 
            streak: 0 
          } 
        });
      },
      
      followUser: (userId) => {
        const { user } = get();
        if (!user) return;
        
        // Don't add if already following
        if (user.following.includes(userId)) return;
        
        // Update current user's following list
        const updatedUser = {
          ...user,
          following: [...user.following, userId]
        };
        
        // Update the followed user's followers list
        const { users } = get();
        const updatedUsers = users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              followers: [...(u.followers || []), user.id]
            };
          }
          return u;
        });
        
        set({ 
          user: updatedUser,
          users: updatedUsers
        });
      },
      
      unfollowUser: (userId) => {
        const { user } = get();
        if (!user) return;
        
        // Remove from following list
        const updatedUser = {
          ...user,
          following: user.following.filter(id => id !== userId)
        };
        
        // Update the unfollowed user's followers list
        const { users } = get();
        const updatedUsers = users.map(u => {
          if (u.id === userId) {
            return {
              ...u,
              followers: (u.followers || []).filter(id => id !== user.id)
            };
          }
          return u;
        });
        
        set({ 
          user: updatedUser,
          users: updatedUsers
        });
      },
      
      setUser: (userData: Partial<User>, accessToken?: string) => {
        const { user } = get();
        if (!user && userData.id && userData.email && userData.name) {
          // Create a new user with default values
          const newUser: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            avatar: userData.avatar || '',
            level: userData.level || 1,
            streak: userData.streak || 0,
            completedQuests: userData.completedQuests || [],
            badges: userData.badges || [],
            plants: userData.plants || [],
            followers: userData.followers || [],
            following: userData.following || [],
            settings: userData.settings || {
              notifications: true,
              darkMode: false,
              language: 'en',
              privateProfile: false,
              hideEmail: false,
              hideAuthoredQuests: false,
            },
          };
          set({ user: newUser, accessToken: accessToken || null });
        } else if (user) {
          // Update existing user
          const updates: Partial<UserState> = { user: { ...user, ...userData } };
          if (accessToken !== undefined) {
            updates.accessToken = accessToken;
          }
          set(updates);
        }
      },

      addPlant: (plant) => {
        const { user } = get();
        if (!user) return;

        const updatedUser = {
          ...user,
          plants: [...user.plants, plant]
        };

        set({ user: updatedUser });
      }
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);