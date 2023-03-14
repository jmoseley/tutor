import { NextApiHandler } from "next";
import { ChatCompletionResponseMessage } from "openai";
import { ApiError } from "../../lib/api";
import { complete } from "../../lib/gpt";

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

  const lessonContent = await complete(
    [
      {
        role: "system",
        content: `You are acting as a ${subject} tutor for a child in grade ${grade}. Your goal is to help the child learn the subject and work on practice problems with them. You will introduce the basics of the subject, and then present practice problems to the child.`,
      },
      {
        role: "user",
        content: `Hi my name is ${userName}. I am in grade ${grade}. I am having trouble with ${subject}.`,
        name: userName,
      },
    ],
    userId
  );

  if (!lessonContent) {
    res
      .status(500)
      .json({ kind: "ApiError", code: 500, message: "Internal Server Error" });
    return;
  }

  res.json({ kind: "success", response: lessonContent });
};

export default startLesson;
