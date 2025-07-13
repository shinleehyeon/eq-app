import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LeaderboardEntry } from '@/types';

type TimeFrame = 'weekly' | 'monthly' | 'allTime';
type Scope = 'local' | 'global';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  timeframe: TimeFrame;
  scope: Scope;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLeaderboard: (timeframe: TimeFrame, scope: Scope) => Promise<void>;
  setTimeframe: (timeframe: TimeFrame) => void;
  setScope: (scope: Scope) => void;
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      entries: [],
      timeframe: 'weekly',
      scope: 'local',
      isLoading: false,
      error: null,
      
      fetchLeaderboard: async (timeframe, scope) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would fetch from an API with the timeframe and scope parameters
          // For demo purposes, we'll use mock data
          
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Generate different mock data based on timeframe and scope
          let mockEntries: LeaderboardEntry[] = [];
          
          if (scope === 'local') {
            // Local leaderboard (fewer entries)
            mockEntries = [
              {
                id: 'entry1',
                userId: 'user1',
                userName: 'Jane Smith',
                userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 12 : 25,
                completedQuestsCount: timeframe === 'weekly' ? 8 : timeframe === 'monthly' ? 18 : 42,
                streak: 5,
                position: 1,
                level: 8
              },
              {
                id: 'entry2',
                userId: 'user2',
                userName: 'Alex Johnson',
                userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 4 : timeframe === 'monthly' ? 10 : 22,
                completedQuestsCount: timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 15 : 38,
                streak: 3,
                position: 2,
                level: 7
              },
              {
                id: 'entry3',
                userId: 'user3',
                userName: 'Maria Garcia',
                userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 3 : timeframe === 'monthly' ? 9 : 20,
                completedQuestsCount: timeframe === 'weekly' ? 6 : timeframe === 'monthly' ? 14 : 35,
                streak: 4,
                position: 3,
                level: 6
              },
              {
                id: 'entry4',
                userId: 'user4',
                userName: 'John Smith',
                badgeCount: timeframe === 'weekly' ? 2 : timeframe === 'monthly' ? 7 : 18,
                completedQuestsCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 12 : 30,
                streak: 2,
                position: 4,
                level: 5
              },
              {
                id: 'entry5',
                userId: 'user5',
                userName: 'Emily Chen',
                userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                badgeCount: timeframe === 'weekly' ? 1 : timeframe === 'monthly' ? 5 : 15,
                completedQuestsCount: timeframe === 'weekly' ? 3 : timeframe === 'monthly' ? 10 : 25,
                streak: 1,
                position: 5,
                level: 4
              }
            ];
          } else {
            // Global leaderboard (more entries)
            mockEntries = [
              {
                id: 'entry1',
                userId: 'user10',
                userName: 'Sophia Rodriguez',
                userAvatar: 'https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 8 : timeframe === 'monthly' ? 20 : 45,
                completedQuestsCount: timeframe === 'weekly' ? 12 : timeframe === 'monthly' ? 25 : 60,
                streak: 10,
                position: 1,
                level: 10
              },
              {
                id: 'entry2',
                userId: 'user11',
                userName: 'Ethan Williams',
                userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 18 : 42,
                completedQuestsCount: timeframe === 'weekly' ? 11 : timeframe === 'monthly' ? 23 : 58,
                streak: 8,
                position: 2,
                level: 9
              },
              {
                id: 'entry3',
                userId: 'user12',
                userName: 'Olivia Brown',
                userAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 6 : timeframe === 'monthly' ? 16 : 40,
                completedQuestsCount: timeframe === 'weekly' ? 10 : timeframe === 'monthly' ? 22 : 55,
                streak: 7,
                position: 3,
                level: 9
              },
              {
                id: 'entry4',
                userId: 'user1',
                userName: 'Jane Smith',
                userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 12 : 25,
                completedQuestsCount: timeframe === 'weekly' ? 8 : timeframe === 'monthly' ? 18 : 42,
                streak: 5,
                position: 4,
                level: 8
              },
              {
                id: 'entry5',
                userId: 'user13',
                userName: 'Noah Martinez',
                badgeCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 14 : 38,
                completedQuestsCount: timeframe === 'weekly' ? 7 : timeframe === 'monthly' ? 17 : 40,
                streak: 6,
                position: 5,
                level: 7
              },
              {
                id: 'entry6',
                userId: 'user14',
                userName: 'Ava Johnson',
                userAvatar: 'https://images.unsplash.com/photo-1496440737103-cd596325d314?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 4 : timeframe === 'monthly' ? 13 : 35,
                completedQuestsCount: timeframe === 'weekly' ? 6 : timeframe === 'monthly' ? 16 : 38,
                streak: 4,
                position: 6,
                level: 7
              },
              {
                id: 'entry7',
                userId: 'user2',
                userName: 'Alex Johnson',
                userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 4 : timeframe === 'monthly' ? 10 : 22,
                completedQuestsCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 15 : 35,
                streak: 3,
                position: 7,
                level: 6
              },
              {
                id: 'entry8',
                userId: 'user15',
                userName: 'William Davis',
                badgeCount: timeframe === 'weekly' ? 3 : timeframe === 'monthly' ? 11 : 32,
                completedQuestsCount: timeframe === 'weekly' ? 5 : timeframe === 'monthly' ? 14 : 32,
                streak: 3,
                position: 8,
                level: 6
              },
              {
                id: 'entry9',
                userId: 'user3',
                userName: 'Maria Garcia',
                userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 3 : timeframe === 'monthly' ? 9 : 20,
                completedQuestsCount: timeframe === 'weekly' ? 4 : timeframe === 'monthly' ? 12 : 30,
                streak: 4,
                position: 9,
                level: 5
              },
              {
                id: 'entry10',
                userId: 'user16',
                userName: 'Isabella Taylor',
                userAvatar: 'https://images.unsplash.com/photo-1502323777036-f29e3972f5ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                badgeCount: timeframe === 'weekly' ? 2 : timeframe === 'monthly' ? 8 : 30,
                completedQuestsCount: timeframe === 'weekly' ? 3 : timeframe === 'monthly' ? 10 : 28,
                streak: 2,
                position: 10,
                level: 5
              }
            ];
          }
          
          // Sort by completed quests count (highest first)
          mockEntries.sort((a, b) => b.completedQuestsCount - a.completedQuestsCount);
          
          // Update positions based on the sort
          mockEntries = mockEntries.map((entry, index) => ({
            ...entry,
            position: index + 1
          }));
          
          set({ 
            entries: mockEntries,
            timeframe,
            scope,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to fetch leaderboard data', isLoading: false });
        }
      },
      
      setTimeframe: (timeframe) => {
        set({ timeframe });
        get().fetchLeaderboard(timeframe, get().scope);
      },
    
      setScope: (scope) => {
        set({ scope });
        get().fetchLeaderboard(get().timeframe, scope);
      }
    }),
    {
      name: 'leaderboard-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);