import { Buffer } from "node:buffer";
import { encodeBase64 } from "jsr:@std/encoding@1/base64";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import mammoth from "npm:mammoth@1.8.0";

const STAGES = [
  { label: "WARM UP", seconds: 30 },
  { label: "INTERVIEW", seconds: 30 },
  { label: "PRESSURE", seconds: 30 },
  { label: "RAPID FIRE", seconds: 30 },
  { label: "BOSS MODE", seconds: 30 },
];
const QUESTIONS_PER_STAGE = 2;
const TOTAL_QUESTIONS = STAGES.length * QUESTIONS_PER_STAGE;
const MAX_ANSWER_CHARS = 2000;
const MAX_RESUME_CHARS = 15000;
const QUESTION_CATEGORIES = new Set(["behavioral", "technical", "situational", "resume"]);

const EXPERIENCE_LABELS: Record<string, string> = {
  student: "student or intern",
  entry: "entry level (0-2 years)",
  mid: "mid level (2-5 years)",
  senior: "senior (5+ years)",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Question = { question: string; category: string; stage: string; seconds: number };
type Answer = { answer: string; seconds_used: number };
type ContentPart =
  | { type: "text"; text: string }
  | { type: "file"; file: { filename: string; file_data: string } };

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function openaiJson<T>(
  system: string,
  content: ContentPart[],
  schemaName: string,
  schema: Record<string, unknown>,
): Promise<T> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) throw new HttpError(500, "OPENAI_API_KEY is not configured for the interview function.");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      response_format: { type: "json_schema", json_schema: { name: schemaName, strict: true, schema } },
    }),
  });

  if (!response.ok) {
    console.error("OpenAI request failed", response.status, await response.text());
    throw new HttpError(502, "The AI interviewer is unavailable right now. Please try again.");
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string | null } }[] };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new HttpError(502, "The AI interviewer returned an empty response.");
  return JSON.parse(text) as T;
}

async function loadResume(path: string | null, filename: string | null): Promise<ContentPart[]> {
  if (!path) return [];
  const { data, error } = await admin.storage.from("resumes").download(path);
  if (error || !data) {
    console.error("Resume download failed", error);
    return [];
  }
  const bytes = new Uint8Array(await data.arrayBuffer());

  if (path.endsWith(".pdf")) {
    return [
      {
        type: "file",
        file: { filename: filename ?? "resume.pdf", file_data: `data:application/pdf;base64,${encodeBase64(bytes)}` },
      },
    ];
  }
  if (path.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return [{ type: "text", text: `Candidate resume:\n${value.slice(0, MAX_RESUME_CHARS)}` }];
  }
  return [];
}

const START_PROMPT = `You are TimberVue, a sharp interviewer running a timed spoken interview.
Write questions tailored to the candidate's target role, experience level and resume. When a resume is provided, reference specific projects, companies, or skills from it.
Questions get progressively harder and must be answerable aloud within their time limit, so later questions must be shorter and sharper.
Mix behavioral, technical, situational and resume deep-dive questions. Each question is a single sentence with no preamble or numbering.`;

const FINISH_PROMPT = `You are TimberVue, grading a spoken interview from speech-to-text transcripts only. Tolerate likely transcription typos.
Score each answer 0-100 for how well it answers the question. An empty answer scores 0.
Then score the whole interview 0-100 on:
- answer_quality: relevance, correctness, specificity and useful detail
- fluency: coherent, well-paced wording with few visible disfluencies
- confidence: direct language, specific examples and clear ownership; do not infer loudness or vocal tone
Do not claim to assess acoustic qualities from text.
feedback: one or two concise sentences per answer, addressed to the candidate as "you".
focus_area: the single most important improvement, under 12 words.
summary: two sentences on overall performance.`;

const QUESTIONS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
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

const EVALUATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["answers", "fluency", "confidence", "answer_quality", "focus_area", "summary"],
  properties: {
    answers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["score", "feedback"],
        properties: { score: { type: "integer" }, feedback: { type: "string" } },
      },
    },
    fluency: { type: "integer", minimum: 0, maximum: 100 },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    answer_quality: { type: "integer" },
    focus_area: { type: "string" },
    summary: { type: "string" },
  },
};

function parseLocalQuestions(raw: unknown): Question[] {
  if (!Array.isArray(raw) || raw.length !== TOTAL_QUESTIONS) {
    throw new HttpError(400, `Expected exactly ${TOTAL_QUESTIONS} locally generated questions.`);
  }
  return raw.map((item, index) => {
    const stage = STAGES[Math.floor(index / QUESTIONS_PER_STAGE)];
    if (
      typeof item?.question !== "string" ||
      !item.question.trim() ||
      item.question.length > 500 ||
      typeof item.category !== "string" ||
      !QUESTION_CATEGORIES.has(item.category)
    ) {
      throw new HttpError(400, `Invalid local question ${index + 1}.`);
    }
    return { question: item.question.trim(), category: item.category, stage: stage.label, seconds: stage.seconds };
  });
}

async function startInterview(userId: string, rawLocalQuestions?: unknown) {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("target_role, experience_level, resume_path, resume_filename")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!profile?.target_role) throw new HttpError(400, "Finish onboarding before starting an interview.");

  const isLocal = rawLocalQuestions !== undefined;
  const resume = isLocal ? [] : await loadResume(profile.resume_path, profile.resume_filename);
  const schedule = STAGES.map(
    (stage, i) =>
      `Questions ${i * QUESTIONS_PER_STAGE + 1}-${(i + 1) * QUESTIONS_PER_STAGE}: ${stage.seconds} seconds to answer`,
  ).join("\n");

  const questions: Question[] = isLocal
    ? parseLocalQuestions(rawLocalQuestions)
    : await (async () => {
        const result = await openaiJson<{ questions: { question: string; category: string }[] }>(
          START_PROMPT,
          [
            {
              type: "text",
              text: [
                `Target role: ${profile.target_role}`,
                `Experience: ${EXPERIENCE_LABELS[profile.experience_level ?? ""] ?? "unspecified"}`,
                resume.length ? "The candidate's resume is attached." : "No resume is available; base questions on the role.",
                `Write exactly ${TOTAL_QUESTIONS} questions in order.`,
                schedule,
              ].join("\n"),
            },
            ...resume,
          ],
          "interview_questions",
          QUESTIONS_SCHEMA,
        );

        if (result.questions.length < TOTAL_QUESTIONS) {
          throw new HttpError(502, "The AI interviewer didn't produce enough questions. Please try again.");
        }

        return result.questions.slice(0, TOTAL_QUESTIONS).map((q, i) => {
          const stage = STAGES[Math.floor(i / QUESTIONS_PER_STAGE)];
          return { question: q.question, category: q.category, stage: stage.label, seconds: stage.seconds };
        });
      })();

  const { data: session, error: insertError } = await admin
    .from("interview_sessions")
    .insert({
      user_id: userId,
      target_role: profile.target_role,
      experience_level: profile.experience_level,
      questions,
    })
    .select("*")
    .single();
  if (insertError) throw new HttpError(500, insertError.message);
  return session;
}

function parseAnswers(raw: unknown, questions: Question[]): Answer[] {
  if (!Array.isArray(raw) || raw.length !== questions.length) {
    throw new HttpError(400, `Expected ${questions.length} answers.`);
  }
  return raw.map((item, i) => {
    const answer = typeof item?.answer === "string" ? item.answer.trim().slice(0, MAX_ANSWER_CHARS) : "";
    const used = typeof item?.seconds_used === "number" && Number.isFinite(item.seconds_used) ? item.seconds_used : 0;
    return { answer, seconds_used: Math.max(0, Math.min(questions[i].seconds, used)) };
  });
}

type Evaluation = {
  answers: { score: number; feedback: string }[];
  fluency: number;
  confidence: number;
  answer_quality: number;
  focus_area: string;
  summary: string;
};

function parseLocalEvaluation(raw: unknown, questionCount: number): Evaluation {
  if (!raw || typeof raw !== "object") throw new HttpError(400, "A local evaluation is required.");
  const candidate = raw as Record<string, unknown>;
  if (!Array.isArray(candidate.answers) || candidate.answers.length !== questionCount) {
    throw new HttpError(400, `Expected feedback for exactly ${questionCount} answers.`);
  }

  const score = (value: unknown, label: string) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      throw new HttpError(400, `Invalid ${label} score in local evaluation.`);
    }
    return clampScore(value);
  };

  const feedback = candidate.answers.map((item, index) => {
    if (!item || typeof item !== "object") throw new HttpError(400, `Invalid feedback for answer ${index + 1}.`);
    const answerFeedback = item as Record<string, unknown>;
    if (typeof answerFeedback.feedback !== "string") {
      throw new HttpError(400, `Invalid feedback for answer ${index + 1}.`);
    }
    return {
      score: score(answerFeedback.score, `answer ${index + 1}`),
      feedback: answerFeedback.feedback.slice(0, 1000),
    };
  });

  if (typeof candidate.focus_area !== "string") {
    throw new HttpError(400, "Invalid focus area in local evaluation.");
  }
  if (typeof candidate.summary !== "string") {
    throw new HttpError(400, "Invalid summary in local evaluation.");
  }

  return {
    answers: feedback,
    fluency: score(candidate.fluency, "fluency"),
    confidence: score(candidate.confidence, "confidence"),
    answer_quality: score(candidate.answer_quality, "answer quality"),
    focus_area: candidate.focus_area.trim().slice(0, 200),
    summary: candidate.summary.trim().slice(0, 2000),
  };
}

async function finishInterview(
  userId: string,
  sessionId: unknown,
  rawAnswers: unknown,
  rawLocalEvaluation?: unknown,
) {
  if (typeof sessionId !== "string") throw new HttpError(400, "session_id is required.");

  const { data: session, error } = await admin
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new HttpError(500, error.message);
  if (!session) throw new HttpError(404, "Interview session not found.");
  if (session.status === "completed") return session;

  const questions = session.questions as Question[];
  const answers = parseAnswers(rawAnswers, questions);

  const transcript = questions
    .map(
      (q, i) =>
        `Q${i + 1} [${q.stage}, ${q.seconds}s limit, answered in ${answers[i].seconds_used.toFixed(1)}s]: ${q.question}\nA${i + 1}: ${answers[i].answer || "(no answer)"}`,
    )
    .join("\n\n");

  const evaluation = rawLocalEvaluation !== undefined
    ? parseLocalEvaluation(rawLocalEvaluation, questions.length)
    : await openaiJson<Evaluation>(
        FINISH_PROMPT,
        [
          {
            type: "text",
            text: `Target role: ${session.target_role}\nExperience: ${EXPERIENCE_LABELS[session.experience_level ?? ""] ?? "unspecified"}\n\n${transcript}`,
          },
        ],
        "interview_evaluation",
        EVALUATION_SCHEMA,
      );

  const feedback = questions.map((_, i) => {
    const item = evaluation.answers[i];
    return {
      score: answers[i].answer && item ? clampScore(item.score) : 0,
      feedback: item?.feedback ?? "No feedback available.",
    };
  });

  const scores = {
    fluency: clampScore(evaluation.fluency),
    confidence: clampScore(evaluation.confidence),
    answer_quality: clampScore(evaluation.answer_quality),
  };
  const overall = clampScore((scores.fluency + scores.confidence + scores.answer_quality) / 3);

  const { data: updated, error: updateError } = await admin
    .from("interview_sessions")
    .update({
      status: "completed",
      answers,
      feedback,
      scores,
      overall_score: overall,
      focus_area: evaluation.focus_area,
      summary: evaluation.summary,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (updateError) throw new HttpError(500, updateError.message);
  return updated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) throw new HttpError(401, "Missing authorization.");
    const { data: auth, error: authError } = await admin.auth.getUser(token);
    if (authError || !auth.user) throw new HttpError(401, "You need to be logged in.");

    const body = await req.json().catch(() => ({}));
    if (body.action === "start") return json(await startInterview(auth.user.id));
    if (body.action === "finish") return json(await finishInterview(auth.user.id, body.session_id, body.answers));
    if (body.action === "start_local" || body.action === "finish_local") {
      if (Deno.env.get("ALLOW_LOCAL_INTERVIEW_AI") !== "true") {
        throw new HttpError(403, "Local interview AI is disabled for this Supabase project.");
      }
      if (body.action === "start_local") {
        return json(await startInterview(auth.user.id, body.questions ?? null));
      }
      return json(await finishInterview(auth.user.id, body.session_id, body.answers, body.evaluation ?? null));
    }
    throw new HttpError(400, "Unknown action.");
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
