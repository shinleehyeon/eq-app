import { CreativeSubmission } from '@/types';

const creativeSubmissions: CreativeSubmission[] = [
  {
    id: 'cs1',
    challengeId: 'cc1',
    userId: 'user456',
    userName: 'Maya Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    title: 'Our Melting Future',
    description: "My poster visualizes the impact of climate change on polar ice caps. The melting ice reveals the text 'Act Now' to emphasize the urgency of climate action.",
    imageUrl: 'https://images.unsplash.com/photo-1578926375605-eaf7559b1458',
    submissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 42,
    comments: [
      {
        id: 'cmt1',
        userId: 'user123',
        userName: 'Alex Green',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        content: "This is so powerful! I love how you've used the melting ice as a visual metaphor.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'cmt2',
        userId: 'user789',
        userName: 'Jamal Wilson',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        content: "The colors really make this stand out. Great work!",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cs2',
    challengeId: 'cc1',
    userId: 'user789',
    userName: 'Jamal Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    title: 'The Last Straw',
    description: "My poster highlights the impact of single-use plastics on marine life. It shows a sea turtle surrounded by plastic straws with the tagline 'The Last Straw: Choose Reusable'.",
    imageUrl: 'https://images.unsplash.com/photo-1618477202872-5b9142d44ff1',
    submissionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 38,
    comments: [
      {
        id: 'cmt3',
        userId: 'user123',
        userName: 'Alex Green',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        content: "This really hits home. I'm going to carry my reusable straw everywhere now!",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cs3',
    challengeId: 'cc1',
    userId: 'user101',
    userName: 'Sophia Chen',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    title: 'Climate Clock',
    description: "My poster features a clock made of endangered species, with the hands pointing to 11:59, symbolizing that time is running out for many species due to climate change.",
    imageUrl: 'https://images.unsplash.com/photo-1576766125535-b04e15fd0273',
    submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 29,
    comments: [
      {
        id: 'cmt4',
        userId: 'user456',
        userName: 'Maya Johnson',
        userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
        content: "This is so creative! The clock metaphor works perfectly.",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'cmt5',
        userId: 'user789',
        userName: 'Jamal Wilson',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        content: "I love the detail in each animal illustration. Really well done!",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cs4',
    challengeId: 'cc2',
    userId: 'user202',
    userName: 'Liam Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    title: 'Hidden Sustainability',
    description: "My photo essay reveals the lesser-known sustainable features of our campus, from rainwater collection systems to native plant gardens that most students walk by without noticing.",
    imageUrl: 'https://images.unsplash.com/photo-1518723185408-3e76b03f4e3f',
    submissionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 22,
    comments: [
      {
        id: 'cmt6',
        userId: 'user123',
        userName: 'Alex Green',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        content: "I had no idea we had these features on campus! Thanks for highlighting them.",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'cs5',
    challengeId: 'cc3',
    userId: 'user303',
    userName: 'Emma Taylor',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
    title: 'Solar Power Simplified',
    description: "My infographic breaks down how solar panels work and their environmental benefits compared to fossil fuels. I included installation costs and long-term savings to show the economic benefits too.",
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
    submissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 31,
    comments: [
      {
        id: 'cmt7',
        userId: 'user101',
        userName: 'Sophia Chen',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
        content: "This makes solar power so much easier to understand! I'm going to share this with my parents.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

export default creativeSubmissions;