"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const spinnerVariants =
  "w-[20px] h-[20px] border-2 border-t-2 border-gray-200 border-t-gray-600 rounded-full animate-spin";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <div ref={ref} className={cn(spinnerVariants, className)} {...rest} />
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
