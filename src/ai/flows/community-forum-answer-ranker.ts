'use server';
/**
 * @fileOverview Ranks community forum answers based on content and community feedback.
 *
 * - rankAnswers - A function to rank answers to a community forum question.
 * - RankAnswersInput - The input type for the rankAnswers function.
 * - RankAnswersOutput - The return type for the rankAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RankAnswersInputSchema = z.object({
  question: z.string().describe('The question being answered in the forum.'),
  answers: z.array(
    z.object({
      answerText: z.string().describe('The text of the answer.'),
      upvotes: z.number().describe('The number of upvotes the answer has received.'),
      comments: z.array(z.string()).describe('Comments on the answer.'),
    })
  ).describe('An array of answers to rank.'),
});
export type RankAnswersInput = z.infer<typeof RankAnswersInputSchema>;

const RankAnswersOutputSchema = z.array(
  z.object({
    answerText: z.string().describe('The text of the answer.'),
    rank: z.number().describe('The rank of the answer, lower is better.'),
    reason: z.string().describe('The reason for the ranking.'),
  })
);
export type RankAnswersOutput = z.infer<typeof RankAnswersOutputSchema>;

export async function rankAnswers(input: RankAnswersInput): Promise<RankAnswersOutput> {
  return rankAnswersFlow(input);
}

const rankAnswersPrompt = ai.definePrompt({
  name: 'rankAnswersPrompt',
  input: {schema: RankAnswersInputSchema},
  output: {schema: RankAnswersOutputSchema},
  prompt: `You are an expert at evaluating answers in an online forum.

  Given the following question:
  {{question}}

  And the following answers:
  {{#each answers}}
  -- Answer {{@index}} --
  Text: {{answerText}}
  Upvotes: {{upvotes}}
  Comments: {{#each comments}} - {{this}} {{/each}}
  -- End Answer {{@index}} --
  {{/each}}

  Rank the answers from best to worst, and provide a reason for each ranking.
  The answers should be returned in a JSON array, with the best answer first and worst answer last.
  Each answer in the array should have the answerText, rank, and reason fields populated.
  The rank should be a number, with 1 being the best.
  The reason should be a short explanation of why the answer was ranked as it was.

  Ensure the answerText in the output matches the answerText in the input.
  `,
});

const rankAnswersFlow = ai.defineFlow(
  {
    name: 'rankAnswersFlow',
    inputSchema: RankAnswersInputSchema,
    outputSchema: RankAnswersOutputSchema,
  },
  async input => {
    const {output} = await rankAnswersPrompt(input);
    return output!;
  }
);
