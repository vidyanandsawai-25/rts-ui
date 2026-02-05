import React from "react";
import { Loader2 } from "lucide-react";

/* ----------------------------------------------------------
   GENERIC BUTTON - SERVER COMPONENT
---------------------------------------------------------- */

export type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "ghost" 
  | "danger" 
  | "success"
  | "edit"
  | "delete";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

/**
 * Props for the Button component
 * @property {ButtonVariant} variant - The visual style variant of the button
 * @property {ButtonSize} size - The size of the button
 * @property {React.ElementType} icon - Optional icon component to display
 * @property {"left" | "right"} iconPosition - Position of the icon relative to text
 * @property {boolean} isLoading - Whether the button is in a loading state
 * @property {React.ReactNode} children - Button content/text
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * A versatile button component with multiple variants, sizes, and loading states.
 * Server Component compatible.
 *
 * @example
 * <Button variant="primary" size="md" isLoading={false}>
 *   Click Me
 * </Button>
 *
 * @param {ButtonProps} props - The button props
 * @returns {React.ReactElement} The rendered button element
 */
export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps): React.ReactElement {
  const sizeClasses: Record<ButtonSize, string> = {
    xs: "h-7 px-2.5 text-xs gap-1.5",
    sm: "h-8 px-3 text-sm gap-2",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const iconSizes: Record<ButtonSize, string> = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
     edit: "text-[#1A86E8] hover:bg-blue-50 border border-blue-400 hover:shadow-md hover:scale-105",
    delete: "text-red-500 hover:bg-red-50 border border-red-400 hover:shadow-md hover:scale-105",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      )}
      
      {!isLoading && Icon && iconPosition === "left" && (
        <Icon className={iconSizes[size]} />
      )}
      
      {children && <span>{children}</span>}
      
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );
}