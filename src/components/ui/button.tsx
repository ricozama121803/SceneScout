import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        outline:
          "bg-background text-foreground border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
        ghost:
          "border-2 border-transparent text-foreground hover:bg-muted hover:border-border",
        destructive:
          "bg-destructive text-white border-2 border-border shadow-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        xs: "h-7 px-2.5 text-xs rounded-md",
        sm: "h-9 px-3 text-sm rounded-md",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "size-10 rounded-lg",
        "icon-xs": "size-7 rounded-md",
        "icon-sm": "size-9 rounded-md",
        "icon-lg": "size-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
