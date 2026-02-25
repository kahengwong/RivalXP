
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SpriteProps {
  spriteId: string;
  size?: number;
  animate?: boolean;
  className?: string;
  hint?: string;
}

export function Sprite({ spriteId, size = 128, animate = true, className, hint = "character" }: SpriteProps) {
  // Map spriteId to real URLs or placeholders
  const imageUrl = spriteId === 'rival' 
    ? "https://picsum.photos/seed/rival1/128/128" 
    : "https://picsum.photos/seed/hero1/128/128";

  return (
    <div className={cn(
      "relative inline-block overflow-hidden rounded-lg p-2 bg-muted/20",
      animate && "animate-float",
      className
    )}>
      <Image 
        src={imageUrl}
        alt="Pixel Sprite"
        width={size}
        height={size}
        className="pixelated grayscale-0 hover:grayscale-0 transition-all duration-300"
        data-ai-hint={hint}
      />
    </div>
  );
}
