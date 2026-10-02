import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type Profile = { full_name: string | null };

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle<Profile>()
      .then(({ data }) => setProfile(data));
  }, [user]);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const displayName =
    profile?.full_name ?? (user?.user_metadata.full_name as string | undefined) ?? user?.email;

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-display text-2xl">Timber</span>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-border px-4 py-1.5 text-sm transition hover:bg-secondary"
        >
          Log out
        </button>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-5xl">Hi, {displayName}</h1>
        <p className="mt-3 text-muted-foreground">Signed in as {user?.email}</p>
      </main>
    </div>
  );
}
