import { Challenge } from '@/types';

const challenges: Challenge[] = [
  {
    id: 'c1',
    title: 'Zero Waste Week',
    description: 'Challenge yourself to produce no landfill waste for a full week. Use reusable containers, buy package-free, and compost food scraps.',
    category: 'waste',
    points: 150,
    difficulty: 'medium',
    duration: 7,
    steps: [
      'Prepare by getting reusable containers and bags',
      'Plan meals to minimize packaging',
      'Track all waste produced',
      'Compost food scraps',
      'Refuse single-use items'
    ],
    requirements: [
      'Access to reusable containers and bags',
      'Ability to compost or access to composting facility',
      'Commitment to refuse single-use items for 7 days'
    ],
    tips: 'Start by auditing your current waste. Keep a "refuse" journal to track items you declined. Find local zero-waste stores or farmers markets for package-free shopping.',
    impact: 'Reduces landfill waste by approximately 2kg per person and saves up to 5kg of CO2 emissions',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b',
    completedBy: 342,
    participants: 28,
    isCollaborative: false
  },
  {
    id: 'c2',
    title: 'Plant-Based Days',
    description: 'Eat plant-based meals for 3 days to reduce your carbon footprint and explore delicious vegetarian options.',
    category: 'food',
    points: 100,
    difficulty: 'easy',
    duration: 3,
    steps: [
      'Research plant-based recipes',
      'Shop for ingredients',
      'Prepare and enjoy plant-based meals',
      'Share your favorite recipe with friends'
    ],
    requirements: [
      'Willingness to try new recipes',
      'Access to plant-based ingredients',
      'Basic cooking skills or access to plant-based restaurants'
    ],
    tips: 'Start with familiar dishes and make them plant-based. Try batch cooking on Sunday. Explore international cuisines that are naturally plant-based like Indian, Mediterranean, or Thai.',
    impact: 'Saves approximately 4kg of CO2 emissions per day compared to meat-based meals, conserves 4,000 liters of water',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    completedBy: 567,
    participants: 45,
    isCollaborative: false
  },
  {
    id: 'c3',
    title: 'Campus Climate Mural',
    description: 'Collaborate with fellow students to design and create a climate-themed mural or art installation on campus.',
    category: 'advocacy',
    points: 300,
    difficulty: 'hard',
    duration: 14,
    steps: [
      'Form a team of 3-5 students',
      'Develop a concept and get approval',
      'Gather sustainable materials',
      'Create the mural',
      'Host an unveiling event'
    ],
    impact: 'Raises awareness about climate issues among hundreds of campus visitors',
    imageUrl: 'https://images.unsplash.com/photo-1551913902-c92207136625',
    completedBy: 89,
    isCollaborative: true,
    maxParticipants: 5
  },
  {
    id: 'c4',
    title: 'Sustainable Transport Week',
    description: 'Use only sustainable transportation (walking, biking, public transit) for all your campus commutes for a week.',
    category: 'transport',
    points: 120,
    difficulty: 'medium',
    duration: 7,
    steps: [
      'Plan your routes in advance',
      'Prepare necessary gear (bike helmet, rain gear, etc.)',
      'Track your trips and carbon saved',
      'Share your experience with classmates'
    ],
    impact: 'Reduces carbon emissions by approximately 5kg per day compared to driving',
    imageUrl: 'https://images.unsplash.com/photo-1519583272095-6433daf26b6e',
    completedBy: 231,
    isCollaborative: false
  },
  {
    id: 'c5',
    title: 'Energy Audit Challenge',
    description: 'Conduct an energy audit of your dorm or apartment and implement changes to reduce energy consumption.',
    category: 'energy',
    points: 200,
    difficulty: 'medium',
    duration: 10,
    steps: [
      'Document current energy usage',
      'Identify energy waste sources',
      'Implement 3+ energy-saving measures',
      'Track reduction in energy use',
      'Create a report of your findings'
    ],
    impact: 'Can reduce energy consumption by 10-15% in a typical student residence',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e',
    completedBy: 156,
    isCollaborative: false
  },
  {
    id: 'c6',
    title: 'Campus Water Conservation',
    description: 'Implement water-saving practices and educate others about water conservation on campus.',
    category: 'water',
    points: 180,
    difficulty: 'medium',
    duration: 7,
    steps: [
      'Track your water usage for a day',
      'Implement 3+ water-saving techniques',
      'Create educational materials',
      'Share with at least 10 other students',
      'Report your estimated water savings'
    ],
    impact: 'Can save hundreds of gallons of water per week across campus',
    imageUrl: 'https://images.unsplash.com/photo-1527100673774-cce25eafaf7f',
    completedBy: 124,
    isCollaborative: false
  },
  {
    id: 'c7',
    title: 'Climate Education Workshop',
    description: 'Organize and host a workshop to educate fellow students about climate change and actionable solutions.',
    category: 'education',
    points: 250,
    difficulty: 'hard',
    duration: 14,
    steps: [
      'Research and prepare educational content',
      'Secure a venue and necessary materials',
      'Promote the workshop to students',
      'Host the workshop with at least 15 attendees',
      'Collect feedback and follow-up actions'
    ],
    impact: 'Directly educates 15+ students who can implement climate solutions',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655',
    completedBy: 78,
    isCollaborative: true,
    maxParticipants: 3
  },
  {
    id: 'c8',
    title: 'Digital Cleanup Day',
    description: 'Reduce your digital carbon footprint by cleaning up digital waste and implementing sustainable digital practices.',
    category: 'energy',
    points: 80,
    difficulty: 'easy',
    duration: 1,
    steps: [
      'Delete unnecessary emails and files',
      'Unsubscribe from unused newsletters',
      'Optimize cloud storage usage',
      'Adjust device settings for energy efficiency',
      'Track the space you freed up'
    ],
    impact: 'Reduces digital carbon footprint and improves device performance',
    imageUrl: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d',
    completedBy: 412,
    isCollaborative: false
  }
];

export default challenges;