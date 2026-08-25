import type { ReactNode } from "react";

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  type = "button",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-2xl transition active:scale-95 disabled:opacity-40 disabled:active:scale-100";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-glow",
    secondary: "bg-surface-2 text-text hover:bg-surface-3 border border-border",
    ghost: "text-text-secondary hover:text-text hover:bg-surface-2/50",
    danger: "bg-danger/20 text-danger hover:bg-danger/30",
  };
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg rounded-3xl",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
