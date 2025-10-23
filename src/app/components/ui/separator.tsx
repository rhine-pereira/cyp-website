"use client";

import * as React from "react";

export function Separator({ className, orientation = "horizontal", ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="separator"
      className={
        (orientation === "vertical"
          ? "h-full w-px"
          : "h-px w-full") +
        " bg-gray-200 " +
        (className ?? "")
      }
      aria-orientation={orientation}
      {...props}
    />
  );
}
