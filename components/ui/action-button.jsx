"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ActionButton({ 
  children, 
  loading = false, 
  loadingText, 
  icon: Icon,
  variant = "default",
  size = "default",
  className = "",
  ...props 
}) {
  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {children}
        </>
      )}
    </Button>
  );
}
