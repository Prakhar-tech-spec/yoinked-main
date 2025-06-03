'use server';
/**
 * @fileOverview Automatically identifies and removes invalid email addresses from a list.
 *
 * - emailErrorAutoClean - A function that cleans invalid email addresses from a list.
 * - EmailErrorAutoCleanInput - The input type for the emailErrorAutoClean function.
 * - EmailErrorAutoCleanOutput - The return type for the emailErrorAutoClean function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailErrorAutoCleanInputSchema = z.object({
  emailList: z.array(z.string()).describe('A list of email addresses to validate.'),
  deliveryStatuses: z
    .array(z.boolean())
    .describe('A list of boolean delivery statuses corresponding to the emailList.'),
});
export type EmailErrorAutoCleanInput = z.infer<typeof EmailErrorAutoCleanInputSchema>;

const EmailErrorAutoCleanOutputSchema = z.object({
  cleanedEmailList: z
    .array(z.string())
    .describe('A list of valid email addresses with invalid ones removed.'),
});
export type EmailErrorAutoCleanOutput = z.infer<typeof EmailErrorAutoCleanOutputSchema>;

export async function emailErrorAutoClean(input: EmailErrorAutoCleanInput): Promise<EmailErrorAutoCleanOutput> {
  return emailErrorAutoCleanFlow(input);
}

const emailErrorAutoCleanFlow = ai.defineFlow(
  {
    name: 'emailErrorAutoCleanFlow',
    inputSchema: EmailErrorAutoCleanInputSchema,
    outputSchema: EmailErrorAutoCleanOutputSchema,
  },
  async input => {
    const cleanedEmailList = input.emailList.filter((_, index) => input.deliveryStatuses[index]);
    return {cleanedEmailList};
  }
);
