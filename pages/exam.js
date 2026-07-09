import ExamClient from '@/components/ExamClient';
import questions from '@/data/questions.json';

export default function ExamPage() {
  return <ExamClient questions={questions} mode="exam" />;
}
