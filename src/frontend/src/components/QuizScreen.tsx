import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, RotateCcw, Trophy, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Question } from "../backend.d";
import { useAnswerQuestion, useGetAllQuestions } from "../hooks/useQueries";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  DIFFICULTY_REWARD,
  SAMPLE_QUESTIONS,
  formatRupees,
} from "../utils/gameUtils";

const QUESTION_TIME = 30;

interface QuizScreenProps {
  playerName: string;
  onBack: () => void;
}

type AnswerState = "idle" | "correct" | "wrong" | "timeout";

interface GameSummary {
  totalQuestions: number;
  correctAnswers: number;
  totalEarned: number;
}

export function QuizScreen({ playerName, onBack }: QuizScreenProps) {
  const { data: fetchedQuestions, isLoading } = useGetAllQuestions();
  const answerMutation = useAnswerQuestion();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [showResult, setShowResult] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [floatingCoins, setFloatingCoins] = useState<
    { id: number; x: number }[]
  >([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const coinIdRef = useRef(0);

  // Use fetched questions or fall back to samples
  useEffect(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0) {
      const shuffled = [...fetchedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    } else if (!isLoading) {
      setQuestions(SAMPLE_QUESTIONS as Question[]);
    }
  }, [fetchedQuestions, isLoading]);

  const currentQuestion = questions[currentIndex];

  const handleTimeout = useCallback(() => {
    if (answerState !== "idle") return;
    setAnswerState("timeout");
    setShowResult(true);
    clearInterval(timerRef.current!);
    timerRef.current = null;
  }, [answerState]);

  // Timer
  useEffect(() => {
    if (!currentQuestion || showResult) return;

    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, handleTimeout, showResult]);

  const handleAnswer = async (answerIdx: number) => {
    if (answerState !== "idle" || !currentQuestion) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setSelectedAnswer(answerIdx);
    setShowResult(true);

    const isCorrect = BigInt(answerIdx) === currentQuestion.correctAnswerIndex;
    setAnswerState(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      const reward = DIFFICULTY_REWARD[currentQuestion.difficulty];
      setEarnedAmount(reward);
      setSessionEarnings((prev) => prev + reward);
      setSessionCorrect((prev) => prev + 1);

      // Floating coins animation
      const newCoins = Array.from({ length: 5 }, () => ({
        id: coinIdRef.current++,
        x: 20 + Math.random() * 60,
      }));
      setFloatingCoins(newCoins);
      setTimeout(() => setFloatingCoins([]), 1500);
    } else {
      setEarnedAmount(0);
    }

    // Submit to backend
    try {
      await answerMutation.mutateAsync({
        name: playerName,
        questionId: currentQuestion.id,
        answerIndex: BigInt(answerIdx),
      });
    } catch {
      // Optimistic - already showed result
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setSummary({
        totalQuestions: questions.length,
        correctAnswers: sessionCorrect,
        totalEarned: sessionEarnings,
      });
      setGameOver(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setAnswerState("idle");
    setShowResult(false);
    setEarnedAmount(0);
  };

  const handleRestart = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerState("idle");
    setShowResult(false);
    setEarnedAmount(0);
    setSessionEarnings(0);
    setSessionCorrect(0);
    setGameOver(false);
    setSummary(null);
  };

  if (isLoading) {
    return (
      <div className="festive-bg min-h-screen p-4">
        <div className="max-w-sm mx-auto pt-8 flex flex-col gap-4">
          <Skeleton className="w-full h-8 bg-muted rounded-xl" />
          <Skeleton className="w-full h-48 bg-muted rounded-2xl" />
          {["o1", "o2", "o3", "o4"].map((k) => (
            <Skeleton key={k} className="w-full h-14 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (gameOver && summary) {
    return (
      <div className="festive-bg min-h-screen flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
        >
          <div className="game-card rounded-2xl p-8 flex flex-col items-center gap-6 border border-gold/30">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <Trophy className="w-16 h-16 text-gold gold-glow" />
            </motion.div>

            <div className="text-center">
              <h2 className="font-display text-3xl font-black text-foreground">
                Game Over!
              </h2>
              <p className="text-muted-foreground mt-1">
                Great effort, {playerName}!
              </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-3 text-center">
              <div className="bg-gold/10 rounded-xl p-3">
                <p className="text-2xl font-bold font-display rupee-shimmer">
                  {formatRupees(summary.totalEarned)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Earned</p>
              </div>
              <div className="bg-saffron/10 rounded-xl p-3">
                <p className="text-2xl font-bold font-display text-saffron">
                  {summary.correctAnswers}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Correct</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-2xl font-bold font-display text-foreground">
                  {summary.totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={handleRestart}
                className="w-full h-12 bg-saffron hover:bg-saffron/90 text-navy font-bold saffron-glow"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full h-12 border-border text-foreground hover:bg-muted"
              >
                Back to Home
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="festive-bg min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / Math.max(questions.length, 1)) * 100;
  const timerProgress = (timeLeft / QUESTION_TIME) * 100;
  const isTimerCritical = timeLeft <= 10;

  const getOptionClass = (idx: number) => {
    if (answerState === "idle")
      return "answer-option game-card border border-border rounded-xl px-4 py-4 text-left w-full";

    const isSelected = selectedAnswer === idx;
    const isCorrect = BigInt(idx) === currentQuestion.correctAnswerIndex;

    if (isCorrect)
      return "game-card border rounded-xl px-4 py-4 text-left w-full correct-glow";
    if (isSelected && !isCorrect)
      return "game-card border rounded-xl px-4 py-4 text-left w-full wrong-glow";
    return "game-card border border-border rounded-xl px-4 py-4 text-left w-full opacity-50";
  };

  const ANSWER_LETTERS = ["A", "B", "C", "D"];

  return (
    <div className="festive-bg min-h-screen pb-8">
      {/* Floating coins */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <AnimatePresence>
          {floatingCoins.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute text-2xl"
              style={{ left: `${coin.x}%`, bottom: "40%" }}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -80 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              💰
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div
        className="sticky top-0 z-10 backdrop-blur-lg border-b border-border/50 px-4 py-3"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.12 0.04 264 / 0.9), transparent)",
        }}
      >
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>
                Question {currentIndex + 1}/{questions.length}
              </span>
              <span className="text-gold font-semibold">
                Session: {formatRupees(sessionEarnings)}
              </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-saffron rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 pt-4 flex flex-col gap-4">
        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${
                isTimerCritical ? "bg-wrong" : "bg-correct"
              }`}
              animate={{ width: `${timerProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div
            className={`flex items-center gap-1.5 text-sm font-bold min-w-[50px] ${
              isTimerCritical ? "timer-critical" : "text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            {timeLeft}s
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="game-card rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  CATEGORY_COLOR[currentQuestion.category]
                }`}
              >
                {CATEGORY_LABEL[currentQuestion.category]}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  DIFFICULTY_COLOR[currentQuestion.difficulty]
                }`}
              >
                {DIFFICULTY_LABEL[currentQuestion.difficulty]}
              </span>
              <div className="ml-auto flex items-center gap-1 text-gold font-bold text-sm">
                <Zap className="w-3.5 h-3.5" />
                {formatRupees(DIFFICULTY_REWARD[currentQuestion.difficulty])}
              </div>
            </div>

            <p className="text-foreground font-semibold text-lg leading-snug">
              {currentQuestion.questionText}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Answer options */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`options-${currentIndex}`}
            className="flex flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {currentQuestion.options.map((option, idx) => (
              <motion.button
                key={option}
                className={getOptionClass(idx)}
                onClick={() => handleAnswer(idx)}
                disabled={answerState !== "idle"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                      answerState === "idle"
                        ? "bg-saffron/10 text-saffron"
                        : BigInt(idx) === currentQuestion.correctAnswerIndex
                          ? "bg-correct/20 text-correct"
                          : selectedAnswer === idx
                            ? "bg-wrong/20 text-wrong"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {ANSWER_LETTERS[idx]}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1 text-left">
                    {option}
                  </span>
                  {answerState !== "idle" && (
                    <span className="text-lg">
                      {BigInt(idx) === currentQuestion.correctAnswerIndex
                        ? "✓"
                        : selectedAnswer === idx
                          ? "✗"
                          : ""}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Result message */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              className={`rounded-xl p-4 flex items-center justify-between ${
                answerState === "correct"
                  ? "bg-correct/15 border border-correct/40"
                  : "bg-wrong/15 border border-wrong/40"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div>
                <p
                  className={`font-bold text-base ${
                    answerState === "correct" ? "text-correct" : "text-wrong"
                  }`}
                >
                  {answerState === "correct"
                    ? "🎉 Correct!"
                    : answerState === "timeout"
                      ? "⏰ Time's up!"
                      : "❌ Wrong!"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {answerState === "correct"
                    ? "Brilliant answer!"
                    : "Better luck next time!"}
                </p>
              </div>
              {answerState === "correct" && earnedAmount > 0 && (
                <motion.span
                  className="text-xl font-black text-gold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  +{formatRupees(earnedAmount)}
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleNext}
                className="w-full h-12 bg-saffron hover:bg-saffron/90 text-navy font-bold saffron-glow"
              >
                {currentIndex + 1 >= questions.length
                  ? "See Results →"
                  : "Next Question →"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
