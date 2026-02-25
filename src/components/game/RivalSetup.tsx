
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sprite } from "./Sprite";
import { Rival, PersonalityTone } from "@/lib/game-types";
import { cn } from '@/lib/utils';

interface RivalSetupProps {
  onComplete: (rival: Rival) => void;
}

export function RivalSetup({ onComplete }: RivalSetupProps) {
  const [name, setName] = useState("BLUE");
  const [personality, setPersonality] = useState<PersonalityTone>("smug");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete({
      name,
      personality,
      spriteId: 'rival',
      xp: 0,
      level: 1
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#c8c8c8]">
      <Card className="w-full max-w-md border-[6px] border-black pixel-shadow bg-white rounded-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg font-pixel uppercase tracking-tighter">New Rival</CardTitle>
          <div className="h-1 w-full bg-black my-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-4 bg-[#e0f8cf] border-4 border-black">
            <Sprite spriteId="rival" size={140} />
          </div>

          <div className="space-y-3">
            <Label className="font-pixel text-[10px]">THEIR NAME?</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="border-4 border-black font-pixel text-sm rounded-none h-12 focus-visible:ring-0"
              placeholder="NAME"
            />
          </div>

          <div className="space-y-3">
            <Label className="font-pixel text-[10px]">PERSONALITY</Label>
            <RadioGroup 
              value={personality} 
              onValueChange={(v) => setPersonality(v as PersonalityTone)}
              className="grid grid-cols-1 gap-2"
            >
              {(['serious', 'smug', 'funny'] as const).map((p) => (
                <div key={p}>
                  <RadioGroupItem value={p} id={p} className="sr-only" />
                  <Label 
                    htmlFor={p}
                    className={cn(
                      "flex items-center p-3 border-4 border-black cursor-pointer font-pixel text-[8px] transition-all",
                      personality === p ? "bg-black text-white" : "bg-white hover:bg-muted"
                    )}
                  >
                    {personality === p ? "▶ " : "  "}{p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-16 bg-black text-white font-pixel text-sm border-none rounded-none hover:bg-black/80 transition-all"
            onClick={handleSubmit}
          >
            START GAME
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
