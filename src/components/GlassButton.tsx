import { Link } from "react-router-dom";

type GlassButtonProps = {
  to: string;
  children: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "px-6 py-2.5 text-sm",
  md: "px-8 py-3 text-sm",
  lg: "px-14 py-5 text-base",
} as const;

export function GlassButton({ to, children, size = "sm", className = "" }: GlassButtonProps) {
  return (
    <Link
      to={to}
      className={`liquid-glass inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium text-foreground transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
