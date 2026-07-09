import ReviewClient from '@/components/ReviewClient';
import questions from '@/data/questions.json';

export default function ReviewPage() {
  return <ReviewClient questions={questions} />;
}
