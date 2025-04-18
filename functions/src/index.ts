import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {OpenAI} from "openai";
import * as cors from "cors";
import {TimeoutError, ValidationError} from "./errors";

const openaiApiKey = defineSecret("OPENAI_API_KEY");

const corsHandler = cors.default({origin: true}); // TODO -> replace

interface PromptRequest {
  prompt: string;
}

interface PromptResponse {
  success: boolean;
  data?: {
    text: string;
  };
  error?: string;
}

export const validatePrompt = (prompt: string): string | null => {
  if (!prompt) {
    throw new ValidationError("Prompt is required in the request body.");
  }

  if (prompt.length > 2000) {
    throw new ValidationError("Prompt must not exceed 2000 characters.");
  }

  return null;
};

export const generateCompletion = onRequest({
    secrets: [openaiApiKey],
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "us-central1",
    minInstances: 0,
    maxInstances: 100,
    concurrency: 80,
  }, async (request, response) => {
    corsHandler(request, response, async () => {
      try {
        if (request.method !== "POST") {
          response.status(405).json({
            success: false,
            error: "Method Not Allowed. Only POST requests are accepted.",
          });
          return;
        }

        const {prompt} = request.body as PromptRequest;

        validatePrompt(prompt);

        // default values - should be configurable
        const model = "gpt-4";
        const maxTokens = 1000;
        const temperature = 0.7;
        const systemMessage = "You are a helpful assistant.";

        const openai = new OpenAI({
          apiKey: openaiApiKey.value(),
        });

        // TODO - implement exponential backoff if necessary
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

        const openAiResponseMessage = openaiResponse.choices[0]?.message?.content || "";

        const result: PromptResponse = {
          success: true,
          data: {
            text: openAiResponseMessage,
          },
        };

        response.status(200).json(result);
      } catch (error: unknown) {
        console.error("Error calling OpenAI API:", error);

        if (error instanceof ValidationError || error instanceof TimeoutError) {
          response.status(error.statusCode).json({
            success: false,
            error: error.message,
          });
        } else {
          const statusCode = (error as { status: number }).status || 500;
          // const errorMessage = (error as { message: string }).message || "Internal Server Error";
          const userErrorMessage = "Unable to process your request at the moment.";

          response.status(statusCode).json({
            success: false,
            error: userErrorMessage,
          });
        }
      }
    });
  })
;

// TODO
//  - auth on cloud function
//  - add rate limiting
//  - retry - exponential backoff
//  - testing
//  - make OpenAI parameters configurable
//  - update docs
