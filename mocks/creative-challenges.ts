import { Challenge } from '@/types';

const creativeChallenges: Challenge[] = [
  {
    id: 'cc1',
    title: 'Climate Change Poster Contest',
    description: 'Design a compelling poster that raises awareness about climate change. Be creative and impactful! The top voted posters will earn special rewards and campus-wide recognition.',
    category: 'creative',
    points: 250,
    difficulty: 'medium',
    duration: 14,
    steps: [
      'Research climate change facts and impacts',
      'Brainstorm visual concepts that communicate your message',
      'Create your poster using any medium (digital or physical)',
      'Take a high-quality photo of your work',
      'Submit your poster with a brief description'
    ],
    impact: 'Raises awareness about climate issues among the campus community through visual storytelling',
    imageUrl: 'https://images.unsplash.com/photo-1594711539893-a8f6d2087c89',
    completedBy: 42,
    isCollaborative: false,
    isCreativeChallenge: true,
    submissionType: 'poster',
    votingEnabled: true,
    submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    votingDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString() // 21 days from now
  },
  {
    id: 'cc2',
    title: 'Sustainable Campus Photo Essay',
    description: 'Create a photo essay that highlights sustainable practices or areas for improvement on campus. Document existing initiatives or propose new ones through your lens.',
    category: 'creative',
    points: 200,
    difficulty: 'easy',
    duration: 10,
    steps: [
      'Explore campus with a critical eye for sustainability',
      'Take photos of sustainable practices or improvement opportunities',
      'Organize your photos into a cohesive narrative',
      'Write captions explaining each image',
      'Submit your photo essay'
    ],
    impact: 'Documents and promotes sustainable practices while identifying areas for improvement',
    imageUrl: 'https://images.unsplash.com/photo-1542435503-956c469947f6',
    completedBy: 28,
    isCollaborative: false,
    isCreativeChallenge: true,
    submissionType: 'photo',
    votingEnabled: true,
    submissionDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    votingDeadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cc3',
    title: 'Climate Solutions Infographic',
    description: 'Design an informative and visually appealing infographic that explains a specific climate solution or technology. Make complex information accessible and engaging!',
    category: 'creative',
    points: 220,
    difficulty: 'medium',
    duration: 7,
    steps: [
      'Choose a specific climate solution or technology to focus on',
      'Research key facts, statistics, and information',
      'Organize information in a logical flow',
      'Create your infographic using digital tools',
      'Submit with a brief explanation of your design choices'
    ],
    impact: 'Educates the campus community about specific climate solutions in an accessible format',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    completedBy: 19,
    isCollaborative: false,
    isCreativeChallenge: true,
    submissionType: 'poster',
    votingEnabled: true,
    submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    votingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'cc4',
    title: 'Climate Action Mural Project',
    description: 'Collaborate with fellow students to design and create a climate-themed mural or art installation on campus. This is a team challenge that requires approval from campus administration.',
    category: 'creative',
    points: 500,
    difficulty: 'hard',
    duration: 30,
    steps: [
      'Form a team of 3-5 students',
      'Develop a concept and create a proposal',
      'Submit proposal to campus administration for approval',
      'Gather sustainable materials',
      'Create the mural or installation',
      'Document the process and final result'
    ],
    impact: 'Creates a lasting visual reminder of climate action on campus that can inspire thousands of students',
    imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625',
    completedBy: 7,
    isCollaborative: true,
    maxParticipants: 5,
    isCreativeChallenge: true,
    submissionType: 'photo',
    votingEnabled: true,
    submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    votingDeadline: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const newChallenge = {
  id: 'cc5', // Use a static ID or generate dynamically elsewhere
  title: 'New Challenge',
  description: 'Description for the new challenge.',
  category: 'creative',
  points: 100,
  difficulty: 'easy',
  duration: 7,
  steps: ['Step 1', 'Step 2'],
  impact: 'Positive impact description.',
  imageUrl: 'https://example.com/image.jpg',
  completedBy: 0,
  isCollaborative: false,
  isCreativeChallenge: true,
  submissionType: 'photo',
  votingEnabled: true,
  submissionDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  votingDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
};

creativeChallenges.push(newChallenge);

export default creativeChallenges;