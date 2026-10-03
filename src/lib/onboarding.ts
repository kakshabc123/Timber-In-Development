export const RESUME_BUCKET = "resumes";
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

export const RESUME_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

export const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full-Stack Engineer",
  "Data Scientist",
  "ML Engineer",
  "Product Manager",
  "Product Designer",
];

export const EXPERIENCE_LEVELS = [
  { value: "student", label: "Student / Intern" },
  { value: "entry", label: "Entry · 0–2 yrs" },
  { value: "mid", label: "Mid · 2–5 yrs" },
  { value: "senior", label: "Senior · 5+ yrs" },
];

export function experienceLabel(value: string | null) {
  return EXPERIENCE_LEVELS.find((level) => level.value === value)?.label ?? null;
}

export function validateResume(file: File): string | null {
  if (!RESUME_TYPES[file.type]) return "Upload a PDF, DOC, or DOCX file.";
  if (file.size > MAX_RESUME_BYTES) return "Resume must be 5 MB or smaller.";
  return null;
}
