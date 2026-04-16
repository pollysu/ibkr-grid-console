import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-3 text-sm",
        "placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:outline-none",
        "tabular",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
