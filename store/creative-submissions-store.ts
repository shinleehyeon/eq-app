import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreativeSubmission, SubmissionComment } from '@/types';
import { uploadImageToFirebase } from '@/utils/firebase-helpers';

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
          // In a real app, we would fetch from an API
          // For demo purposes, we'll use mock data if no submissions exist yet
          const { submissions } = get();
          
          if (submissions.length === 0) {
            // Mock submissions data
            const mockSubmissions: CreativeSubmission[] = [
              {
                id: 'submission1',
                questId: 'creative1',
                userId: 'user2',
                userName: 'Alex Johnson',
                userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                title: 'Plastic Bottle Planter',
                description: "I created a vertical garden using recycled plastic bottles. It is perfect for growing herbs in small spaces!",
                imageUrl: 'https://images.unsplash.com/photo-1582954822174-ac0e4f4a1ff3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                badgeCount: 12,
                comments: [
                  {
                    id: 'comment1',
                    userId: 'user3',
                    userName: 'Maria Garcia',
                    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
                    content: "This is so creative! I am going to try making one for my balcony.",
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    id: 'comment2',
                    userId: 'user4',
                    userName: 'John Smith',
                    content: "Great way to reuse plastic bottles! What herbs are you growing?",
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                  }
                ]
              },
              {
                id: 'submission2',
                questId: 'creative1',
                userId: 'user5',
                userName: 'Emily Chen',
                userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                title: 'Cardboard Furniture',
                description: "I made a small side table entirely out of cardboard boxes. It is surprisingly sturdy and eco-friendly!",
                imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                submissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                badgeCount: 8,
                comments: []
              },
              {
                id: 'submission3',
                questId: 'creative2',
                userId: 'user6',
                userName: 'David Kim',
                title: 'Local Beach Cleanup Documentary',
                description: "I created a short documentary about the plastic pollution at our local beach and organized a community cleanup event.",
                imageUrl: 'https://images.unsplash.com/photo-1528132596460-787f8e4e9e9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
                submissionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                badgeCount: 15,
                comments: [
                  {
                    id: 'comment3',
                    userId: 'user7',
                    userName: 'Sarah Johnson',
                    content: "This is inspiring! When is the next cleanup event?",
                    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
                  }
                ]
              }
            ];
            
            set({ submissions: mockSubmissions });
          }
          
          set({ isLoading: false });
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
          // Upload image to Firebase with proper path
          const imagePath = `creative-submissions/${Date.now()}_${submissionInput.userId}.jpg`;
          const uploadedImageUrl = await uploadImageToFirebase(
            submissionInput.imageUrl,
            imagePath
          );

          // Create a new submission with required userSettings
          const newSubmission: CreativeSubmission = {
            id: `submission${Date.now()}`,
            ...submissionInput,
            imageUrl: uploadedImageUrl,
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