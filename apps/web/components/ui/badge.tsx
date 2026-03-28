import * as React from "react"
import { cn } from "@/lib/utils"

const variantClasses: Record<string, string> = {
  default: "bg-blue-500 text-white",
  secondary: "bg-slate-100 text-slate-700",
  destructive: "bg-red-50 text-red-500",
  outline: "border border-slate-300 text-slate-700",
  ghost: "text-slate-600 hover:bg-slate-100",
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClasses
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-fit items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
