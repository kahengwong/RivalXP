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
  // Try to find in registry, fallback to picsum with logic
  const registryImage = PlaceHolderImages.find(img => img.id.includes(spriteId));
  
  const imageUrl = registryImage 
    ? registryImage.imageUrl 
    : `https://picsum.photos/seed/${spriteId === 'rival' ? 'poke-rival' : 'poke-hero'}/128/128`;

  const aiHint = hint || (spriteId === 'rival' ? 'pixel monster' : 'pixel trainer');

  return (
    <div className={cn(
      "relative inline-block overflow-hidden p-2",
      animate && "animate-float",
      className
    )}>
      <Image 
        src={imageUrl}
        alt="Pixel Sprite"
        width={size}
        height={size}
        className="pixelated grayscale-0 transition-all duration-300 contrast-125"
        data-ai-hint={aiHint}
      />
    </div>
  );
}
