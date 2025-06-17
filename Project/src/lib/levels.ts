import type { Level } from './types';

export const LEVELS: Level[] = [
  {
    id: 'easy-addition',
    title: 'Easy Addition',
    description: 'Add small numbers together!',
    difficulty: 1,
    operators: ['+'],
    numberRange: [1, 10],
    problemCount: 10,
    rewardMessage: 'Great job with additions!',
    timePerQuestionSeconds: 20,
  },
  {
    id: 'simple-subtraction',
    title: 'Simple Subtraction',
    description: 'Subtract small numbers.',
    difficulty: 1,
    operators: ['-'],
    numberRange: [1, 10], // num1 will be >= num2
    problemCount: 10,
    rewardMessage: 'Subtraction superstar!',
    timePerQuestionSeconds: 20,
  },
  {
    id: 'mixed-easy',
    title: 'Mixed Easy Peasy',
    description: 'Addition and subtraction with small numbers.',
    difficulty: 2,
    operators: ['+', '-'],
    numberRange: [1, 20],
    problemCount: 12,
    rewardMessage: 'You mastered the mix!',
    timeLimitSeconds: 180, // 3 minutes
    timePerQuestionSeconds: 15,
  },
  {
    id: 'multiplication-basics',
    title: 'Multiplication Basics',
    description: 'Learn your times tables!',
    difficulty: 3,
    operators: ['*'],
    numberRange: [1, 10], // Operands for multiplication
    problemCount: 15,
    rewardMessage: 'Multiplication master!',
    timePerQuestionSeconds: 25,
  },
  {
    id: 'division-intro',
    title: 'Division Intro',
    description: 'Simple division problems.',
    difficulty: 3,
    operators: ['/'],
    numberRange: [1, 100], // num1 will be product, num2 will be a factor from 1-10
    problemCount: 15,
    rewardMessage: 'Division dynamo!',
    timePerQuestionSeconds: 30,
  },
  {
    id: 'brain-booster',
    title: 'Brain Booster',
    description: 'A mix of all operations with larger numbers.',
    difficulty: 4,
    operators: ['+', '-', '*', '/'],
    numberRange: [1, 50], // For +,-. For *, / numbers might be adjusted.
    problemCount: 20,
    rewardMessage: 'Your brain is super strong!',
    timeLimitSeconds: 300, // 5 minutes
    timePerQuestionSeconds: 20,
  },
  {
    id: 'speedy-sums',
    title: 'Speedy Sums Challenge',
    description: 'Quick! Solve these sums against the clock.',
    difficulty: 5,
    operators: ['+', '-'],
    numberRange: [10, 99],
    problemCount: 25, // More problems for a challenge
    timeLimitSeconds: 120, // 2 minutes - demanding
    timePerQuestionSeconds: 8, // Shorter time per question for speed challenge
    rewardMessage: 'Lightning fast calculations!',
    isSpeedChallenge: true, 
  },
];

export const getLevelById = (id: string): Level | undefined => {
  return LEVELS.find(level => level.id === id);
};
