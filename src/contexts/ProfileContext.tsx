import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type Profile = {
  id: string;
  full_name: string | null;
  target_role: string | null;
  experience_level: string | null;
  resume_path: string | null;
  resume_filename: string | null;
  onboarded_at: string | null;
};

const PROFILE_COLUMNS =
  "id, full_name, target_role, experience_level, resume_path, resume_filename, onboarded_at";

type ProfileState = { userId: string | null; profile: Profile | null; error: string | null };

type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [state, setState] = useState<ProfileState>({ userId: null, profile: null, error: null });

  const fetchProfile = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", id)
      .maybeSingle<Profile>();
    setState({ userId: id, profile: data ?? null, error: error?.message ?? null });
  }, []);

  useEffect(() => {
    if (userId) void fetchProfile(userId);
  }, [userId, fetchProfile]);

  const refresh = useCallback(async () => {
    if (userId) await fetchProfile(userId);
  }, [userId, fetchProfile]);

  const value = useMemo<ProfileContextValue>(() => {
    const current = state.userId === userId;
    return {
      profile: current ? state.profile : null,
      error: current ? state.error : null,
      loading: userId !== null && !current,
      refresh,
    };
  }, [state, userId, refresh]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within a ProfileProvider");
  return context;
}
