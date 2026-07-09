import LawPracticeClient from '@/components/LawPracticeClient';
import questions from '@/data/questions.json';
import { LAWS } from '@/lib/constants';

export default function LawNumberPage({ lawMeta, lawQuestions }) {
  return <LawPracticeClient law={lawMeta} questions={lawQuestions} />;
}

export async function getStaticPaths() {
  return {
    paths: LAWS.map((law) => ({ params: { lawNumber: String(law.number) } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const numericLaw = Number(params.lawNumber);
  const lawMeta = LAWS.find((law) => law.number === numericLaw) || null;
  const lawQuestions = questions.filter((q) => q.law === numericLaw);

  if (!lawMeta) {
    return { notFound: true };
  }

  return {
    props: {
      lawMeta,
      lawQuestions,
    },
  };
}
