"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  variant?: "default" | "minimal" | "rounded" | "filled"
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, variant = "default", checked, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    React.useEffect(() => {
      setIsChecked(checked || false)
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked)
      props.onChange?.(e)
    }

    const baseStyles = "relative flex items-center justify-center flex-shrink-0 cursor-pointer"

    const variants = {
      default: cn(
        "w-5 h-5 min-w-[20px] min-h-[20px] rounded border-2 border-border bg-background transition-all duration-200",
        isChecked && "bg-primary border-primary",
        !isChecked && "hover:border-primary/50"
      ),
      minimal: cn(
        "w-5 h-5 min-w-[20px] min-h-[20px] rounded-sm border border-border bg-transparent",
        isChecked && "bg-primary border-primary",
        // Explicit hover overrides to prevent any hover effects - using !important to override any global styles
        "!hover:bg-transparent !hover:border-border !hover:opacity-100",
        isChecked && "!hover:bg-primary !hover:border-primary !hover:opacity-100"
      ),
      rounded: cn(
        "w-5 h-5 min-w-[20px] min-h-[20px] rounded-full border-2 border-border bg-background transition-all duration-200",
        isChecked && "bg-primary border-primary",
        !isChecked && "hover:border-primary/50"
      ),
      filled: cn(
        "w-5 h-5 min-w-[20px] min-h-[20px] rounded border-2 border-primary bg-primary transition-all duration-200",
        "hover:bg-primary/90"
      ),
    }

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={inputRef}
          className="sr-only"
          checked={isChecked}
          {...props}
          onChange={handleChange}
        />
        <div
          className={cn(baseStyles, variants[variant], className)}
          style={variant === "minimal" ? {
            // Disable all transitions and prevent hover effects
            transition: "none",
            // Force styles to stay the same on hover
            ...(isChecked ? {
              backgroundColor: "hsl(var(--primary))",
              borderColor: "hsl(var(--primary))",
            } : {
              backgroundColor: "transparent",
              borderColor: "hsl(var(--border))",
            })
          } : undefined}
          onMouseEnter={(e) => {
            if (variant === "minimal") {
              // Force styles to remain unchanged on hover
              if (isChecked) {
                e.currentTarget.style.backgroundColor = "hsl(var(--primary))";
                e.currentTarget.style.borderColor = "hsl(var(--primary))";
              } else {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "hsl(var(--border))";
              }
            }
          }}
          onClick={(e) => {
            e.preventDefault()
            inputRef.current?.click()
          }}
          role="checkbox"
          aria-checked={isChecked}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          {isChecked && (
            <Check
              className={cn(
                "h-3.5 w-3.5 text-primary-foreground",
                variant === "filled" && "text-white",
                variant !== "minimal" && "transition-all duration-200"
              )}
              strokeWidth={3}
            />
          )}
        </div>
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
