import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured } from "@/lib/supabase";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-10 font-display text-3xl tracking-tight">
        Timber
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-secondary/40 p-8 backdrop-blur">
        <h1 className="font-display text-4xl leading-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Supabase keys are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}
