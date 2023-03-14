import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { useLesson } from "../components/hooks";
import { useState } from "react";

export default function Home() {
  const [subject, setSubject] = useState<"math" | "english" | "">("");
  const [grade, setGrade] = useState<-1 | 1 | 2 | 3 | 4 | 5>(-1);
  const { conversationParts, start, respond, loading } = useLesson(
    subject,
    grade
  );

  const [responseValue, setResponseValue] = useState<string>("");

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <select
          disabled={loading}
          onChange={(e) => setSubject(e.target.value as any)}
        >
          <option value={""}>Select a subject</option>
          <option value="math">Math</option>
          <option value="english">English</option>
        </select>
        <br />
        <select
          disabled={loading}
          onChange={(e) => setGrade(parseInt(e.target.value) as any)}
        >
          <option value={"-1"}>Select a grade</option>
          <option value={"1"}>1</option>
          <option value={"2"}>2</option>
          <option value={"3"}>3</option>
          <option value={"4"}>4</option>
          <option value={"5"}>5</option>
        </select>
        <br />
        <button disabled={!subject || grade === -1 || loading} onClick={start}>
          Start
        </button>
        <br />
        {conversationParts
          .filter(({ role }) => role !== "system")
          .map(({ content }, idx) => {
            const parts = content.split("\n");
            return (
              <div key={idx}>
                {parts.map((part, idx) => (
                  <p key={idx}>{part}</p>
                ))}
              </div>
            );
          })}
        {loading && <p>Mr. Tutor is typing...</p>}
        <input
          type="text"
          value={responseValue}
          onChange={(e) => setResponseValue(e.target.value)}
        />
        <br />
        <button
          disabled={!responseValue || loading}
          onClick={() => {
            respond(responseValue);
            setResponseValue("");
          }}
        >
          Respond
        </button>
      </section>
    </Layout>
  );
}
