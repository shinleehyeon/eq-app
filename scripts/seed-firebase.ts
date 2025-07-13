import { database } from '../config/firebase';
import { ref, set } from 'firebase/database';
import challenges from '../mocks/challenges';
import creativeChallenges from '../mocks/creative-challenges';

async function seedDatabase() {
  try {
    // Create a batch update object
    const updates: { [key: string]: any } = {};

    // Split regular challenges into daily and open quests
    challenges.forEach((challenge, index) => {
      // First half go to daily quests, rest to open quests
      const path = index < challenges.length / 2 ? 'dailyQuests' : 'openQuests';
      updates[`${path}/${challenge.id}`] = challenge;
    });

    // Add creative challenges
    creativeChallenges.forEach(challenge => {
      updates[`openQuests/${challenge.id}`] = {
        ...challenge,
        isCreativeChallenge: true
      };
    });

    // Write all data in one batch
    await set(ref(database), updates);
    
    console.log('Successfully seeded Firebase with quests data!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();