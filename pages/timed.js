import ExamClient from '@/components/ExamClient';
import questions from '@/data/questions.json';

export default function TimedPage() {
  return <ExamClient questions={questions} mode="timed" />;
}
