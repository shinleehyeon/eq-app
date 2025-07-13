import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest, QuestCategory } from '@/types';
import { 
  getDailyQuests, 
  getOpenQuests, 
  getDailyQuest, 
  getOpenQuest, 
  createOpenQuest 
} from '@/utils/firebase-helpers';

interface QuestsState {
  dailyQuests: Quest[];
  openQuests: Quest[];
  activeQuests: string[];
  completedQuests: string[];
  isLoading: boolean;
  error: string | null;
  filteredCategory: QuestCategory | 'all';
  searchQuery: string;
  
  // Actions
  fetchDailyQuests: () => Promise<void>;
  fetchOpenQuests: () => Promise<void>;
  startQuest: (questId: string, completed?: boolean) => Promise<void>;
  abandonQuest: (questId: string) => void;
  createQuest: (quest: Omit<Quest, 'id'>) => Promise<string | undefined>;
  filterByCategory: (category: QuestCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  getFilteredQuests: (questType: 'daily' | 'open') => Quest[];
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
      filteredCategory: 'all',
      searchQuery: '',

      fetchDailyQuests: async () => {
        set({ isLoading: true, error: null });
        try {
          const dailyQuests = await getDailyQuests() as Quest[];
          const validQuests = dailyQuests.map(quest => ({
            ...quest,
            difficulty: quest.difficulty || 'medium',
            category: quest.category || 'other',
            completedBy: quest.completedBy || 0,
            steps: quest.steps || [],
            impact: quest.impact || 'Help make a positive environmental impact',
          }));
          set(state => ({ dailyQuests: validQuests, isLoading: false }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch daily quests', 
            isLoading: false 
          });
        }
      },

      fetchOpenQuests: async () => {
        set({ isLoading: true, error: null });
        try {
          const openQuests = await getOpenQuests() as Quest[];
          const validQuests = openQuests.map(quest => ({
            ...quest,
            difficulty: quest.difficulty || 'medium',
            category: quest.category || 'other',
            completedBy: quest.completedBy || 0,
            steps: quest.steps || [],
            impact: quest.impact || 'Help make a positive environmental impact',
          }));
          set(state => ({ openQuests: validQuests, isLoading: false }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch open quests', 
            isLoading: false 
          });
        }
      },

      startQuest: async (questId, completed = false) => {
        const { activeQuests, completedQuests } = get();
        if (activeQuests.includes(questId)) return;
        
        try {
          // Try both daily and open quests
          const quest = await getDailyQuest(questId) || await getOpenQuest(questId);
          if (!quest) {
            throw new Error('Quest not found');
          }
          set({
            activeQuests: [...activeQuests, questId],
            completedQuests: completed 
              ? [...(completedQuests || []), questId]
              : completedQuests
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to start quest' 
          });
        }
      },

      abandonQuest: (questId) => {
        set((state) => ({
          activeQuests: state.activeQuests.filter(id => id !== questId)
        }));
      },

      createQuest: async (quest) => {
        try {
          return await createOpenQuest(quest);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create quest' 
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
        const { dailyQuests, openQuests, filteredCategory, searchQuery } = get();
        const quests = questType === 'daily' ? dailyQuests : openQuests;
        
        return quests.filter(quest => {
          const categoryMatch = filteredCategory === 'all' || quest.category === filteredCategory;
          const searchMatch = searchQuery === '' || 
            quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quest.description.toLowerCase().includes(searchQuery.toLowerCase());
          
          return categoryMatch && searchMatch;
        });
      }
    }),
    {
      name: 'eco-quest-quests-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeQuests: state.activeQuests,
        completedQuests: state.completedQuests,
      })
    }
  )
);