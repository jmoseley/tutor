import axios from "axios";
import { useEffect, useState } from "react";
import { Response } from "../pages/api/startLesson";
import { nanoid } from "nanoid";

export const useLesson = (subject: "math" | "english", grade: number) => {
  const [userId] = useState<string>(nanoid());

  const [content, setContent] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const result = await axios.get<{}, { data: Response }>(
        `/api/startLesson?subject=${subject}&grade=${grade}&userId=${userId}&userName=child1`
      );

      console.log("start lesson result", result);

      if (result.data.kind === "ApiError") {
        return;
      }

      setContent([...content, result.data.response.content]);
    })();
  }, []);

  return { content };
};
