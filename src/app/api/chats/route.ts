// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { streamChat, MODELS } from '../../../lib/gemini/client';
import { addMessage } from '../../../lib/firebase/firestore';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { chatId, message, model, files, history } = await req.json();

    // Prepare context with file information
    let contextMessage = message;
    if (files && files.length > 0) {
      const fileContext = files.map((f: any) =>
        `[Attached file: ${f.name} (${f.type})]`
      ).join('\n');
      contextMessage = `${fileContext}\n\n${message}`;
    }

    // Build message history for context
    const messages = [
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: contextMessage },
    ];

    const modelType = model === 'pro' ? MODELS.PRO : MODELS.FLASH;
    const stream = await streamChat(messages, modelType);

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          for await (const chunk of stream) {
            const text = chunk.text();
            fullResponse += text;

            const data = JSON.stringify({ text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Save message to Firestore after streaming completes
          await addMessage(chatId, 'user', message, undefined, files);
          await addMessage(chatId, 'assistant', fullResponse, modelType);

          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
