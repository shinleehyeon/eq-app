import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "@/lib/api/client";

interface MarathonLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userLevel: number;
  marathonPoints: number;
  completedQuests: number;
  progress: number;
  reachedMilestones: number;
  profileImage?: string;
}

interface LeaderboardState {
  marathonEntries: MarathonLeaderboardEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMarathonLeaderboard: (
    marathonId: string,
    token?: string
  ) => Promise<void>;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set) => ({
      marathonEntries: [],
      isLoading: false,
      error: null,

      fetchMarathonLeaderboard: async (marathonId: string, token?: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiClient.getMarathonLeaderboard(
            marathonId,
            token
          );

          if (response.success && response.data) {
            set({
              marathonEntries: response.data.data,
              isLoading: false,
            });
          } else {
            set({
              error: response.error || "Failed to fetch marathon leaderboard",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error fetching marathon leaderboard:", error);
          set({
            error: "Failed to fetch marathon leaderboard",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "leaderboard-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        marathonEntries: state.marathonEntries || [],
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.marathonEntries = state.marathonEntries || [];
          state.isLoading = false;
          state.error = null;
        }
      },
    }
  )
);
