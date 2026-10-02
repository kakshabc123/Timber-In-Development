import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="font-display text-2xl">Timber</span>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <Link to="/dashboard" className="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-3 py-1.5 text-muted-foreground hover:text-foreground">
                Log in
              </Link>
              <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 font-medium text-primary-foreground">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-2xl font-display text-6xl leading-tight">Train for real interview pressure.</h1>
        <Link
          to={user ? "/dashboard" : "/signup"}
          className="mt-8 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Begin journey
        </Link>
      </main>
    </div>
  );
}
