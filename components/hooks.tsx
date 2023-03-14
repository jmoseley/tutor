import axios, { AxiosResponse } from "axios";
import { useCallback, useEffect, useState } from "react";
import { Response as StartLessonResponse } from "../pages/api/startLesson";
import { nanoid } from "nanoid";
import { RequestParams, Response as NextResponse } from "../pages/api/next";

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
