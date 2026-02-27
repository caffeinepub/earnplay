import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Question {
    id: bigint;
    difficulty: Difficulty;
    questionText: string;
    correctAnswerIndex: bigint;
    category: Category;
    options: Array<string>;
}
export interface GameProfile {
    questionsAnswered: bigint;
    name: string;
    correctAnswers: bigint;
    totalEarnings: bigint;
}
export enum Category {
    bollywood = "bollywood",
    generalKnowledge = "generalKnowledge",
    sports = "sports",
    science = "science"
}
export enum Difficulty {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export interface backendInterface {
    addQuestion(questionText: string, options: Array<string>, correctAnswerIndex: bigint, category: Category, difficulty: Difficulty): Promise<void>;
    answerQuestion(name: string, questionId: bigint, answerIndex: bigint): Promise<boolean>;
    getAllQuestions(): Promise<Array<Question>>;
    getProfile(name: string): Promise<GameProfile>;
    getTopPlayers(): Promise<Array<GameProfile>>;
    isUserAlreadyRegistered(userName: string): Promise<boolean>;
    register(name: string): Promise<void>;
}
