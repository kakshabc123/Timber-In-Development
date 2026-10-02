import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

export function OnboardedRoute() {
  const { profile, loading, error, refresh } = useProfile();

  if (loading) return <FullScreenLoader />;
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="max-w-md text-sm text-muted-foreground">Couldn&apos;t load your profile: {error}</p>
        <button
          onClick={() => void refresh()}
          className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:bg-secondary"
        >
          Try again
        </button>
      </div>
    );
  }
  if (!profile?.onboarded_at) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
