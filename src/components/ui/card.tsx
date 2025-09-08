"use client";

import { twMerge } from "tailwind-merge";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative border-8 border-white z-20">
      <div className={twMerge("relative !z-0", className)}>{children}</div>
      <div className="bg-black absolute -top-2 -left-2 w-2 h-2 z-20"></div>
      <div className="bg-black absolute -top-2 -right-2 w-2 h-2 z-20"></div>
      <div className="bg-black absolute -bottom-2 -left-2 w-2 h-2 z-20"></div>
      <div className="bg-black absolute -bottom-2 -right-2 w-2 h-2 z-20"></div>
      <div className="bg-white absolute top-0 left-0 w-2 h-2"></div>
      <div className="bg-white absolute top-0 right-0 w-2 h-2 z-20"></div>
      <div className="bg-white absolute bottom-0 left-0 w-2 h-2 z-20"></div>
      <div className="bg-white absolute bottom-0 right-0 w-2 h-2 z-20"></div>
    </div>
  );
}
