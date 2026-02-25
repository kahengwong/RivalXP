
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sprite } from "./Sprite";
import { Rival, PersonalityTone } from "@/lib/game-types";

interface RivalSetupProps {
  onComplete: (rival: Rival) => void;
}

export function RivalSetup({ onComplete }: RivalSetupProps) {
  const [name, setName] = useState("Blue");
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-4 border-foreground pixel-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline uppercase">Meet Your Rival</CardTitle>
          <p className="text-muted-foreground">Every hero needs a challenge. Define yours.</p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex justify-center">
            <Sprite spriteId="rival" size={160} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rival-name" className="font-headline uppercase">Rival Name</Label>
            <Input 
              id="rival-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="border-2 border-foreground font-headline text-lg"
              placeholder="e.g. Gary"
            />
          </div>

          <div className="space-y-4">
            <Label className="font-headline uppercase">Personality Tone</Label>
            <RadioGroup 
              value={personality} 
              onValueChange={(v) => setPersonality(v as PersonalityTone)}
              className="grid grid-cols-3 gap-2"
            >
              {(['serious', 'smug', 'funny'] as const).map((p) => (
                <div key={p}>
                  <RadioGroupItem value={p} id={p} className="sr-only" />
                  <Label 
                    htmlFor={p}
                    className={cn(
                      "flex items-center justify-center p-3 border-2 border-foreground cursor-pointer font-headline uppercase text-xs transition-all",
                      personality === p ? "bg-primary text-white" : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {p}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full h-14 bg-primary text-xl font-headline uppercase border-4 border-foreground pixel-shadow hover:translate-y-1 transition-all"
            onClick={handleSubmit}
          >
            Begin The Race
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';
