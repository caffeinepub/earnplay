import { Category, Difficulty } from "../backend.d";

export const DIFFICULTY_REWARD: Record<Difficulty, number> = {
  [Difficulty.easy]: 1000, // ₹10.00
  [Difficulty.medium]: 2000, // ₹20.00
  [Difficulty.hard]: 5000, // ₹50.00
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  [Difficulty.easy]: "Easy",
  [Difficulty.medium]: "Medium",
  [Difficulty.hard]: "Hard",
};

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  [Difficulty.easy]: "text-correct border-correct/40 bg-correct/10",
  [Difficulty.medium]: "text-gold border-gold/40 bg-gold/10",
  [Difficulty.hard]: "text-wrong border-wrong/40 bg-wrong/10",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  [Category.bollywood]: "🎬 Bollywood",
  [Category.generalKnowledge]: "🧠 General Knowledge",
  [Category.sports]: "⚽ Sports",
  [Category.science]: "🔬 Science",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  [Category.bollywood]: "text-saffron border-saffron/40 bg-saffron/10",
  [Category.generalKnowledge]:
    "text-secondary border-secondary/40 bg-secondary/10",
  [Category.sports]: "text-correct border-correct/40 bg-correct/10",
  [Category.science]: "text-blue-300 border-blue-300/40 bg-blue-300/10",
};

export function formatRupees(paise: bigint | number): string {
  const amount = typeof paise === "bigint" ? Number(paise) : paise;
  const rupees = amount / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function formatReward(difficulty: Difficulty): string {
  const paise = DIFFICULTY_REWARD[difficulty];
  return formatRupees(paise);
}

export function calcAccuracy(answered: bigint, correct: bigint): number {
  const a = Number(answered);
  const c = Number(correct);
  if (a === 0) return 0;
  return Math.round((c / a) * 100);
}

export const SAMPLE_QUESTIONS = [
  {
    id: 1n,
    questionText: "Who directed the iconic Bollywood film 'Sholay' (1975)?",
    options: ["Yash Chopra", "Ramesh Sippy", "Manmohan Desai", "B.R. Chopra"],
    correctAnswerIndex: 1n,
    category: Category.bollywood,
    difficulty: Difficulty.medium,
  },
  {
    id: 2n,
    questionText: "Which cricketer is known as 'The God of Cricket' in India?",
    options: ["MS Dhoni", "Virat Kohli", "Sachin Tendulkar", "Sourav Ganguly"],
    correctAnswerIndex: 2n,
    category: Category.sports,
    difficulty: Difficulty.easy,
  },
  {
    id: 3n,
    questionText: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswerIndex: 2n,
    category: Category.science,
    difficulty: Difficulty.easy,
  },
  {
    id: 4n,
    questionText:
      "Which Indian state has the highest number of UNESCO World Heritage Sites?",
    options: ["Rajasthan", "Tamil Nadu", "Maharashtra", "Delhi"],
    correctAnswerIndex: 0n,
    category: Category.generalKnowledge,
    difficulty: Difficulty.hard,
  },
  {
    id: 5n,
    questionText:
      "In the movie 'Dilwale Dulhania Le Jayenge', what is the name of Kajol's character?",
    options: ["Pooja", "Simran", "Anjali", "Priya"],
    correctAnswerIndex: 1n,
    category: Category.bollywood,
    difficulty: Difficulty.easy,
  },
];
