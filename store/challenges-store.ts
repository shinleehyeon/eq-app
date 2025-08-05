import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Quest, QuestCategory } from "@/types";

interface QuestsState {
  dailyQuests: Quest[];
  openQuests: Quest[];
  activeQuests: string[];
  completedQuests: string[];
  isLoading: boolean;
  error: string | null;
  filteredCategory: QuestCategory | "all";
  searchQuery: string;

  // Actions
  fetchDailyQuests: () => Promise<void>;
  fetchOpenQuests: () => Promise<void>;
  startQuest: (questId: string, completed?: boolean) => Promise<void>;
  abandonQuest: (questId: string) => void;
  createQuest: (quest: Omit<Quest, "id">) => Promise<string | undefined>;
  filterByCategory: (category: QuestCategory | "all") => void;
  setSearchQuery: (query: string) => void;
  getFilteredQuests: (questType: "daily" | "open") => Quest[];
  acceptQuest: (questId: string) => void;
  completeQuest: (questId: string, proof?: string) => void;
  selectQuest: (questId: string) => void;
  unselectQuest: (questId: string) => void;
}

export const useQuestsStore = create<QuestsState>()(
  persist(
    (set, get) => ({
      dailyQuests: [],
      openQuests: [],
      activeQuests: [],
      completedQuests: [],
      isLoading: false,
      error: null,
      filteredCategory: "all",
      searchQuery: "",

      fetchDailyQuests: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            "https://eqapi.juany.kr/quests?page=1&limit=10",
            {
              headers: {
                accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          // For now, show all quests as daily quests
          const dailyQuests = result.data || [];

          set({ dailyQuests, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch daily quests",
            isLoading: false,
          });
        }
      },

      fetchOpenQuests: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            "https://eqapi.juany.kr/quests?page=1&limit=50",
            {
              headers: {
                accept: "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          // For now, use empty array for open quests since we don't have questType
          const openQuests: Quest[] = [];

          set({ openQuests, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch open quests",
            isLoading: false,
          });
        }
      },

      startQuest: async (questId, completed = false) => {
        const { activeQuests, completedQuests, dailyQuests, openQuests } =
          get();
        if (activeQuests.includes(questId)) return;

        try {
          // Find quest in state data
          const quest = [...dailyQuests, ...openQuests].find(
            (q) => q.uuid === questId
          );
          if (!quest) {
            throw new Error("Quest not found");
          }
          set({
            activeQuests: [...activeQuests, questId],
            completedQuests: completed
              ? [...(completedQuests || []), questId]
              : completedQuests,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to start quest",
          });
        }
      },

      abandonQuest: (questId) => {
        set((state) => ({
          activeQuests: state.activeQuests.filter((id) => id !== questId),
        }));
      },

      createQuest: async (quest) => {
        try {
          // Create quest locally with mock data
          const newQuest = {
            ...quest,
            uuid: `quest_${Date.now()}`,
          };
          set((state) => ({
            openQuests: [...state.openQuests, newQuest as Quest],
          }));
          return newQuest.uuid;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create quest",
          });
        }
      },

      filterByCategory: (category) => {
        set({ filteredCategory: category });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      getFilteredQuests: (questType) => {
        const { dailyQuests, openQuests, filteredCategory, searchQuery } =
          get();
        const quests = questType === "daily" ? dailyQuests : openQuests;

        return quests.filter((quest) => {
          const categoryMatch =
            filteredCategory === "all" || quest.category === filteredCategory;
          const searchMatch =
            searchQuery === "" ||
            quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchQuery.toLowerCase());

          return categoryMatch && searchMatch;
        });
      },

      acceptQuest: (questId: string) => {
        const { activeQuests } = get();
        if (!activeQuests.includes(questId)) {
          set({ activeQuests: [...activeQuests, questId] });
        }
      },

      completeQuest: (questId: string, proof?: string) => {
        const { activeQuests, completedQuests } = get();
        set({
          activeQuests: activeQuests.filter((id) => id !== questId),
          completedQuests: [...completedQuests, questId],
        });
        // In a real app, you would also send the proof to the backend
        console.log("Quest completed with proof:", proof);
      },

      selectQuest: (questId: string) => {
        const { activeQuests } = get();
        if (!activeQuests.includes(questId) && activeQuests.length < 5) {
          set({ activeQuests: [...activeQuests, questId] });
        }
      },

      unselectQuest: (questId: string) => {
        const { activeQuests } = get();
        set({ activeQuests: activeQuests.filter((id) => id !== questId) });
      },
    }),
    {
      name: "eco-quest-quests-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
      }),
    }
  )
);
