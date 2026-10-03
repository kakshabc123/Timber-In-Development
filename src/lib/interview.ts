import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const PRESSURE_STAGES = [
  { label: "WARM UP", seconds: 30 },
  { label: "INTERVIEW", seconds: 30 },
  { label: "PRESSURE", seconds: 30 },
  { label: "RAPID FIRE", seconds: 30 },
  { label: "BOSS MODE", seconds: 30 },
];

export type InterviewQuestion = { question: string; category: string; stage: string; seconds: number };
export type InterviewAnswer = { answer: string; seconds_used: number };
export type QuestionFeedback = { score: number; feedback: string };
export type InterviewScores = {
  fluency: number;
  confidence: number;
  answer_quality: number;
  response_speed?: number;
  communication?: number;
  technical?: number;
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
  { key: "fluency", label: "Speaking Fluency" },
  { key: "confidence", label: "Confidence" },
  { key: "answer_quality", label: "Answer Quality" },
];

export const LEGACY_SCORE_LABELS: { key: keyof InterviewScores; label: string }[] = [
  { key: "response_speed", label: "Response Speed" },
  { key: "answer_quality", label: "Answer Quality" },
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical" },
];

export const USE_LOCAL_INTERVIEW_AI = import.meta.env.DEV;

const LOCAL_MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? "qwen2.5:7b";

async function askLocalModel<T>(system: string, prompt: string, schema: Record<string, unknown>): Promise<T> {
  const response = await fetch("/ollama/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: LOCAL_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      format: schema,
      stream: false,
      options: { temperature: 0.3 },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Local Ollama request failed (${response.status}): ${details || response.statusText}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  if (!data.message?.content) throw new Error("Ollama returned an empty response.");
  try {
    return JSON.parse(data.message.content) as T;
  } catch {
    throw new Error("Ollama returned invalid JSON. Try again or choose a different local model.");
  }
}

const LOCAL_QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "category"],
        properties: {
          question: { type: "string" },
          category: { type: "string", enum: ["behavioral", "technical", "situational", "resume"] },
        },
      },
    },
  },
};

const LOCAL_EVALUATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["answers", "fluency", "confidence", "answer_quality", "focus_area", "summary"],
  properties: {
    answers: {
      type: "array",
      minItems: 10,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["score", "feedback"],
        properties: {
          score: { type: "integer", minimum: 0, maximum: 100 },
          feedback: { type: "string", maxLength: 1000 },
        },
      },
    },
    fluency: { type: "integer", minimum: 0, maximum: 100 },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    answer_quality: { type: "integer", minimum: 0, maximum: 100 },
    focus_area: { type: "string", maxLength: 200 },
    summary: { type: "string", maxLength: 2000 },
  },
};

async function generateLocalQuestions(targetRole: string, experienceLevel: string | null) {
  const result = await askLocalModel<{ questions: { question: string; category: string }[] }>(
    "You are TimberVue, an interviewer. Return only JSON matching the supplied schema.",
    `Create exactly 10 concise interview questions for a ${targetRole} candidate at ${experienceLevel ?? "unspecified"} experience level. Mix behavioral, technical, and situational questions. Use the resume category only if a resume is explicitly provided; none is provided here. Order them from approachable to challenging.`,
    LOCAL_QUESTIONS_SCHEMA,
  );
  if (!Array.isArray(result.questions) || result.questions.length !== 10) {
    throw new Error("Ollama did not create all 10 interview questions. Please try again.");
  }
  return result.questions;
}

async function gradeLocally(questions: InterviewQuestion[], answers: InterviewAnswer[]) {
  const prompt = questions
    .map((question, index) => {
      const answer = answers[index];
      return `Q${index + 1} [${question.stage}, ${question.seconds}s]: ${question.question}\nA${index + 1} [${answer?.seconds_used ?? 0}s]: ${answer?.answer || "(no answer)"}`;
    })
    .join("\n\n");

  return askLocalModel<{
    answers: { score: number; feedback: string }[];
    fluency: number;
    confidence: number;
    answer_quality: number;
    focus_area: string;
    summary: string;
  }>(
    "You are TimberVue, grading a spoken interview from speech-to-text transcripts only. Score fairly from 0 to 100 and return only JSON matching the supplied schema. Fluency means coherent, well-paced wording with few visible disfluencies. Confidence means direct, specific language and clear ownership, not loudness or vocal tone. Answer quality means relevance, correctness, and useful detail. Do not infer vocal qualities from text. Empty answers score 0.",
    `Evaluate all 10 answers for fluency, confidence, and answer quality. Give concise actionable feedback for each answer, addressed to the candidate as you. Keep focus_area under 12 words and all text within the schema limits.\n\n${prompt}`,
    LOCAL_EVALUATION_SCHEMA,
  );
}

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

export async function startInterview(profile?: { targetRole: string; experienceLevel: string | null }) {
  if (USE_LOCAL_INTERVIEW_AI) {
    if (!profile?.targetRole) throw new Error("Choose your target role in your training profile first.");
    const questions = await generateLocalQuestions(profile.targetRole, profile.experienceLevel);
    return invokeInterview({ action: "start_local", questions });
  }
  return invokeInterview({ action: "start" });
}

export async function finishInterview(
  sessionId: string,
  answers: InterviewAnswer[],
  questions?: InterviewQuestion[],
) {
  if (USE_LOCAL_INTERVIEW_AI) {
    if (!questions?.length) throw new Error("The interview questions are missing. Please restart the interview.");
    const evaluation = await gradeLocally(questions, answers);
    return invokeInterview({ action: "finish_local", session_id: sessionId, answers, evaluation });
  }
  return invokeInterview({ action: "finish", session_id: sessionId, answers });
}
