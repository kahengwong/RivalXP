"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SpriteProps {
  spriteId: 'user-blastoise' | 'rival-pikachu';
  size?: number;
  animate?: boolean;
  className?: string;
}

export function Sprite({ spriteId, size = 180, animate = true, className }: SpriteProps) {
  // 水箭龟用 user-blastoise, 皮卡丘用 rival-pikachu
  const imageSrc = spriteId === 'user-blastoise' ? '/水箭龟.png' : '/皮卡丘.png';

  return (
    <div className={cn(
      "relative inline-block",
      animate && "animate-float",
      className
    )}>
      {/* 像素风阴影底座 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-6 bg-black/10 rounded-full blur-[4px]" />
      
      <div className="relative">
        <Image 
          src={imageSrc}
          alt={spriteId}
          width={size}
          height={size}
          className="object-contain transparent"
          unoptimized={true}
          priority
        />
      </div>
    </div>
  );
}
