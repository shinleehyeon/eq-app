// First, update the OpenQuest interface to include the author data
// This should be added in the relevant files (home.tsx, creative.tsx, quests.tsx, open-quests.tsx)

interface OpenQuest {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    createdAt: string;
    category: string;
    difficulty: string;
    isCreativeChallenge: boolean;
    points: number;
    userId: string; // ID of the author
  }