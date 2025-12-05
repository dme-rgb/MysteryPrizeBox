import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary-border",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive-border",
        outline:
          "border [border-color:var(--button-outline)] shadow-xs active:shadow-none",
        secondary:
          "border bg-secondary text-secondary-foreground border border-secondary-border",
        ghost: "border border-transparent",

        // 🌟 NEW GOLD BUTTON VARIANT
        gold: `
          relative
          flex items-center justify-center
          rounded-3xl
          px-6 py-5
          text-xl font-extrabold text-black
          bg-gradient-to-b from-[#ffe28a] to-[#d19c00]
          shadow-[0_6px_0_#b68600,0_12px_22px_rgba(0,0,0,0.45)]
          border border-[#f8e7a0]
          overflow-hidden
          !rounded-3xl
          !text-xl !font-extrabold
          !leading-none
        `,

      },

      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",

        // Bigger size for gold button
        gold: "py-5 px-8 text-xl rounded-2xl",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Glossy top shine for gold variant */}
        {variant === "gold" && (
          <span
            className="
              absolute inset-0
              rounded-xl
              bg-gradient-to-b from-white/40 to-transparent
              pointer-events-none
            "
          />
        )}

        <span className="relative z-10">{children}</span>
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
