import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useRegister } from "../hooks/useQueries";

interface WelcomeScreenProps {
  onLogin: (name: string) => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const [name, setName] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { actor, isFetching: actorFetching } = useActor();
  const register = useRegister();

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      toast.error("Please enter a name (min 2 characters)");
      return;
    }
    if (trimmed.length > 20) {
      toast.error("Name too long (max 20 characters)");
      return;
    }

    if (!actor) {
      toast.error("Connecting to game server...");
      return;
    }

    setIsChecking(true);
    try {
      const alreadyRegistered = await actor.isUserAlreadyRegistered(trimmed);
      if (!alreadyRegistered) {
        await register.mutateAsync(trimmed);
        toast.success(`Welcome to EarnPlay, ${trimmed}! 🎉`);
      } else {
        toast.success(`Welcome back, ${trimmed}! 🎮`);
      }
      onLogin(trimmed);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const isLoading = isChecking || register.isPending || actorFetching;

  const decorativeStars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="festive-bg flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      {/* Decorative stars */}
      {decorativeStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute pointer-events-none"
          style={{ left: `${star.x}%`, top: `${star.y}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: star.delay,
          }}
        >
          <span className="text-gold" style={{ fontSize: star.size }}>
            ✦
          </span>
        </motion.div>
      ))}

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-saffron/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-sm flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "backOut" }}
        >
          <div className="relative">
            <img
              src="/assets/generated/earnplay-logo-transparent.dim_400x400.png"
              alt="EarnPlay"
              className="w-28 h-28 object-contain drop-shadow-lg"
            />
            <motion.div
              className="absolute -top-2 -right-2 bg-saffron rounded-full p-1.5 gold-glow"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <Sparkles className="w-3 h-3 text-navy" />
            </motion.div>
          </div>

          <div className="text-center">
            <h1 className="font-display text-5xl font-black tracking-tight rupee-shimmer">
              EarnPlay
            </h1>
            <motion.p
              className="text-foreground/80 mt-1 text-base font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Play Quiz. Earn Real Rewards!
            </motion.p>
          </div>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          className="flex gap-3 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {[
            { icon: "💰", label: "Earn ₹₹₹" },
            { icon: "🎯", label: "4 Categories" },
            { icon: "🏆", label: "Leaderboard" },
          ].map((badge) => (
            <span
              key={badge.label}
              className="flex items-center gap-1.5 bg-saffron/10 border border-saffron/30 rounded-full px-3 py-1 text-sm text-saffron font-medium"
            >
              <span>{badge.icon}</span>
              <span>{badge.label}</span>
            </span>
          ))}
        </motion.div>

        {/* Login form */}
        <motion.div
          className="w-full game-card rounded-2xl p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Enter your player name
            </p>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !isLoading && handleStart()
              }
              placeholder="e.g. RajKumar123"
              className="bg-navy border-border text-foreground placeholder:text-muted-foreground h-12 text-base focus:border-saffron focus:ring-saffron/30"
              maxLength={20}
              autoFocus
              autoComplete="username"
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={isLoading || !name.trim()}
            className="h-12 text-base font-bold bg-saffron hover:bg-saffron/90 text-navy border-0 saffron-glow transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-5 w-5" />
                Start Playing!
              </>
            )}
          </Button>
        </motion.div>

        {/* Reward preview */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-sm text-muted-foreground">
            Win up to <span className="text-gold font-bold text-base">₹50</span>{" "}
            per question!
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="text-correct">Easy: ₹10</span>
            <span className="text-gold">Medium: ₹20</span>
            <span className="text-wrong">Hard: ₹50</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
