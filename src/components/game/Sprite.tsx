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
      {/* 像素风阴影底座 - 仅使用半透明阴影，避免影响透明PNG底图 */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[60%] h-4 bg-black/20 rounded-full blur-[4px] z-[-1]" />
      <div className="relative">
        <Image 
          src={imageSrc}
          alt={spriteId}
          width={size}
          height={size}
          className="object-contain drop-shadow-md"
          unoptimized={true}
          priority
        />
          src={imageSrc}
          alt={spriteId}
          width={size}
          height={size}
          className="object-contain"
          style={{ backgroundColor: 'transparent' }}
          unoptimized={true}
          priority
        />
      </div>
    </div>
  );
}
