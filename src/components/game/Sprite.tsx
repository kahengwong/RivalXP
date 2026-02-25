
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
  const imageUrl = imageData?.imageUrl || `https://picsum.photos/seed/${spriteId}-pixel/256/256`;
  const aiHint = imageData?.imageHint || 'pixel pokemon art';

  return (
    <div className={cn(
      "relative inline-block",
      animate && "animate-float",
      className
    )}>
      {/* 像素风阴影底座 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-6 bg-black/10 rounded-full blur-[4px]" />
      
      <div className="relative p-2">
        <Image 
          src={imageUrl}
          alt={spriteId}
          width={size}
          height={size}
          className="pixelated contrast-[1.2] brightness-[1.05]"
          data-ai-hint={aiHint}
          priority
        />
      </div>
    </div>
  );
}
