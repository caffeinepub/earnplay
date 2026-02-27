import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Leaderboard } from "./components/Leaderboard";
import { ProfileScreen } from "./components/ProfileScreen";
import { QuizScreen } from "./components/QuizScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";

type Screen = "welcome" | "home" | "quiz" | "leaderboard" | "profile";

const PAGE_TRANSITIONS = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [playerName, setPlayerName] = useState<string>("");

  const handleLogin = (name: string) => {
    setPlayerName(name);
    setScreen("home");
  };

  const navigate = (target: Screen) => {
    setScreen(target);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <motion.div
            key="welcome"
            {...PAGE_TRANSITIONS}
            transition={{ duration: 0.3 }}
          >
            <WelcomeScreen onLogin={handleLogin} />
          </motion.div>
        )}

        {screen === "home" && (
          <motion.div
            key="home"
            {...PAGE_TRANSITIONS}
            transition={{ duration: 0.3 }}
          >
            <Dashboard
              playerName={playerName}
              onNavigate={(s) => navigate(s as Screen)}
            />
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div
            key="quiz"
            {...PAGE_TRANSITIONS}
            transition={{ duration: 0.3 }}
          >
            <QuizScreen
              playerName={playerName}
              onBack={() => navigate("home")}
            />
          </motion.div>
        )}

        {screen === "leaderboard" && (
          <motion.div
            key="leaderboard"
            {...PAGE_TRANSITIONS}
            transition={{ duration: 0.3 }}
          >
            <Leaderboard
              playerName={playerName}
              onBack={() => navigate("home")}
            />
          </motion.div>
        )}

        {screen === "profile" && (
          <motion.div
            key="profile"
            {...PAGE_TRANSITIONS}
            transition={{ duration: 0.3 }}
          >
            <ProfileScreen
              playerName={playerName}
              onBack={() => navigate("home")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.18 0.06 264)",
            border: "1px solid oklch(0.28 0.06 264)",
            color: "oklch(0.97 0.01 90)",
          },
        }}
      />

      {/* Footer - shown only on home/leaderboard/profile */}
      {screen !== "welcome" && screen !== "quiz" && (
        <footer className="text-center py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-saffron hover:text-gold transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      )}
    </div>
  );
}
