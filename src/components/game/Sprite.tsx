
"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface SpriteProps {
  spriteId: 'user-blastoise' | 'rival-pikachu';
  size?: number;
  animate?: boolean;
  className?: string;
}

export function Sprite({ spriteId, size = 180, animate = true, className }: SpriteProps) {
  const imageData = PlaceHolderImages.find(img => img.id === spriteId);
  const imageUrl = imageData?.imageUrl || `https://picsum.photos/seed/${spriteId}/256/256`;
  const aiHint = imageData?.imageHint || 'pixel pokemon';

  return (
    <div className={cn(
      "relative inline-block",
      animate && "animate-float",
      className
    )}>
      {/* 经典的精灵平台阴影 */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/10 rounded-[100%] blur-[2px]" />
      
      <div className="relative p-2">
        <Image 
          src={imageUrl}
          alt={spriteId}
          width={size}
          height={size}
          className="pixelated contrast-[1.1] brightness-[1.05]"
          data-ai-hint={aiHint}
          priority
        />
      </div>
    </div>
  );
}
