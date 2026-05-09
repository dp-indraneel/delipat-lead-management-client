import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  const styles = {
    primary: "bg-[#fcb61f] text-[#013144] hover:opacity-90",
    secondary: "border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]",
    ghost: "text-[#013144]/70 hover:bg-[#013144]/[0.04] hover:text-[#013144]",
    danger: "bg-red-500/90 text-white hover:bg-red-500",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
