import { ChatCompletionResponseMessage } from "openai";
import { ApiError } from "../../lib/api";
import { complete } from "../../lib/gpt";
import { generatePromptMessages } from "../../lib/lesson";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

export type Response =
  | {
      kind: "success";
      response: ChatCompletionResponseMessage;
    }
  | ApiError;

export interface RequestInput {
  previousMessages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  userId: string;
  userName: string;
  userResponse: string;
  subject: "math" | "english";
  grade: string;
}

const next = async (req: NextRequest, context: NextFetchEvent) => {
  if (req.method !== "POST") {
    return NextResponse.json(
      { kind: "ApiError", code: 405, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  const { previousMessages, userId, userName, userResponse, subject, grade } =
    (await req.json()) as RequestInput;

  if (
    typeof userId !== "string" ||
    typeof userName !== "string" ||
    typeof userResponse !== "string" ||
    typeof subject !== "string" ||
    typeof grade !== "string" ||
    !Array.isArray(previousMessages) ||
    previousMessages.some(
      (message) =>
        typeof message.role !== "string" ||
        typeof message.content !== "string" ||
        (message.role !== "system" &&
          message.role !== "user" &&
          message.role !== "assistant")
    )
  ) {
    console.log("Bad Request", {
      previousMessages,
      userId,
      userName,
      userResponse,
    });
    return NextResponse.json(
      { kind: "ApiError", code: 400, message: "Bad Request" },
      { status: 400 }
    );
  }

  try {
    const response = await complete(
      [
        ...generatePromptMessages(userName, subject, grade),
        ...previousMessages,
        {
          role: "user",
          content: userResponse,
          name: userName,
        },
      ],
      userId
    );

    return NextResponse.json({ kind: "success", response });
  } catch (e: any) {
    console.log("Error", e?.response?.data || e);
    return NextResponse.json(
      { kind: "ApiError", code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const config = {
  runtime: "edge",
};

export default next;
