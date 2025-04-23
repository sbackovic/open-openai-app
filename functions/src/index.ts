import {onRequest} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {sendPrompt} from "./openai";
import {FieldValue} from "firebase-admin/firestore";

import * as cors from "cors";
import * as fs from "fs";
import * as path from "path";
import * as admin from "firebase-admin";

import {TimeoutError, ValidationError} from "./errors";

admin.initializeApp();

// init DB
const db = admin.firestore();

// define openAI key secret
const openaiApiKey = defineSecret("OPENAI_API_KEY");

const configPath = path.resolve(__dirname, "../config/config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const isLocal = process.env.NODE_ENV === "development";

// CORS setup
let corsHandler;
if (!isLocal) {
  corsHandler = cors.default({
    origin: (origin, callback) => {
      if (config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
  });
} else {
  corsHandler = cors.default({
    origin: true,
  });
}

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

export const logToFirestore =
  async (prompt: string, response: string | null, error: string | null) => {
    try {
      const logRef = db.collection("openai_logs").doc();

      await logRef.set({
        prompt,
        response,
        error,
        timestamp: FieldValue.serverTimestamp(),
      });

      console.log("Request logged to Firestore.");
    } catch (error) {
      console.error("Error logging to Firestore:", error);
    }
  };

export const askOpenAI = onRequest({
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

      const openAiReply = await sendPrompt(prompt);

      await logToFirestore(prompt, openAiReply, null);

      const result: PromptResponse = {
        success: true,
        data: {
          text: openAiReply,
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

        await logToFirestore(request.body.prompt, null, error.message);
      } else {
        const statusCode = (error as { status: number }).status || 500;
        const errorMessage = (error as { message: string }).message || "Internal Server Error";
        const userErrorMessage = "Unable to process your request at the moment.";
        response.status(statusCode).json({
          success: false,
          error: userErrorMessage,
        });

        await logToFirestore(request.body.prompt, null, errorMessage);
      }
    }
  });
})
;
