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

export const DEFAULT_PROVIDER_ID = 'groq' as const;
