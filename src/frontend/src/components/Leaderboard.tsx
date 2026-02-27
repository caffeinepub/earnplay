import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Crown, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { GameProfile } from "../backend.d";
import { useGetTopPlayers } from "../hooks/useQueries";
import { formatRupees } from "../utils/gameUtils";

interface LeaderboardProps {
  playerName: string;
  onBack: () => void;
}

const MOCK_PLAYERS: GameProfile[] = [
  {
    name: "RajKumar",
    questionsAnswered: 45n,
    correctAnswers: 38n,
    totalEarnings: 125000n,
  },
  {
    name: "PriyaSharma",
    questionsAnswered: 40n,
    correctAnswers: 32n,
    totalEarnings: 98000n,
  },
  {
    name: "ArjunPatel",
    questionsAnswered: 35n,
    correctAnswers: 28n,
    totalEarnings: 76000n,
  },
  {
    name: "SnehaGupta",
    questionsAnswered: 30n,
    correctAnswers: 24n,
    totalEarnings: 62000n,
  },
  {
    name: "VikramSingh",
    questionsAnswered: 28n,
    correctAnswers: 20n,
    totalEarnings: 54000n,
  },
  {
    name: "AnanyaMehta",
    questionsAnswered: 25n,
    correctAnswers: 18n,
    totalEarnings: 47000n,
  },
  {
    name: "RohanVerma",
    questionsAnswered: 22n,
    correctAnswers: 15n,
    totalEarnings: 38000n,
  },
];

const RANK_ICONS = [
  <Crown key="1" className="w-5 h-5 text-gold" />,
  <Medal key="2" className="w-5 h-5 text-[oklch(0.75_0.05_264)]" />,
  <Trophy key="3" className="w-5 h-5 text-saffron" />,
];

export function Leaderboard({ playerName, onBack }: LeaderboardProps) {
  const { data: fetchedPlayers, isLoading } = useGetTopPlayers();
  const players =
    fetchedPlayers && fetchedPlayers.length > 0 ? fetchedPlayers : MOCK_PLAYERS;

  const sortedPlayers = [...players].sort(
    (a, b) => Number(b.totalEarnings) - Number(a.totalEarnings),
  );

  const currentPlayerRank = sortedPlayers.findIndex(
    (p) => p.name.toLowerCase() === playerName.toLowerCase(),
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
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Leaderboard
            </h2>
            <p className="text-xs text-muted-foreground">Top earners</p>
          </div>
          <div className="ml-auto">
            <Crown className="w-6 h-6 text-gold gold-glow" />
          </div>
        </div>
      </motion.header>

      <div className="max-w-sm mx-auto px-4 pt-6 flex flex-col gap-4">
        {/* Top 3 podium */}
        {!isLoading && sortedPlayers.length >= 3 && (
          <motion.div
            className="flex items-end justify-center gap-4 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* 2nd place */}
            <PodiumCard
              player={sortedPlayers[1]}
              rank={2}
              currentPlayer={playerName}
              height="h-20"
            />
            {/* 1st place */}
            <PodiumCard
              player={sortedPlayers[0]}
              rank={1}
              currentPlayer={playerName}
              height="h-28"
            />
            {/* 3rd place */}
            <PodiumCard
              player={sortedPlayers[2]}
              rank={3}
              currentPlayer={playerName}
              height="h-16"
            />
          </motion.div>
        )}

        {/* Your rank banner (if in top 10) */}
        {currentPlayerRank >= 0 && (
          <motion.div
            className="rounded-xl p-3 border border-saffron/40 bg-saffron/10 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center">
              <span className="text-saffron font-bold text-sm">
                #{currentPlayerRank + 1}
              </span>
            </div>
            <p className="text-sm text-foreground">
              You're ranked{" "}
              <strong className="text-saffron">#{currentPlayerRank + 1}</strong>{" "}
              on the leaderboard!
            </p>
          </motion.div>
        )}

        {/* Full list */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            All Players
          </h3>
          {isLoading
            ? ["l1", "l2", "l3", "l4", "l5", "l6", "l7"].map((k) => (
                <div
                  key={k}
                  className="game-card rounded-xl p-4 flex items-center gap-3"
                >
                  <Skeleton className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 bg-muted mb-2" />
                    <Skeleton className="w-16 h-3 bg-muted" />
                  </div>
                  <Skeleton className="w-16 h-5 bg-muted" />
                </div>
              ))
            : sortedPlayers.map((player, idx) => {
                const isCurrentPlayer =
                  player.name.toLowerCase() === playerName.toLowerCase();
                return (
                  <motion.div
                    key={player.name}
                    className={`rounded-xl p-4 flex items-center gap-3 border transition-all ${
                      isCurrentPlayer
                        ? "border-saffron/50 bg-saffron/10"
                        : "game-card border-border"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + idx * 0.06 }}
                  >
                    {/* Rank */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
                      {idx < 3 ? (
                        RANK_ICONS[idx]
                      ) : (
                        <span
                          className={`font-bold text-sm ${
                            isCurrentPlayer
                              ? "text-saffron"
                              : "text-muted-foreground"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                        isCurrentPlayer
                          ? "bg-saffron text-navy"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {player.name[0]?.toUpperCase()}
                    </div>

                    {/* Name & stats */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold truncate ${
                          isCurrentPlayer ? "text-saffron" : "text-foreground"
                        }`}
                      >
                        {player.name}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs text-saffron/70">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(player.questionsAnswered)} questions
                      </p>
                    </div>

                    {/* Earnings */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-bold text-sm ${
                          idx === 0
                            ? "text-gold"
                            : isCurrentPlayer
                              ? "text-saffron"
                              : "text-foreground"
                        }`}
                      >
                        {formatRupees(player.totalEarnings)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({
  player,
  rank,
  currentPlayer,
  height,
}: {
  player: GameProfile;
  rank: 1 | 2 | 3;
  currentPlayer: string;
  height: string;
}) {
  const isCurrentPlayer =
    player.name.toLowerCase() === currentPlayer.toLowerCase();

  const bg = {
    1: "bg-gold/20 border-gold/40",
    2: "bg-muted/30 border-border",
    3: "bg-saffron/10 border-saffron/30",
  }[rank];

  const textColor = {
    1: "text-gold",
    2: "text-foreground",
    3: "text-saffron",
  }[rank];

  return (
    <div
      className={`flex flex-col items-center gap-2 flex-1 rounded-xl border p-3 ${bg} ${height} justify-end`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base ${
          isCurrentPlayer ? "bg-saffron text-navy" : "bg-muted text-foreground"
        }`}
      >
        {player.name[0]?.toUpperCase()}
      </div>
      <p
        className={`text-xs font-semibold truncate w-full text-center ${isCurrentPlayer ? "text-saffron" : "text-foreground"}`}
      >
        {player.name.length > 8 ? `${player.name.slice(0, 7)}…` : player.name}
      </p>
      <p className={`text-xs font-bold ${textColor}`}>
        {formatRupees(player.totalEarnings)}
      </p>
      <div className={`text-xs font-black ${textColor}`}>#{rank}</div>
    </div>
  );
}
