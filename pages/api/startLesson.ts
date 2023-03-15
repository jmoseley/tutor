import { ChatCompletionResponseMessage } from "openai";
import { ApiError } from "../../lib/api";
import { streamChatCompletion } from "../../lib/gpt";
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
  subject: "math" | "english";
  grade: string;
  userId: string;
  userName: string;
}

const startLesson = async (req: NextRequest, context: NextFetchEvent) => {
  if (req.method !== "POST") {
    return NextResponse.json(
      { kind: "ApiError", code: 405, message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  const { subject, grade, userId, userName } =
    (await req.json()) as RequestInput;

  if (
    typeof subject !== "string" ||
    typeof grade !== "string" ||
    !grade.match(/^\d+$/) ||
    !["math", "english"].includes(subject) ||
    typeof userId !== "string" ||
    typeof userName !== "string" ||
    (subject !== "math" && subject !== "english")
  ) {
    console.log("Bad Request", { subject, grade, userId, userName });
    return NextResponse.json(
      { kind: "ApiError", code: 400, message: "Bad Request" },
      { status: 400 }
    );
  }

  try {
    const stream = await streamChatCompletion(
      generatePromptMessages(userName, subject, grade),
      userId
    );

    return new Response(stream);
  } catch (e: any) {
    console.error(e?.response?.data || e);
    return NextResponse.json(
      { kind: "ApiError", code: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
};

export const config = {
  runtime: "edge",
};

export default startLesson;
