import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap transition-all shadow-xs [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "bg-[#FFF0E6] text-[#D97736] border-[#FCDCC8] dark:bg-[#352114] dark:text-[#FBAA78] dark:border-[#55341E]",
        orange:
          "bg-[#FFF0E6] text-[#D97736] border-[#FCDCC8] dark:bg-[#352114] dark:text-[#FBAA78] dark:border-[#55341E]",
        aqua:
          "bg-[#E6F8FB] text-[#0284C7] border-[#BAE6FD] dark:bg-[#0E2E3B] dark:text-[#38BDF8] dark:border-[#164E63]",
        pink:
          "bg-[#FDF2F8] text-[#DB2777] border-[#FBCFE8] dark:bg-[#3B1226] dark:text-[#F48FB1] dark:border-[#5C1D3E]",
        green:
          "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0] dark:bg-[#112F1B] dark:text-[#4ADE80] dark:border-[#166534]",
        amber:
          "bg-[#FEFCE8] text-[#D97706] border-[#FEF08A] dark:bg-[#382A0B] dark:text-[#FBBF24] dark:border-[#59400D]",
        secondary:
          "bg-secondary text-secondary-foreground border-border",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/20",
        outline:
          "border-2 border-border/80 text-foreground bg-card/60",
        ghost:
          "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 border-transparent shadow-none",
        link: "text-primary underline-offset-4 hover:underline border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
