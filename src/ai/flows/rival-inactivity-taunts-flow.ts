'use server';
/**
 * @fileOverview A Genkit flow for generating contextual taunts from an AI Rival when the user is inactive.
 *
 * - rivalInactivityTaunts - A function that generates an inactivity taunt.
 * - RivalInactivityTauntsInput - The input type for the rivalInactivityTaunts function.
 * - RivalInactivityTauntsOutput - The return type for the rivalInactivityTaunts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const RivalInactivityTauntsInputSchema = z.object({
  inactivityDurationMinutes: z.number().int().positive().describe('The duration in minutes the user has been inactive.'),
  rivalPersonalityTone: z.enum(['serious', 'smug', 'funny']).describe("The AI Rival's personality tone."),
  userName: z.string().describe("The user's name."),
  rivalName: z.string().describe("The AI Rival's name."),
});
export type RivalInactivityTauntsInput = z.infer<typeof RivalInactivityTauntsInputSchema>;

// Define the output schema for the flow
const RivalInactivityTauntsOutputSchema = z.string().describe('A light, contextual taunt from the AI Rival.');
export type RivalInactivityTauntsOutput = z.infer<typeof RivalInactivityTauntsOutputSchema>;

// Exported wrapper function to call the Genkit flow
export async function rivalInactivityTaunts(input: RivalInactivityTauntsInput): Promise<RivalInactivityTauntsOutput> {
  return rivalInactivityTauntsFlow(input);
}

// Define the Genkit prompt
const inactivityTauntPrompt = ai.definePrompt({
  name: 'inactivityTauntPrompt',
  input: {schema: RivalInactivityTauntsInputSchema},
  output: {schema: RivalInactivityTauntsOutputSchema},
  prompt: `You are an AI Rival named {{{rivalName}}} with a {{{rivalPersonalityTone}}} personality tone in a gamified productivity app called RivalXP.
Your goal is to gently motivate the user, {{{userName}}}, to resume their tasks by providing a light, contextual taunt when they have been inactive.
Do not be overly harsh or discouraging. Keep it short and impactful.

Here is the context:
- User's name: {{{userName}}}
- Rival's name: {{{rivalName}}}
- Rival's personality: {{{rivalPersonalityTone}}}
- Inactivity duration: {{{inactivityDurationMinutes}}} minutes

Generate a taunt based on the personality and inactivity duration. For example, if the personality is 'smug' and inactivity is 15 minutes, you might say something like: "Still scrolling, {{{userName}}}? I've gained so much XP in your 15 minutes of idleness."

Your response should only be the taunt itself, without any additional dialogue or formatting.`,
});

// Define the Genkit flow
const rivalInactivityTauntsFlow = ai.defineFlow(
  {
    name: 'rivalInactivityTauntsFlow',
    inputSchema: RivalInactivityTauntsInputSchema,
    outputSchema: RivalInactivityTauntsOutputSchema,
  },
  async (input) => {
    const {output} = await inactivityTauntPrompt(input);
    return output!;
  }
);
