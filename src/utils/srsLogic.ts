import { DAY_TO_MILLIS } from "src/Dashboard";
import { NoteState } from "src/managers/DataManager";
import { daysLate, now, startOfDay } from "./time";

export enum Rating {
  AGAIN = 1, //failed recall
  HARD = 2, //partial recall
  GOOD = 3, //solid recall
  EASY = 4, //effortless recall
}

export function getUpdatedDifficulty(
  difficulty: number,
  rating: Rating
): number {
  const delta =
    rating === Rating.AGAIN
      ? +1.0
      : rating === Rating.HARD
      ? +0.3
      : rating === Rating.GOOD
      ? -0.2
      : -0.6;
  const newDifficulty = difficulty + delta;
  return Math.min(10, Math.max(1, newDifficulty));
}

export function getStabilityAfterFail(): number {
  return 1.0;
}

export function isLearned(n: NoteState): boolean {
  return n.reps >= 3 && n.stability >= 10;
}

export function isFragile(n: NoteState): boolean {
  return n.difficulty >= 7 || n.stability < 5;
}

export function getKnowledgeScore(n: NoteState): number {
  const stabilityScore = Math.min(n.stability / 30, 1);
  const difficultyScore = 1 - (n.difficulty - 1) / 9;
  const overduePenalty = Math.max(
    0,
    (Date.now() - n.nextReview) / (7 * DAY_TO_MILLIS)
  );
  const score =
    stabilityScore * 0.6 + difficultyScore * 0.3 - overduePenalty * 0.1;

  return Math.max(0, Math.min(1, score)) * 100;
}

export function getStabilityAfterSuccess(
  stability: number,
  difficulty: number,
  rating: Rating,
  nextReview: number
): number {
  const baseGrowth =
    rating === Rating.HARD ? 1.1 : rating === Rating.GOOD ? 1.8 : 2.5;

  const difficultyPenalty = 1 - (difficulty - 5) * 0.05;
  const latenessPenalty = Math.max(0.7, 1 - daysLate(nextReview) * 0.05);

  const growth = baseGrowth * difficultyPenalty * latenessPenalty;

  return Math.max(1, stability * growth);
}

export function getNextIntervalDays(stability: number): number {
  return Math.round(stability);
}

export function getScheduledNoteState(
  note: NoteState,
  rating: Rating
): NoteState {
  let stability: number;
  let difficulty: number;
  let reps: number;

  difficulty = getUpdatedDifficulty(note.difficulty, rating);
  if (rating === Rating.AGAIN) {
    stability = getStabilityAfterFail();
    reps = 0;
  } else {
    stability = getStabilityAfterSuccess(
      note.stability,
      difficulty,
      rating,
      note.nextReview
    );
    reps = note.reps + 1;
  }
  const intervalDays = getNextIntervalDays(stability);
  const nextReview = Date.now() + intervalDays * DAY_TO_MILLIS;

  return {
    setId: note.setId,
    stability,
    difficulty,
    reps,
    lastReview: Date.now(),
    nextReview,
  };
}

export function isDue(note: NoteState): boolean {
  return startOfDay(now()) >= startOfDay(note.nextReview);
}

export function isNotLearnedYet(
  note: NoteState
): note is NoteState & { lastReview: null } {
  return note.lastReview === null;
}

export function reviewPriority(note: NoteState): number {
  const overdueDays = daysLate(note.nextReview);
  const score = getKnowledgeScore(note);
  const fragileBonus = isFragile(note) ? 20 : 0;
  return overdueDays * 10 + fragileBonus + (100 - score);
}

export function getReviewQueue(
  notes: Record<string, NoteState>
): { path: string; note: NoteState }[] {
  return Object.entries(notes)
    .filter(([_, note]) => isDue(note))
    .map(([path, note]) => ({ path, note }))
    .sort((a, b) => reviewPriority(b.note) - reviewPriority(a.note));
}

export function getNoteName(path: string) {
  const ar = path.split("/");
  const l = ar.length;
  return ar[l - 1];
}
