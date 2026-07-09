'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import QuestionCard from '@/components/QuestionCard';
import { addWrongQuestionId, recordPracticeAnswer } from '@/lib/storage';
import { shuffleQuestionsForSession } from '@/lib/utils';

export default function LawPracticeClient({ law, questions }) {
  const [sessionQuestions, setSessionQuestions] = useState(() => shuffleQuestionsForSession(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});

  const currentQuestion = sessionQuestions[currentIndex];
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : null;
  const done = currentIndex >= sessionQuestions.length;
  const answeredCount = Object.keys(answersMap).length;
  const correctCount = Object.values(answersMap).filter((item) => item.isCorrect).length;

  const progressText = useMemo(
    () => `שאלה ${Math.min(currentIndex + 1, sessionQuestions.length || 1)} מתוך ${sessionQuestions.length}`,
    [currentIndex, sessionQuestions.length],
  );

  if (!questions.length) {
    return (
      <div className="card stack-md">
        <h1>חוק {law.number} — {law.name}</h1>
        <p className="muted">עדיין אין שאלות לחוק הזה.</p>
        <Link href="/laws" className="button primary">חזרה לרשימת החוקים</Link>
      </div>
    );
  }

  const restartPractice = () => {
    setSessionQuestions(shuffleQuestionsForSession(questions));
    setCurrentIndex(0);
    setAnswersMap({});
  };

  if (done) {
    return (
      <div className="stack-lg">
        <section className="card stack-md">
          <h1>סיימת את חוק {law.number}</h1>
          <p className="muted">{law.name}</p>
          <div className="stats-grid compact-grid">
            <div className="card stat-card inset-card">
              <span className="stat-label">נענו</span>
              <strong>{answeredCount}</strong>
            </div>
            <div className="card stat-card inset-card">
              <span className="stat-label">נכונות</span>
              <strong>{correctCount}</strong>
            </div>
            <div className="card stat-card inset-card">
              <span className="stat-label">אחוז</span>
              <strong>{answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0}%</strong>
            </div>
          </div>
          <p className="muted">טעויות שנשמרו לחזרה: {answeredCount - correctCount}</p>
          <div className="cta-grid two-columns">
            <button className="button primary" onClick={restartPractice}>תרגול מחדש</button>
            <Link href="/laws" className="button">חזרה לחוקים</Link>
          </div>
        </section>
      </div>
    );
  }

  const submitAnswer = (index) => {
    if (currentAnswer?.revealed) return;
    const isCorrect = index === currentQuestion.correctIndex;
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selectedIndex: index,
        revealed: true,
        isCorrect,
      },
    }));
    recordPracticeAnswer(isCorrect);
    if (!isCorrect) addWrongQuestionId(currentQuestion.id);
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, sessionQuestions.length));
  };

  const prevQuestion = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const progressPercent = sessionQuestions.length ? Math.round((answeredCount / sessionQuestions.length) * 100) : 0;

  return (
    <div className="stack-lg">
      <section className="card stack-sm">
        <div className="row-between wrap-gap">
          <div>
            <h1>חוק {law.number} — {law.name}</h1>
            <p className="muted">{progressText}</p>
          </div>
          <div className="mini-stats">
            <span>נכון: {correctCount} מתוך {answeredCount} שנענו</span>
          </div>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
      </section>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={currentAnswer?.selectedIndex ?? null}
        onSelect={submitAnswer}
        revealAnswer={Boolean(currentAnswer?.revealed)}
      />

      {currentAnswer?.revealed ? (
        <section className="card stack-sm">
          <div className={`feedback-banner ${currentAnswer.isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            {currentAnswer.isCorrect ? 'נכון' : 'לא נכון'}
          </div>
          <p>{currentQuestion.explanation}</p>
        </section>
      ) : null}

      <div className="row-between wrap-gap">
        <button className="button" onClick={prevQuestion} disabled={currentIndex === 0}>שאלה קודמת</button>
        <button className="button primary" onClick={nextQuestion} disabled={!currentAnswer?.revealed}>שאלה הבאה</button>
      </div>
    </div>
  );
}
