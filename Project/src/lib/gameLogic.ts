import type { Level, Problem, MathOperator, OperationSymbol } from './types';

const getOperationSymbol = (operator: MathOperator): OperationSymbol => {
  switch (operator) {
    case '+': return '+';
    case '-': return '-';
    case '*': return '×';
    case '/': return '÷';
  }
};

export const generateProblem = (level: Level, dynamicDifficultyFactor: number = 1): Problem => {
  const operator = level.operators[Math.floor(Math.random() * level.operators.length)];
  const [minBase, maxBase] = level.numberRange;

  // Adjust number range based on dynamic difficulty for speed challenges
  const effectiveMin = Math.max(1, Math.floor(minBase * (level.isSpeedChallenge ? dynamicDifficultyFactor : 1)));
  const effectiveMax = Math.max(effectiveMin + 1, Math.floor(maxBase * (level.isSpeedChallenge ? dynamicDifficultyFactor : 1)));
  
  let num1: number, num2: number, answer: number;

  switch (operator) {
    case '+':
      num1 = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
      num2 = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
      num2 = Math.floor(Math.random() * (num1 - effectiveMin + 1)) + effectiveMin; // Ensure num2 <= num1
      if (num1 < num2) { // Ensure positive result for younger kids unless specified
         [num1, num2] = [num2, num1];
      }
      answer = num1 - num2;
      break;
    case '*':
      // For multiplication, often smaller numbers are better initially
      const multMax = Math.min(effectiveMax, level.difficulty < 3 ? 12 : 20); // Cap multiplication numbers
      const multMin = Math.min(effectiveMin, multMax -1);
      num1 = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
      num2 = Math.floor(Math.random() * (multMax - multMin + 1)) + multMin;
      answer = num1 * num2;
      break;
    case '/':
      // Ensure whole number division results
      const divMax = Math.min(effectiveMax, level.difficulty < 4 ? 10 : 15); // Divisor range
      const divMin = Math.min(effectiveMin, divMax -1);
      num2 = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin;
      if (num2 === 0) num2 = 1; // Avoid division by zero
      answer = Math.floor(Math.random() * (divMax - divMin + 1)) + divMin; // Result
      num1 = num2 * answer;
      // Ensure num1 is within a reasonable range as well if needed
      if (num1 > effectiveMax * 2) { // If product is too large, regenerate
          return generateProblem(level, dynamicDifficultyFactor);
      }
      break;
    default:
      throw new Error('Invalid operator');
  }

  const operationSymbol = getOperationSymbol(operator);
  const questionText = `${num1} ${operationSymbol} ${num2} = ?`;

  return {
    id: crypto.randomUUID(),
    num1,
    num2,
    operator,
    operationSymbol,
    answer,
    questionText,
  };
};

export const checkAnswer = (problemAnswer: number, userAnswer: number): boolean => {
  return problemAnswer === userAnswer;
};

export const generateProblemsForLevel = (level: Level): Problem[] => {
    const problems: Problem[] = [];
    for (let i = 0; i < level.problemCount; i++) {
        problems.push(generateProblem(level));
    }
    return problems;
};
