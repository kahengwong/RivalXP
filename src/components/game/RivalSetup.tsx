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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f0f0f0] pattern-bg">
      <Card className="w-full max-w-md border-4 border-black pixel-shadow bg-white rounded-none">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-pixel uppercase leading-loose">New Game</CardTitle>
          <p className="text-xs font-pixel text-muted-foreground mt-2">Identify your Rival.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-center py-4 bg-muted/20 border-2 border-black border-dashed">
            <Sprite spriteId="rival" size={120} />
          </div>

          <div className="space-y-4">
            <Label htmlFor="rival-name" className="font-pixel text-[10px] uppercase">Rival's Name?</Label>
            <Input 
              id="rival-name" 
              value={name} 
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="border-4 border-black font-pixel text-sm rounded-none h-12 focus-visible:ring-0"
              placeholder="NAME"
            />
          </div>

          <div className="space-y-4">
            <Label className="font-pixel text-[10px] uppercase">Personality</Label>
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
                      "flex items-center p-3 border-4 border-black cursor-pointer font-pixel text-[10px] uppercase transition-all",
                      personality === p ? "bg-black text-white" : "bg-white hover:bg-muted"
                    )}
                  >
                    {personality === p ? "> " : "  "}{p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-16 bg-primary text-white font-pixel text-sm uppercase border-4 border-black rounded-none pixel-shadow hover:translate-y-1 hover:pixel-shadow-none transition-all"
            onClick={handleSubmit}
          >
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
