import axios, { AxiosResponse } from "axios";
import { useCallback, useState } from "react";
import { Response as StartLessonResponse } from "../pages/api/startLesson";
import { nanoid } from "nanoid";
import { RequestParams, Response as NextResponse } from "../pages/api/next";

export const useLesson = (
  subject: "math" | "english",
  grade: number,
  userName = "Bobby"
) => {
  const [userId] = useState<string>(nanoid());

  const [conversationParts, setConversationParts] = useState<
    { role: "system" | "user" | "assistant"; content: string }[]
  >([]);

  const start = useCallback(async () => {
    try {
      const result = await axios.get<
        StartLessonResponse,
        AxiosResponse<StartLessonResponse>
      >(
        `/api/startLesson?subject=${subject}&grade=${grade}&userId=${userId}&userName=${userName}`
      );

      if (result.data.kind === "ApiError") {
        return;
      }

      setConversationParts([...conversationParts, result.data.response]);
    } catch (e) {
      console.error(e);
    }
  }, [userId, userName]);

  const respond = useCallback(
    async (userResponse: string) => {
      try {
        const result = await axios.post<
          NextResponse,
          AxiosResponse<NextResponse>,
          RequestParams
        >("/api/next", {
          userId,
          userResponse,
          userName,
          previousMessages: conversationParts,
          subject,
          grade: grade.toString(),
        });

        if (result.data.kind === "ApiError") {
          return;
        }

        setConversationParts([
          ...conversationParts,
          { role: "user", content: userResponse },
          result.data.response,
        ]);
      } catch (e) {
        console.error(e);
      }
    },
    [userId, conversationParts]
  );

  return { start, conversationParts, respond };
};
