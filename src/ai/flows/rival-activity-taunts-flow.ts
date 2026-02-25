'use server';
/**
 * @fileOverview This flow generates personality-driven remarks from an AI Rival
 * when the user completes a task.
 *
 * - rivalActivityTauntsFlow - A function that generates a taunt based on rival personality and task completion.
 * - RivalActivityTauntsInput - The input type for the rivalActivityTauntsFlow function.
 * - RivalActivityTauntsOutput - The return type for the rivalActivityTauntsFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RivalActivityTauntsInputSchema = z.object({
  rivalPersonality: z
    .enum(['serious', 'smug', 'funny'])
    .describe('The personality tone of the AI Rival.'),
  taskTitle: z.string().describe('The title of the task the user just completed.'),
});
export type RivalActivityTauntsInput = z.infer<typeof RivalActivityTauntsInputSchema>;

const RivalActivityTauntsOutputSchema = z.object({
  taunt: z.string().describe('A personality-driven remark from the AI Rival upon task completion.'),
});
export type RivalActivityTauntsOutput = z.infer<typeof RivalActivityTauntsOutputSchema>;

const rivalActivityTauntsPrompt = ai.definePrompt({
  name: 'rivalActivityTauntsPrompt',
  input: { schema: RivalActivityTauntsInputSchema },
  output: { schema: RivalActivityTauntsOutputSchema },
  prompt: `You are an AI Rival in a gamified productivity app. The user has just completed a task.
Your personality is: {{{rivalPersonality}}}.
Generate a short, personality-driven remark or taunt related to the user completing the task titled "{{{taskTitle}}}".
Make it concise and in character. Do not be overly encouraging or friendly. Focus on the competition.

Examples:
If personality is 'smug' and task is 'Study calculus': "Heh, finally got around to 'Study calculus', did we? My XP counter barely noticed."
If personality is 'serious' and task is 'Gym': "'Gym' complete. A small step. I've been active for hours."
If personality is 'funny' and task is 'Drink 8 glasses of water': "Wow, 'Drink 8 glasses of water'? Breaking records over here. I just leveled up twice. Just saying."
`,
});

const rivalActivityTauntsFlow = ai.defineFlow(
  {
    name: 'rivalActivityTauntsFlow',
    inputSchema: RivalActivityTauntsInputSchema,
    outputSchema: RivalActivityTauntsOutputSchema,
  },
  async (input) => {
    const { output } = await rivalActivityTauntsPrompt(input);
    return output!;
  }
);

export async function generateRivalActivityTaunt(
  input: RivalActivityTauntsInput
): Promise<RivalActivityTauntsOutput> {
  return rivalActivityTauntsFlow(input);
}
