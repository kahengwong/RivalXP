"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SpriteProps {
  spriteId: string;
  size?: number;
  animate?: boolean;
  className?: string;
  hint?: string;
}

export function Sprite({ spriteId, size = 128, animate = true, className, hint }: SpriteProps) {
  // Use specific seeds for better pixel art results
  const seed = spriteId === 'rival' ? 'pixel-monster-99' : 'pixel-hero-22';
  
  const imageUrl = `https://picsum.photos/seed/${seed}/256/256`;
  const aiHint = hint || (spriteId === 'rival' ? 'pixel monster' : 'pixel trainer');

  return (
    <div className={cn(
      "relative inline-block overflow-hidden",
      animate && "animate-float",
      className
    )}>
      <div className="relative border-[4px] border-black bg-white/20 p-1">
        <Image 
          src={imageUrl}
          alt="Pixel Sprite"
          width={size}
          height={size}
          className="pixelated transition-all duration-300 contrast-[1.1] brightness-[1.05]"
          data-ai-hint={aiHint}
        />
      </div>
    </div>
  );
}