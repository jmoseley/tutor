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
      const result = await axios.post<
        StartLessonResponse,
        AxiosResponse<StartLessonResponse>,
        StartLessonRequestInput
      >(`/api/startLesson`, {
        userId,
        userName,
        subject,
        grade: grade.toString(),
      });

      if (result.data.kind === "ApiError") {
        setConversationParts([
          ...conversationParts,
          { role: "system", content: `Error: ${result.data.message}` },
        ]);
        return;
      }

      setConversationParts([...conversationParts, result.data.response]);
    } catch (e) {
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
        const result = await axios.post<
          NextResponse,
          AxiosResponse<NextResponse>,
          NextRequestInput
        >("/api/next", {
          userId,
          userResponse,
          userName,
          previousMessages: conversationParts,
          subject,
          grade: grade.toString(),
        });

        if (result.data.kind === "ApiError") {
          setConversationParts([
            ...conversationParts,
            { role: "system", content: `Error: ${result.data.message}` },
          ]);
          return;
        }

        setConversationParts([...newConversationParts, result.data.response]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [userId, conversationParts, subject, grade]
  );

  return { start, conversationParts, respond, loading };
};
