import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border bg-[var(--surface-elevated)] text-foreground",
        className
      )}
      {...p}
    />
  );
}

export function CardHeader({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 px-6 pt-6 pb-4", className)} {...p} />;
}

export function CardTitle({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-[18px] font-semibold tracking-tight leading-[1.33]", className)}
      {...p}
    />
  );
}

export function CardDescription({
  className,
  ...p
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-[var(--muted)]", className)} {...p} />;
}

export function CardContent({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6", className)} {...p} />;
}

export function CardFooter({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center px-6 py-4 border-t", className)} {...p} />
  );
}
