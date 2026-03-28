import * as React from "react"
import { cn } from "@/lib/utils"

const variantClasses: Record<string, string> = {
  default: "bg-blue-500 text-white border border-blue-500 hover:bg-blue-700 hover:border-blue-700 active:translate-y-px",
  outline: "bg-white text-gray-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400",
  secondary: "bg-slate-100 text-gray-700 border border-transparent hover:bg-slate-200",
  ghost: "bg-transparent text-gray-700 border border-transparent hover:bg-slate-100",
  destructive: "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 hover:border-red-300",
  link: "bg-transparent text-blue-500 border-transparent underline-offset-4 hover:underline",
}

const sizeClasses: Record<string, string> = {
  default: "h-8 px-2.5",
  xs: "h-6 px-2 text-xs rounded-md",
  sm: "h-7 px-2.5 text-[0.8125rem] rounded-md",
  lg: "h-9 px-4",
  icon: "size-8 p-0",
  "icon-xs": "size-6 p-0 rounded-md",
  "icon-sm": "size-7 p-0 rounded-md",
  "icon-lg": "size-9 p-0",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses
  size?: keyof typeof sizeClasses
}

function buttonVariants({ variant = "default", size = "default", className }: Pick<ButtonProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border text-sm font-semibold cursor-pointer select-none no-underline outline-none transition-all duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    className
  )
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
