import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

export function Field({ label, id, ...props }: FieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        id={id}
        className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </label>
  );
}

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function SubmitButton({ loading, children, disabled, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}

export function FormMessage({ type, children }: { type: "error" | "success"; children: string }) {
  const styles =
    type === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : "border-border bg-secondary text-foreground";
  return (
    <p role={type === "error" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      {children}
    </p>
  );
}
