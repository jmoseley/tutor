import axios, { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import {
  Response as StartLessonResponse,
  RequestInput as StartLessonRequestInput,
} from "../pages/api/startLesson";
import { nanoid } from "nanoid";
import {
  RequestInput as NextRequestInput,
  Response as NextResponse,
} from "../pages/api/next";

export const useLesson = (
  subject: "math" | "english" | "",
  grade: 1 | 2 | 3 | 4 | 5 | -1,
  userName = "Bobby"
) => {
  const [userId] = useState<string>(nanoid());
  const [loading, setLoading] = useState<boolean>(false);

  const [conversationParts, setConversationParts] = useState<
    { role: "system" | "user" | "assistant"; content: string }[]
  >([]);

  const start = useCallback(async () => {
    if (!subject || grade === -1) {
      return;
    }

    try {
      setLoading(true);
      const body: StartLessonRequestInput = {
        userId,
        userName,
        subject,
        grade: grade.toString(),
      };
      const result = await fetch("/api/startLesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (result.status !== 200) {
        throw new Error("Something went wrong");
      }
      setLoading(false);

      let response = "";
      await readStream(result, (text) => {
        response = response + text;
        setConversationParts([{ role: "assistant", content: response }]);
      });
    } catch (e) {
      setConversationParts([
        ...conversationParts,
        {
          role: "system",
          content: "Something went wrong. Please try again.",
        },
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [userId, userName, subject, grade]);

  const respond = useCallback(
    async (userResponse: string) => {
      if (!subject || grade === -1) {
        return;
      }

      try {
        const newConversationParts = [
          ...conversationParts,
          { role: "user" as const, content: userResponse },
        ];
        setConversationParts(newConversationParts);

        setLoading(true);
        const body: NextRequestInput = {
          userId,
          userResponse,
          userName,
          previousMessages: conversationParts,
          subject,
          grade: grade.toString(),
        };
        const result = await fetch("/api/next", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
        if (result.status !== 200) {
          throw new Error("Something went wrong");
        }
        setLoading(false);

        let response = "";
        await readStream(result, (text) => {
          response = response + text;
          setConversationParts([
            ...newConversationParts,
            { role: "assistant", content: response },
          ]);
        });
      } catch (e) {
        setConversationParts([
          ...conversationParts,
          {
            role: "system",
            content: "Something went wrong. Please try again.",
          },
        ]);
        console.error(e);
      } finally {
      }
    },
    [userId, conversationParts, subject, grade]
  );

  return { start, conversationParts, respond, loading };
};

async function readStream(response: Response, onText: (text: string) => void) {
  const data = response.body;
  if (!data) {
    return;
  }
  const reader = data.getReader();
  const decoder = new TextDecoder();
  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    onText(chunkValue);
  }
}
