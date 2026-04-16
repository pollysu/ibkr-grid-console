import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-foreground focus-visible:outline-offset-2 cursor-pointer select-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] active:bg-[#0046d6]",
        secondary:
          "bg-[var(--surface-secondary)] text-foreground hover:bg-[var(--brand-hover)] hover:text-white",
        outline:
          "border border-[var(--brand)] text-[var(--brand)] bg-transparent hover:bg-[var(--brand)] hover:text-white",
        ghost: "text-foreground hover:bg-[var(--surface-secondary)]",
        danger: "bg-[var(--danger)] text-white hover:bg-[#a31a25]",
        dark: "bg-[var(--surface-dark)] text-white hover:bg-[#282b31]",
      },
      size: {
        sm: "h-8 px-3 text-[13px] rounded-[var(--radius-pill)]",
        md: "h-10 px-5 text-sm rounded-[var(--radius-pill)]",
        lg: "h-12 px-7 text-base rounded-[var(--radius-pill)]",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
