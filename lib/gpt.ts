import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

function getClient() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_SECRET_KEY,
  });

  return new OpenAIApi(configuration);
}

export async function complete(
  messages: ChatCompletionRequestMessage[],
  userId: string
) {
  const client = getClient();

  const response = await client.createChatCompletion({
    ...BASE_CONFIG,
    messages,
    user: userId,
  });

  console.log("data", JSON.stringify(response.data, null, 2));

  if (response.data.choices.length === 0 || !response.data.choices[0].message) {
    throw new Error("No response from OpenAI");
  }

  return response.data.choices[0].message;
}

const BASE_CONFIG = {
  model: "gpt-3.5-turbo-0301",
  temperature: 0.2,
  presence_penalty: -1,
  n: 1,
};
