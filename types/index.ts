export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    level: number;
    streak: number;
    coins: number;
    completedQuests: string[];
    badges: Badge[];
    plants: Plant[];
    followers: string[];
    following: string[];
    settings: {
      notifications: boolean;
      darkMode: boolean;
      language: string;
      privateProfile?: boolean;
      hideEmail?: boolean;
      hideAuthoredQuests?: boolean;
    };
  }
  
  export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    dateEarned: string;
  }
  
  export interface Plant {
    id: string;
    type: string;
    name: string;
    growthStage: number;
    health: number;
    plantedDate: string;
    questId: string;
    position: {
      x: number;
      y: number;
    };
  }
  
  export interface Quest {
    uuid: string;
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    targetValue: number;
    currentValue: number;
    rewardMarathonPoints: number;
    rewardExperience: number;
    startDate: string;
    endDate: string;
    completedAt: string | null;
    mainImageUrl?: string;
    completionImageUrl: string | null;
    successImageUrl: string | null;
    requiredObject: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
    environmentalImpact: string;
    expectedTime: string;
    userId: string;
    marathonEventId: string | null;
    isSelected?: boolean;
    questType?: string;
    requiredCount?: number | null;
    subType?: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      uuid: string;
      name: string;
      profileImage: string | null;
    };
    marathonEvent: any | null;
    
    // Legacy fields for compatibility
    id?: string;
    points?: number;
    duration?: number; // in days
    steps?: string[];
    imageUrl?: string;
    completionCriteria?: string;
    impact?: string;
    tips?: string[];
    relatedQuests?: string[];
    isCollaborative?: boolean;
    maxParticipants?: number;
    completedBy?: number;
    authorId?: string;
    submissionType?: string;
    submissionDeadline?: string;
  }
  
  export type QuestCategory = 'water' | 'waste' | 'energy' | 'food' | 'transport' | 'education' | 'advocacy' | 'creative' | 'other';
  
  export interface EcoTip {
    id: string;
    title: string;
    content: string;
    category: string;
    imageUrl: string;
    source: string;
    sourceLink: string;
    videoLink: string;
    resourceType: string;
    userId: string;
    isDeleted: string;
    datePublished: string;
    tags: string[];
  }
  
  export interface Reward {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    imageUrl: string;
    category: string;
    isAvailable: boolean;
    expiryDate?: string;
  }
  
  export interface LeaderboardEntry {
    position: number;
    userId: string;
    userName: string;
    userAvatar?: string;
    completedQuestsCount: number;
    level: number;
  }
  
  export interface CreativeChallenge {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    points: number;
    deadline: string;
    imageUrl: string;
    requirements: string[];
    submissionCount: number;
  }
  
  export interface CreativeSubmission {
    userSettings: {};
    id: string;
    challengeId?: string;
    questId?: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    title: string;
    description: string;
    imageUrl: string;
    submissionDate: string;
    badgeCount: number;
    comments?: SubmissionComment[];
  }
  
  export interface SubmissionComment {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    timestamp: string;
  }

  export interface Challenge {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    steps: string[];
    impact: string;
    imageUrl?: string;
    completedBy: number;
    isCollaborative?: boolean;
    maxParticipants?: number;
    authorId?: string;
    points?: number;
    submissionType?: string;
    submissionDeadline?: string;
    isCreativeChallenge?: boolean;
    votingEnabled?: boolean;
    votingDeadline?: string;
  }

  export interface Submission {
    id: string;
    challengeId: string;
    userId: string;
    imageUrl: string;
    submissionDate: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    proofUrl?: string;
  }