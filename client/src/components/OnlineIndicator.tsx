import { cn } from "@/lib/utils";

interface OnlineIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function OnlineIndicator({ 
  isOnline, 
  size = "sm", 
  className,
  showLabel = false 
}: OnlineIndicatorProps) {
  const sizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-full border-2 border-background",
          sizeClasses[size],
          isOnline 
            ? "bg-green-500" 
            : "bg-muted-foreground/40"
        )}
        aria-hidden="true"
      />
      {showLabel && (
        <span className={cn(
          "text-xs",
          isOnline ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
        )}>
          {isOnline ? "Online" : "Offline"}
        </span>
      )}
    </div>
  );
}

interface AvatarWithOnlineIndicatorProps {
  children: React.ReactNode;
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
}

export function AvatarWithOnlineIndicator({ 
  children, 
  isOnline,
  size = "sm" 
}: AvatarWithOnlineIndicatorProps) {
  const positionClasses = {
    sm: "bottom-0 right-0",
    md: "-bottom-0.5 -right-0.5",
    lg: "-bottom-1 -right-1",
  };

  return (
    <div className="relative inline-block">
      {children}
      <span
        className={cn(
          "absolute rounded-full border-2 border-background",
          positionClasses[size],
          size === "sm" ? "h-2.5 w-2.5" : size === "md" ? "h-3 w-3" : "h-4 w-4",
          isOnline 
            ? "bg-green-500" 
            : "bg-muted-foreground/40"
        )}
        aria-label={isOnline ? "Online" : "Offline"}
      />
    </div>
  );
}
