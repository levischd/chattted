import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { openai } from '@ai-sdk/openai';
import {
    customProvider,
    defaultSettingsMiddleware,
    extractReasoningMiddleware,
    wrapLanguageModel,
} from 'ai';

export const aiProvider = customProvider({
    languageModels: {
        // Google models
        'gemini-2.0-flash-lite': google('gemini-2.0-flash-lite'),
        'gemini-2.0-flash': google('gemini-2.0-flash'),
        'gemini-2.5-flash-preview-05-20': google(
            'gemini-2.5-flash-preview-05-20'
        ),
        'gemini-2.5-pro-preview-06-05': google('gemini-2.5-pro-preview-06-05'),

        // Groq models
        'deepseek-r1-distill-llama-70b': wrapLanguageModel({
            middleware: extractReasoningMiddleware({
                tagName: 'think',
            }),
            model: groq('deepseek-r1-distill-llama-70b'),
        }),
        'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
        'meta-llama/llama-4-scout-17b-16e-instruct': groq(
            'meta-llama/llama-4-scout-17b-16e-instruct'
        ),
        'meta-llama/llama-4-maverick-17b-128e-instruct': groq(
            'meta-llama/llama-4-maverick-17b-128e-instruct'
        ),
        'qwen-qwq-32b': wrapLanguageModel({
            middleware: extractReasoningMiddleware({
                tagName: 'think',
            }),
            model: groq('qwen-qwq-32b'),
        }),

        // Anthropic models
        'claude-3-5-haiku-20241022': anthropic('claude-3-5-haiku-20241022'),
        'claude-sonnet-4-20250514': wrapLanguageModel({
            middleware: defaultSettingsMiddleware({
                settings: {
                    providerMetadata: {
                        anthropic: {
                            thinking: { type: 'enabled', budgetTokens: 5000 },
                        },
                    },
                },
            }),
            model: anthropic('claude-sonnet-4-20250514'),
        }),
        'claude-opus-4-20250514': wrapLanguageModel({
            middleware: defaultSettingsMiddleware({
                settings: {
                    providerMetadata: {
                        anthropic: {
                            thinking: { type: 'enabled', budgetTokens: 8000 },
                        },
                    },
                },
            }),
            model: anthropic('claude-opus-4-20250514'),
        }),

        // OpenAI models
        'gpt-4o': openai('gpt-4o'),
        'gpt-4o-mini': openai('gpt-4o-mini'),
        'gpt-4.1': openai('gpt-4.1'),
        'gpt-4.1-mini': openai('gpt-4.1-mini'),
        'gpt-4.1-nano': openai('gpt-4.1-nano'),
        'gpt-4.5-preview': openai('gpt-4.5-preview'),
        'o3-pro': wrapLanguageModel({
            middleware: extractReasoningMiddleware({
                tagName: 'think',
            }),
            model: openai('o3-pro'),
        }),
        o3: wrapLanguageModel({
            middleware: extractReasoningMiddleware({
                tagName: 'think',
            }),
            model: openai('o3'),
        }),
        'o4-mini': wrapLanguageModel({
            middleware: extractReasoningMiddleware({
                tagName: 'think',
            }),
            model: openai('o4-mini'),
        }),
    },
});

export type ModelId = Parameters<(typeof aiProvider)['languageModel']>[0];

export const models: Record<
    ModelId,
    { name: string; isPremium: boolean; provider: string }
> = {
    // Google models
    'gemini-2.0-flash-lite': {
        name: 'Gemini 2.0 Flash Lite',
        isPremium: false,
        provider: 'google',
    },
    'gemini-2.0-flash': {
        name: 'Gemini 2.0 Flash',
        isPremium: false,
        provider: 'google',
    },
    'gemini-2.5-flash-preview-05-20': {
        name: 'Gemini 2.5 Flash',
        isPremium: true,
        provider: 'google',
    },
    'gemini-2.5-pro-preview-06-05': {
        name: 'Gemini 2.5 Pro',
        isPremium: true,
        provider: 'google',
    },

    // Groq models
    'deepseek-r1-distill-llama-70b': {
        name: 'DeepSeek R1 Distill Llama 70B',
        isPremium: true,
        provider: 'groq',
    },
    'llama-3.3-70b-versatile': {
        name: 'Llama 3.3 70B',
        isPremium: false,
        provider: 'groq',
    },
    'meta-llama/llama-4-scout-17b-16e-instruct': {
        name: 'Llama 4 Scout',
        isPremium: false,
        provider: 'groq',
    },
    'meta-llama/llama-4-maverick-17b-128e-instruct': {
        name: 'Llama 4 Maverick',
        isPremium: false,
        provider: 'groq',
    },
    'qwen-qwq-32b': {
        name: 'Qwen QWQ 32B',
        isPremium: false,
        provider: 'groq',
    },

    // Anthropic models
    'claude-3-5-haiku-20241022': {
        name: 'Claude 3.5 Haiku',
        isPremium: true,
        provider: 'anthropic',
    },
    'claude-sonnet-4-20250514': {
        name: 'Claude 4 Sonnet',
        isPremium: true,
        provider: 'anthropic',
    },
    'claude-opus-4-20250514': {
        name: 'Claude 4 Opus',
        isPremium: true,
        provider: 'anthropic',
    },

    // OpenAI models
    'gpt-4o': {
        name: 'GPT-4o',
        isPremium: false,
        provider: 'openai',
    },
    'gpt-4o-mini': {
        name: 'GPT-4o Mini',
        isPremium: false,
        provider: 'openai',
    },
    'gpt-4.1': {
        name: 'GPT-4.1',
        isPremium: false,
        provider: 'openai',
    },
    'gpt-4.1-mini': {
        name: 'GPT-4.1 Mini',
        isPremium: false,
        provider: 'openai',
    },
    'gpt-4.1-nano': {
        name: 'GPT-4.1 Nano',
        isPremium: false,
        provider: 'openai',
    },
    'gpt-4.5-preview': {
        name: 'GPT-4.5 Preview',
        isPremium: true,
        provider: 'openai',
    },
    'o3-pro': {
        name: 'o3 Pro',
        isPremium: true,
        provider: 'openai',
    },
    o3: {
        name: 'o3',
        isPremium: false,
        provider: 'openai',
    },
    'o4-mini': {
        name: 'o4 Mini',
        isPremium: false,
        provider: 'openai',
    },
};

export const DEFAULT_LLM_MODEL_ID =
    'meta-llama/llama-4-maverick-17b-128e-instruct' as const satisfies ModelId;
export const DEFAULT_TITLE_MODEL_ID =
    'meta-llama/llama-4-maverick-17b-128e-instruct' as const satisfies ModelId;
