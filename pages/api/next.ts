import { NextApiHandler } from "next";
import { ChatCompletionResponseMessage } from "openai";
import { ApiError } from "../../lib/api";
import { complete } from "../../lib/gpt";
import { generatePromptMessages } from "../../lib/lesson";

export type Response =
  | {
      kind: "success";
      response: ChatCompletionResponseMessage;
    }
  | ApiError;

export interface RequestParams {
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

const next: NextApiHandler<Response> = async (req, res) => {
  if (req.method !== "POST") {
    res
      .status(405)
      .json({ kind: "ApiError", code: 405, message: "Method Not Allowed" });
    return;
  }

  const { previousMessages, userId, userName, userResponse, subject, grade } =
    req.body as unknown as RequestParams;

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
    res
      .status(400)
      .json({ kind: "ApiError", code: 400, message: "Bad Request" });
    return;
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

    res.json({ kind: "success", response });
  } catch (e: any) {
    console.log("Error", e?.response?.data || e);
    res
      .status(500)
      .json({ kind: "ApiError", code: 500, message: "Internal Server Error" });
  }
};

export default next;
