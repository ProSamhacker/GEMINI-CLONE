import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

export const MODELS = {
  FLASH: 'gemini-2.0-flash-exp',
  PRO: 'gemini-exp-1206'
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

export function getGeminiModel(modelType: ModelType) {
  return genAI.getGenerativeModel({ model: modelType });
}

export async function analyzeImage(imageData: string, prompt: string, modelType: ModelType = MODELS.PRO) {
  const model = getGeminiModel(modelType);
  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageData,
        mimeType: 'image/jpeg',
      },
    },
  ]);
  return result.response.text();
}

export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  modelType: ModelType = MODELS.FLASH
) {
  const model = getGeminiModel(modelType);
  const chat = model.startChat({
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessageStream(lastMessage.content);
  return result.stream;
}
