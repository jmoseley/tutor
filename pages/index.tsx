import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";
import Date from "../components/date";
import { useLesson } from "../components/hooks";

export default function Home() {
  const { content } = useLesson("math", 1);

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
        {content.map((content, idx) => (
          <div key={idx}>{content}</div>
        ))}
      </section>
    </Layout>
  );
}
