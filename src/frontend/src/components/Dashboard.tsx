import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Gamepad2, Percent, Target, Trophy, User, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useGetProfile } from "../hooks/useQueries";
import { calcAccuracy, formatRupees } from "../utils/gameUtils";

type Screen = "home" | "quiz" | "leaderboard" | "profile";

interface DashboardProps {
  playerName: string;
  onNavigate: (screen: Screen) => void;
}

function StatCard({
  icon,
  label,
  value,
  highlight,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="game-card rounded-xl p-4 flex flex-col gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay ?? 0, duration: 0.4 }}
    >
      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <span
        className={`text-2xl font-bold font-display ${highlight ? "rupee-shimmer" : "text-foreground"}`}
      >
        {value}
      </span>
    </motion.div>
  );
}

const navItems = [
  {
    id: "quiz" as Screen,
    icon: Gamepad2,
    label: "Play Quiz",
    desc: "Start earning now",
    primary: true,
  },
  {
    id: "leaderboard" as Screen,
    icon: Trophy,
    label: "Leaderboard",
    desc: "Top players",
    primary: false,
  },
  {
    id: "profile" as Screen,
    icon: User,
    label: "My Profile",
    desc: "Stats & history",
    primary: false,
  },
];

export function Dashboard({ playerName, onNavigate }: DashboardProps) {
  const { data: profile, isLoading } = useGetProfile(playerName);

  const earnings = profile ? formatRupees(profile.totalEarnings) : "₹0";
  const answered = profile ? Number(profile.questionsAnswered) : 0;
  const correct = profile ? Number(profile.correctAnswers) : 0;
  const accuracy = calcAccuracy(
    profile?.questionsAnswered ?? 0n,
    profile?.correctAnswers ?? 0n,
  );

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
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <h2 className="font-display text-xl font-bold text-foreground">
              {playerName} 👋
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-3 py-1.5">
            <Wallet className="w-4 h-4 text-gold" />
            {isLoading ? (
              <Skeleton className="w-16 h-4 bg-muted" />
            ) : (
              <span className="text-gold font-bold text-sm">{earnings}</span>
            )}
          </div>
        </div>
      </motion.header>

      <div className="max-w-sm mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Stats grid */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {isLoading ? (
              <>
                {["s1", "s2", "s3", "s4"].map((k) => (
                  <div key={k} className="game-card rounded-xl p-4">
                    <Skeleton className="w-24 h-3 bg-muted mb-3" />
                    <Skeleton className="w-16 h-7 bg-muted" />
                  </div>
                ))}
              </>
            ) : (
              <>
                <StatCard
                  icon={<Wallet className="w-3.5 h-3.5 text-gold" />}
                  label="Total Earned"
                  value={earnings}
                  highlight
                  delay={0.1}
                />
                <StatCard
                  icon={<Target className="w-3.5 h-3.5 text-saffron" />}
                  label="Answered"
                  value={answered.toString()}
                  delay={0.15}
                />
                <StatCard
                  icon={<Gamepad2 className="w-3.5 h-3.5 text-correct" />}
                  label="Correct"
                  value={correct.toString()}
                  delay={0.2}
                />
                <StatCard
                  icon={<Percent className="w-3.5 h-3.5 text-secondary" />}
                  label="Accuracy"
                  value={`${accuracy}%`}
                  delay={0.25}
                />
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col gap-3">
          {navItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              {item.primary ? (
                <Button
                  onClick={() => onNavigate(item.id)}
                  className="w-full h-16 flex items-center justify-start gap-4 bg-saffron hover:bg-saffron/90 text-navy border-0 saffron-glow transition-all duration-200 hover:scale-[1.01] rounded-xl"
                >
                  <div className="bg-navy/20 rounded-lg p-2">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-base leading-none">
                      {item.label}
                    </p>
                    <p className="text-navy/70 text-xs mt-0.5">{item.desc}</p>
                  </div>
                  <span className="ml-auto text-navy/60">→</span>
                </Button>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="w-full h-16 game-card rounded-xl flex items-center gap-4 px-4 border border-border hover:border-saffron/40 transition-all duration-200 hover:bg-saffron/5 group"
                >
                  <div className="bg-saffron/10 rounded-lg p-2 group-hover:bg-saffron/20 transition-colors">
                    <item.icon className="w-5 h-5 text-saffron" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-base leading-none">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <span className="ml-auto text-muted-foreground group-hover:text-saffron transition-colors">
                    →
                  </span>
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Daily challenge hint */}
        <motion.div
          className="rounded-xl p-4 border border-gold/30 bg-gold/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-xs text-gold font-semibold uppercase tracking-wide mb-1">
            💡 Pro Tip
          </p>
          <p className="text-sm text-foreground/80">
            Answer Hard questions to earn{" "}
            <strong className="text-gold">₹50</strong> each! The more you play,
            the more you earn.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
