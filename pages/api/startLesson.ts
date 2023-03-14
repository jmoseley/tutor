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

interface QueryParams {
  subject: "math" | "english";
  grade: string;
  userId: string;
  userName: string;
}

const startLesson: NextApiHandler<Response> = async (req, res) => {
  const { subject, grade, userId, userName } =
    req.query as unknown as QueryParams;

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
    res
      .status(400)
      .json({ kind: "ApiError", code: 400, message: "Bad Request" });
    return;
  }

  try {
    const response = await complete(
      generatePromptMessages(userName, subject, grade),
      userId
    );

    res.json({ kind: "success", response });
  } catch (e: any) {
    console.error(e?.response?.data || e);
    res
      .status(500)
      .json({ kind: "ApiError", code: 500, message: "Internal Server Error" });
  }
};

export default startLesson;
