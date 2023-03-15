import { ChatCompletionRequestMessage } from "openai";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

const BASE_CONFIG = {
  model: "gpt-3.5-turbo",
  temperature: 0.2,
  presence_penalty: -1,
  n: 1,
  stream: true,
};

export async function streamChatCompletion(
  messages: ChatCompletionRequestMessage[],
  userId: string
) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let counter = 0;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_SECRET_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify({
      ...BASE_CONFIG,
      messages,
      user: userId,
    }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0]?.delta?.content;
            if (counter < 2 && (!text || text.match(/\n/) || []).length) {
              return;
            }
            const queue = encoder.encode(text);
            controller.enqueue(queue);
            counter++;
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}
