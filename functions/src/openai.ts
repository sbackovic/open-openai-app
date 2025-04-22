// openai.ts
import {OpenAI} from "openai";
import {defineSecret} from "firebase-functions/params";

const openaiApiKey = defineSecret("OPENAI_API_KEY");

export const sendPrompt = async (prompt: string) => {
  const model = "gpt-4o-mini";
  const maxTokens = 1000;
  const temperature = 0.7;
  const systemMessage = "You are a helpful assistant.";

  const openai = new OpenAI({
    apiKey: openaiApiKey.value(),
  });

  const openaiResponse = await openai.chat.completions.create({
    model,
    messages: [
      {role: "system", content: systemMessage},
      {role: "user", content: prompt},
    ],
    max_tokens: maxTokens,
    temperature,
    response_format: {type: "text"},
  });

  return openaiResponse.choices[0]?.message?.content || "";
};
