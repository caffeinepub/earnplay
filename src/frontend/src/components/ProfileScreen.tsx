import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  Percent,
  Star,
  Target,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useGetProfile } from "../hooks/useQueries";
import { calcAccuracy, formatRupees } from "../utils/gameUtils";

interface ProfileScreenProps {
  playerName: string;
  onBack: () => void;
}

function StatRow({
  icon,
  label,
  value,
  subValue,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="game-card rounded-xl p-4 flex items-center gap-4 border border-border"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay ?? 0 }}
    >
      <div className="w-10 h-10 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="font-bold text-lg text-foreground leading-tight">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

export function ProfileScreen({ playerName, onBack }: ProfileScreenProps) {
  const { data: profile, isLoading } = useGetProfile(playerName);

  const earnings = profile ? formatRupees(profile.totalEarnings) : "₹0";
  const answered = profile ? Number(profile.questionsAnswered) : 0;
  const correct = profile ? Number(profile.correctAnswers) : 0;
  const wrong = answered - correct;
  const accuracy = calcAccuracy(
    profile?.questionsAnswered ?? 0n,
    profile?.correctAnswers ?? 0n,
  );

  const getLevel = (answered: number) => {
    if (answered < 10) return { name: "Beginner", next: 10, emoji: "🌱" };
    if (answered < 25) return { name: "Amateur", next: 25, emoji: "⭐" };
    if (answered < 50) return { name: "Skilled", next: 50, emoji: "🌟" };
    if (answered < 100) return { name: "Expert", next: 100, emoji: "💎" };
    return { name: "Master", next: answered, emoji: "👑" };
  };

  const level = getLevel(answered);
  const levelProgress = Math.min((answered / level.next) * 100, 100);

  const initials = playerName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="festive-bg min-h-screen pb-8">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-10 backdrop-blur-lg border-b border-border/50 px-4 py-4"
        style={{
          background:
            "linear-gradient(to bottom, oklch(0.12 0.04 264 / 0.9), transparent)",
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <h2 className="font-display text-xl font-bold text-foreground">
            My Profile
          </h2>
        </div>
      </motion.header>

      <div className="max-w-sm mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Avatar + name card */}
        <motion.div
          className="game-card rounded-2xl p-6 border border-border flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-saffron to-gold flex items-center justify-center text-2xl font-black text-navy saffron-glow">
              {initials || playerName[0]?.toUpperCase()}
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 bg-gold/20 border border-gold/40 rounded-full px-2 py-0.5 text-xs text-gold font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {level.emoji} {level.name}
            </motion.div>
          </div>

          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {playerName}
            </h2>
            {isLoading ? (
              <Skeleton className="w-24 h-5 bg-muted mx-auto mt-1" />
            ) : (
              <p className="text-gold font-bold text-lg rupee-shimmer mt-1">
                {earnings}
              </p>
            )}
          </div>

          {/* Level progress */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Level: {level.name}</span>
              <span>
                {answered}/{level.next} questions
              </span>
            </div>
            <Progress value={levelProgress} className="h-2 bg-muted" />
          </div>
        </motion.div>

        {/* Stats */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Statistics
          </h3>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {["p1", "p2", "p3", "p4"].map((k) => (
                <div
                  key={k}
                  className="game-card rounded-xl p-4 flex items-center gap-4"
                >
                  <Skeleton className="w-10 h-10 rounded-xl bg-muted" />
                  <div>
                    <Skeleton className="w-24 h-3 bg-muted mb-2" />
                    <Skeleton className="w-16 h-5 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <StatRow
                icon={<Wallet className="w-5 h-5 text-gold" />}
                label="Total Earnings"
                value={earnings}
                delay={0.15}
              />
              <StatRow
                icon={<Target className="w-5 h-5 text-saffron" />}
                label="Questions Answered"
                value={answered.toString()}
                subValue={`${correct} correct, ${wrong} wrong`}
                delay={0.2}
              />
              <StatRow
                icon={<CheckCircle className="w-5 h-5 text-correct" />}
                label="Correct Answers"
                value={correct.toString()}
                delay={0.25}
              />
              <StatRow
                icon={<Percent className="w-5 h-5 text-secondary" />}
                label="Accuracy"
                value={`${accuracy}%`}
                subValue={
                  accuracy >= 80
                    ? "Excellent!"
                    : accuracy >= 60
                      ? "Good going!"
                      : "Keep practicing!"
                }
                delay={0.3}
              />
            </div>
          )}
        </div>

        {/* Achievement badges */}
        {!isLoading && (
          <motion.div
            className="game-card rounded-2xl p-5 border border-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  icon: "🎯",
                  label: "First Answer",
                  unlocked: answered >= 1,
                },
                {
                  icon: "🔥",
                  label: "10 Questions",
                  unlocked: answered >= 10,
                },
                {
                  icon: "💰",
                  label: "Earned ₹100",
                  unlocked: Number(profile?.totalEarnings ?? 0) >= 10000,
                },
                {
                  icon: "🎯",
                  label: "80% Accuracy",
                  unlocked: accuracy >= 80,
                },
                {
                  icon: "⭐",
                  label: "25 Questions",
                  unlocked: answered >= 25,
                },
                {
                  icon: "👑",
                  label: "Master Player",
                  unlocked: answered >= 100,
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                    badge.unlocked
                      ? "bg-saffron/10 border-saffron/30 text-saffron"
                      : "bg-muted/30 border-border text-muted-foreground opacity-50 grayscale"
                  }`}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                  {badge.unlocked && (
                    <Star className="w-3 h-3 text-gold fill-gold" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
