import { generateObject } from 'ai';
import { z } from 'zod';
import type { ModelId } from '../config/models';
import { type ProviderId, createProviderInstance } from '../config/providers';

const titleSchema = z.object({
    title: z.string(),
});

export const generateTitle = async (
    providerId: ProviderId,
    modelId: ModelId,
    messages: {
        role: 'user' | 'assistant' | 'system';
        content: string;
    }[]
) => {
    const provider = createProviderInstance(providerId);
    const model = provider(modelId);

    const relevantMessages = messages.slice(0, 6);
    const conversationText = relevantMessages
        .map((message) => {
            const truncatedContent =
                message.content.length > 200
                    ? `${message.content.substring(0, 200)}...`
                    : message.content;
            return `${message.role.toUpperCase()}: ${truncatedContent}`;
        })
        .join('\n');

    const result = await generateObject<z.infer<typeof titleSchema>>({
        model,
        schema: titleSchema,
        prompt: `Analyze the following conversation and generate a concise, descriptive title that captures the main topic or purpose.

Requirements:
- 3-8 words maximum
- Focus on the core subject matter or primary question being discussed
- Be specific and informative (avoid generic phrases like "Help with..." or "Question about...")
- Use clear, professional language
- Do not include quotation marks or special formatting
- Generate a title in the language of the conversation

Conversation:
${conversationText}

Generate a title that clearly identifies what this conversation is about:`,
    });

    return result.object.title;
};
