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
  // 使用合并的图片，通过 object-position 显示不同部分
  // 皮卡丘在左边(0%), 水箭龟在右边(100%)
  const objectPosition = spriteId === 'rival-pikachu' ? 'left' : 'right';

  return (
    <div className={cn(
      "relative inline-block",
      animate && "animate-float",
      className
    )}>
      {/* 像素风阴影底座 */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] h-6 bg-black/10 rounded-full blur-[4px]" />
      
      <div className="relative p-2">
        <div 
          className="relative overflow-hidden"
          style={{ width: size, height: size }}
        >
          <Image 
            src="/Gemini_Generated_Image_kh6rfzkh6rfzkh6r.png"
            alt={spriteId}
            fill
            className="object-contain"
            style={{ objectPosition: objectPosition === 'left' ? '0%' : '100%' }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
