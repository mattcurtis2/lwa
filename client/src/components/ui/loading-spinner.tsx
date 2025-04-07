import { RefreshCw } from 'lucide-react';

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };
  
  return (
    <RefreshCw className={`${sizes[size]} animate-spin text-primary`} />
  );
}