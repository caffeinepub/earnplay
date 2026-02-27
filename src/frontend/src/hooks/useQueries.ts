import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Difficulty, GameProfile, Question } from "../backend.d";
import { useActor } from "./useActor";

export function useIsRegistered(name: string) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isRegistered", name],
    queryFn: async () => {
      if (!actor || !name.trim()) return false;
      return actor.isUserAlreadyRegistered(name.trim());
    },
    enabled: !!actor && !isFetching && name.trim().length > 0,
  });
}

export function useGetProfile(name: string) {
  const { actor, isFetching } = useActor();
  return useQuery<GameProfile>({
    queryKey: ["profile", name],
    queryFn: async () => {
      if (!actor || !name.trim()) throw new Error("No actor or name");
      return actor.getProfile(name.trim());
    },
    enabled: !!actor && !isFetching && name.trim().length > 0,
    refetchInterval: 5000,
  });
}

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTopPlayers() {
  const { actor, isFetching } = useActor();
  return useQuery<GameProfile[]>({
    queryKey: ["topPlayers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopPlayers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useRegister() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.register(name.trim());
    },
    onSuccess: (_data, name) => {
      queryClient.invalidateQueries({ queryKey: ["isRegistered", name] });
      queryClient.invalidateQueries({ queryKey: ["profile", name] });
    },
  });
}

export function useAnswerQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      questionId,
      answerIndex,
    }: {
      name: string;
      questionId: bigint;
      answerIndex: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.answerQuestion(name, questionId, answerIndex);
    },
    onSuccess: (_data, { name }) => {
      queryClient.invalidateQueries({ queryKey: ["profile", name] });
      queryClient.invalidateQueries({ queryKey: ["topPlayers"] });
    },
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      questionText,
      options,
      correctAnswerIndex,
      category,
      difficulty,
    }: {
      questionText: string;
      options: string[];
      correctAnswerIndex: bigint;
      category: Category;
      difficulty: Difficulty;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addQuestion(
        questionText,
        options,
        correctAnswerIndex,
        category,
        difficulty,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
