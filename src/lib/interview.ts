import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const PRESSURE_STAGES = [
  { label: "WARM UP", seconds: 30 },
  { label: "INTERVIEW", seconds: 20 },
  { label: "PRESSURE", seconds: 15 },
  { label: "RAPID FIRE", seconds: 10 },
  { label: "BOSS MODE", seconds: 5 },
];

export type InterviewQuestion = { question: string; category: string; stage: string; seconds: number };
export type InterviewAnswer = { answer: string; seconds_used: number };
export type QuestionFeedback = { score: number; feedback: string };
export type InterviewScores = {
  response_speed: number;
  answer_quality: number;
  communication: number;
  technical: number;
};

export type InterviewSession = {
  id: string;
  target_role: string;
  experience_level: string | null;
  status: "in_progress" | "completed";
  questions: InterviewQuestion[];
  answers: InterviewAnswer[] | null;
  feedback: QuestionFeedback[] | null;
  scores: InterviewScores | null;
  overall_score: number | null;
  focus_area: string | null;
  summary: string | null;
  created_at: string;
  completed_at: string | null;
};

export const SCORE_LABELS: { key: keyof InterviewScores; label: string }[] = [
  { key: "response_speed", label: "Response Speed" },
  { key: "answer_quality", label: "Answer Quality" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
];

async function invokeInterview(body: Record<string, unknown>): Promise<InterviewSession> {
  const { data, error } = await supabase.functions.invoke<InterviewSession>("interview", { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const payload = (await error.context.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? error.message);
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error("The interview service returned an empty response.");
  return data;
}

export function startInterview() {
  return invokeInterview({ action: "start" });
}

export function finishInterview(sessionId: string, answers: InterviewAnswer[]) {
  return invokeInterview({ action: "finish", session_id: sessionId, answers });
}
