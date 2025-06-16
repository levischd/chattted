import type { ProviderId } from './providers';

export const MODELS = [
    {
        id: 'gemini-2.0-flash-lite',
        name: 'Gemini 2.0 Flash Lite',
        isPremium: false,
        provider: 'google',
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        isPremium: false,
        provider: 'google',
    },
    {
        id: 'gemini-2.5-flash-preview-05-20',
        name: 'Gemini 2.5 Flash',
        isPremium: true,
        provider: 'google',
    },
    {
        id: 'gemini-2.5-pro-preview-06-05',
        name: 'Gemini 2.5 Pro',
        isPremium: true,
        provider: 'google',
    },
    {
        id: 'deepseek-r1-distill-llama-70b',
        name: 'DeepSeek R1 Distill Llama 70B',
        isPremium: true,
        provider: 'groq',
    },
    {
        id: 'llama-3.3-70b-versatile',
        name: 'Llama 3.3 70B',
        isPremium: false,
        provider: 'groq',
    },
    {
        id: 'meta-llama/llama-4-scout-17b-16e-instruct',
        name: 'Llama 4 Scout',
        isPremium: false,
        provider: 'groq',
    },
    {
        id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        name: 'Llama 4 Maverick',
        isPremium: false,
        provider: 'groq',
    },
    {
        id: 'qwen-qwq-32b',
        name: 'Qwen QWQ 32B',
        isPremium: false,
        provider: 'groq',
    },
    {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        isPremium: true,
        provider: 'anthropic',
    },
    {
        id: 'claude-sonnet-4-20250514',
        name: 'Claude 4 Sonnet',
        isPremium: true,
        provider: 'anthropic',
    },
    {
        id: 'claude-opus-4-20250514',
        name: 'Claude 4 Opus',
        isPremium: true,
        provider: 'anthropic',
    },
    {
        id: 'gpt-4o',
        name: 'GPT-4o',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'gpt-4.5-preview',
        name: 'GPT-4.5 Preview',
        isPremium: true,
        provider: 'openai',
    },
    {
        id: 'o3-pro',
        name: 'o3 Pro',
        isPremium: true,
        provider: 'openai',
    },
    {
        id: 'o3',
        name: 'o3',
        isPremium: false,
        provider: 'openai',
    },
    {
        id: 'o4-mini',
        name: 'o4 Mini',
        isPremium: false,
        provider: 'openai',
    },
] as const satisfies readonly {
    id: string;
    name: string;
    isPremium: boolean;
    provider: ProviderId;
}[];

export type Model = (typeof MODELS)[number];
export type ModelId = (typeof MODELS)[number]['id'];
export const DEFAULT_LLM_MODEL_ID =
    'meta-llama/llama-4-maverick-17b-128e-instruct' as const satisfies ModelId;
export const DEFAULT_TITLE_MODEL_ID =
    'meta-llama/llama-4-maverick-17b-128e-instruct' as const satisfies ModelId;
