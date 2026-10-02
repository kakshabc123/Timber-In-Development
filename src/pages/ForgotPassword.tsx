import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { Field, FormMessage, SubmitButton } from "@/components/FormControls";
import { useAuth } from "@/contexts/AuthContext";

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: resetError } = await sendPasswordReset(email.trim());
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/login" className="text-foreground underline underline-offset-4">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <FormMessage type="success">If an account exists for that email, a reset link is on its way.</FormMessage>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && <FormMessage type="error">{error}</FormMessage>}
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <SubmitButton loading={submitting} disabled={!email}>
            Send reset link
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
