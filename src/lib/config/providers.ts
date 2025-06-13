import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import { createOpenAI } from '@ai-sdk/openai';

export const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
  },
  {
    id: 'groq',
    name: 'Groq',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
  },
  {
    id: 'openai',
    name: 'OpenAI',
  },
] as const;

export type Provider = (typeof PROVIDERS)[number];
export type ProviderId = (typeof PROVIDERS)[number]['id'];

export const DEFAULT_PROVIDER_ID = 'google' as const;

export function createProviderInstance(
  provider: (typeof PROVIDERS)[number]['id']
) {
  switch (provider) {
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_API_KEY,
      });
    case 'groq':
      return createGroq({
        apiKey: process.env.GROQ_API_KEY,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    case 'openai':
      return createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
