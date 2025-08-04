import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreativeSubmission, SubmissionComment } from '@/types';
import mockCreativeSubmissions from '@/mocks/creative-submissions';

interface CreativeSubmissionInput {
  questId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface CommentInput {
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
}

interface CreativeSubmissionsState {
  submissions: CreativeSubmission[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  
  // Actions
  fetchSubmissions: () => Promise<void>;
  getSubmissionById: (id: string) => CreativeSubmission | null;
  addSubmission: (submission: CreativeSubmissionInput) => Promise<void>;
  addComment: (submissionId: string, comment: CommentInput) => Promise<void>;
  awardBadge: (submissionId: string) => Promise<void>;
  getFilteredSubmissions: () => CreativeSubmission[];
  setSearchQuery: (query: string) => void;
}

export const useCreativeSubmissionsStore = create<CreativeSubmissionsState>()(
  persist(
    (set, get) => ({
      submissions: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      
      fetchSubmissions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Use mock data from imported file
          const mockSubmissions = mockCreativeSubmissions.map(submission => ({
            ...submission,
            questId: submission.challengeId || submission.questId,
            badgeCount: submission.votes || submission.badgeCount || 0,
            challengeId: submission.challengeId,
            votes: submission.votes
          })) as CreativeSubmission[];
          
          set({ submissions: mockSubmissions, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to fetch submissions', isLoading: false });
        }
      },
      
      getSubmissionById: (id) => {
        const { submissions } = get();
        return submissions.find(submission => submission.id === id) || null;
      },
      
      addSubmission: async (submissionInput) => {
        set({ isLoading: true, error: null });
        
        try {
          // Create a new submission locally with mock data
          const newSubmission: CreativeSubmission = {
            id: `submission${Date.now()}`,
            ...submissionInput,
            submissionDate: new Date().toISOString(),
            badgeCount: 0,
            comments: [],
            userSettings: {} // Add required userSettings field
          };
          
          const { submissions } = get();
          set({ 
            submissions: [...submissions, newSubmission],
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to add submission', isLoading: false });
          throw error;
        }
      },
      
      addComment: async (submissionId, commentInput) => {
        set({ isLoading: true, error: null });
        
        try {
          const newComment: SubmissionComment = {
            id: `comment${Date.now()}`,
            ...commentInput,
            timestamp: new Date().toISOString()
          };
          
          const { submissions } = get();
          const updatedSubmissions = submissions.map(submission => {
            if (submission.id === submissionId) {
              return {
                ...submission,
                comments: [...(submission.comments || []), newComment]
              };
            }
            return submission;
          });
          
          set({ 
            submissions: updatedSubmissions,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to add comment', isLoading: false });
        }
      },
      
      awardBadge: async (submissionId) => {
        set({ isLoading: true, error: null });
        
        try {
          // In a real app, we would make an API call here
          // For demo purposes, we'll just update local state
          
          const { submissions } = get();
          const updatedSubmissions = submissions.map(submission => {
            if (submission.id === submissionId) {
              return {
                ...submission,
                badgeCount: submission.badgeCount + 1
              };
            }
            return submission;
          });
          
          set({ 
            submissions: updatedSubmissions,
            isLoading: false
          });
        } catch (error) {
          set({ error: 'Failed to award badge', isLoading: false });
        }
      },

      getFilteredSubmissions: () => {
        const { submissions, searchQuery } = get();
        if (!searchQuery) return submissions;
        return submissions.filter(submission => 
          submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      }
    }),
    {
      name: 'creative-submissions-storage',
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);