'use server';

/**
 * @fileOverview An AI agent that identifies the backend technology of an API.
 *
 * - identifyBackendTechnology - A function that identifies the backend technology of an API.
 * - IdentifyBackendTechnologyInput - The input type for the identifyBackendTechnology function.
 * - IdentifyBackendTechnologyOutput - The return type for the identifyBackendTechnology function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyBackendTechnologyInputSchema = z.object({
  requestPayload: z.string().describe('The request payload of the API call.'),
  responsePayload: z.string().describe('The response payload of the API call.'),
});
export type IdentifyBackendTechnologyInput = z.infer<typeof IdentifyBackendTechnologyInputSchema>;

const IdentifyBackendTechnologyOutputSchema = z.object({
  backendTechnology: z.string().describe('The identified backend technology of the API.'),
});
export type IdentifyBackendTechnologyOutput = z.infer<typeof IdentifyBackendTechnologyOutputSchema>;

export async function identifyBackendTechnology(input: IdentifyBackendTechnologyInput): Promise<IdentifyBackendTechnologyOutput> {
  return identifyBackendTechnologyFlow(input);
}

const identifyBackendTechnologyPrompt = ai.definePrompt({
  name: 'identifyBackendTechnologyPrompt',
  input: {schema: IdentifyBackendTechnologyInputSchema},
  output: {schema: IdentifyBackendTechnologyOutputSchema},
  prompt: `You are an expert in identifying backend technologies used by APIs.

  Analyze the request and response payloads provided to determine the backend technology used. Consider factors such as data formats, common frameworks, and architectural patterns.

  Request Payload: {{{requestPayload}}}
  Response Payload: {{{responsePayload}}}

  Based on the request and response payloads, identify the backend technology used by the API.
  Return the backend technology in the following format:
  {
    "backendTechnology": "<backend_technology>"
  }`,
});

const identifyBackendTechnologyFlow = ai.defineFlow(
  {
    name: 'identifyBackendTechnologyFlow',
    inputSchema: IdentifyBackendTechnologyInputSchema,
    outputSchema: IdentifyBackendTechnologyOutputSchema,
  },
  async input => {
    const {output} = await identifyBackendTechnologyPrompt(input);
    return output!;
  }
);
