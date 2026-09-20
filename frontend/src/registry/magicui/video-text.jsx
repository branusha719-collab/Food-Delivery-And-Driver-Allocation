import React from 'react';
import { cn } from "@/lib/utils";

export function VideoText({ src, children, className }) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-black", className)}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white mix-blend-screen">
        {children}
      </div>
    </div>
  );
}
