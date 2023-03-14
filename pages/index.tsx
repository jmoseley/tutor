import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { useLesson } from "../components/hooks";
import { useState } from "react";

export default function Home() {
  const { conversationParts, start, respond } = useLesson("math", 1);

  const [responseValue, setResponseValue] = useState<string>("");

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      {/* <section className={utilStyles.headingMd}>
        <p>Mr. Tutor</p>
      </section> */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        {/* <h2 className={utilStyles.headingLg}>Blog</h2> */}
        <button onClick={start}>Start</button>
        <br />
        {conversationParts
          .filter(({ role }) => role !== "system")
          .map(({ content }, idx) => (
            <div key={idx}>{content}</div>
          ))}
        <input
          type="text"
          value={responseValue}
          onChange={(e) => setResponseValue(e.target.value)}
        />
        <br />
        <button
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
