'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import QuestionCard from '@/components/QuestionCard';
import {
  addWrongQuestionId,
  getIncludeAdvanced,
  recordPracticeAnswer,
  setIncludeAdvanced,
} from '@/lib/storage';
import {
  filterQuestionsByAudience,
  shuffleQuestionsForSession,
} from '@/lib/utils';

export default function LawPracticeClient({ law, questions }) {
  const [includeAdvanced, setIncludeAdvancedState] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});

  const availableQuestions = useMemo(
    () => filterQuestionsByAudience(questions, includeAdvanced),
    [questions, includeAdvanced],
  );

  useEffect(() => {
    const savedPreference = getIncludeAdvanced();

    setIncludeAdvancedState(savedPreference);
    setSessionQuestions(
      shuffleQuestionsForSession(
        filterQuestionsByAudience(
          questions,
          savedPreference,
        ),
      ),
    );
    setSettingsLoaded(true);
  }, [questions]);

  const currentQuestion = sessionQuestions[currentIndex];

  const currentAnswer = currentQuestion
    ? answersMap[currentQuestion.id]
    : null;

  const done =
    settingsLoaded &&
    sessionQuestions.length > 0 &&
    currentIndex >= sessionQuestions.length;

  const answeredCount = Object.keys(answersMap).length;

  const correctCount = Object.values(answersMap).filter(
    (item) => item.isCorrect,
  ).length;

  const progressText = useMemo(
    () =>
      `שאלה ${Math.min(
        currentIndex + 1,
        sessionQuestions.length || 1,
      )} מתוך ${sessionQuestions.length}`,
    [currentIndex, sessionQuestions.length],
  );

  const resetSession = (
    advancedPreference = includeAdvanced,
  ) => {
    const filteredQuestions = filterQuestionsByAudience(
      questions,
      advancedPreference,
    );

    setSessionQuestions(
      shuffleQuestionsForSession(filteredQuestions),
    );
    setCurrentIndex(0);
    setAnswersMap({});
  };

  const handleAudienceChange = (event) => {
    const nextValue = event.target.checked;

    setIncludeAdvancedState(nextValue);
    setIncludeAdvanced(nextValue);
    resetSession(nextValue);
  };

  if (!questions.length) {
    return (
      <div className="card stack-md">
        <h1>
          חוק {law.number} — {law.name}
        </h1>

        <p className="muted">
          עדיין אין שאלות לחוק הזה.
        </p>

        <Link
          href="/laws"
          className="button primary"
        >
          חזרה לרשימת החוקים
        </Link>
      </div>
    );
  }

  if (!settingsLoaded) {
    return (
      <section className="card stack-md">
        <p className="muted">
          טוען את הגדרות התרגול...
        </p>
      </section>
    );
  }

  if (!availableQuestions.length) {
    return (
      <div className="stack-lg">
        <section className="card stack-md">
          <h1>
            חוק {law.number} — {law.name}
          </h1>

          <p className="muted">
            אין שאלות רגילות לחוק הזה. אפשר להפעיל
            שאלות מתקדמות.
          </p>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={includeAdvanced}
              onChange={handleAudienceChange}
            />

            <span
              className="toggle-control"
              aria-hidden="true"
            />

            <span>
              כלול גם שאלות מתקדמות
            </span>
          </label>
        </section>
      </div>
    );
  }

  const restartPractice = () => {
    resetSession();
  };

  if (done) {
    return (
      <div className="stack-lg">
        <section className="card stack-md">
          <h1>
            סיימת את חוק {law.number}
          </h1>

          <p className="muted">
            {law.name}
          </p>

          <div className="stats-grid compact-grid">
            <div className="card stat-card inset-card">
              <span className="stat-label">
                נענו
              </span>

              <strong>
                {answeredCount}
              </strong>
            </div>

            <div className="card stat-card inset-card">
              <span className="stat-label">
                נכונות
              </span>

              <strong>
                {correctCount}
              </strong>
            </div>

            <div className="card stat-card inset-card">
              <span className="stat-label">
                אחוז
              </span>

              <strong>
                {answeredCount
                  ? Math.round(
                      (correctCount / answeredCount) *
                        100,
                    )
                  : 0}
                %
              </strong>
            </div>
          </div>

          <p className="muted">
            טעויות שנשמרו לחזרה:{' '}
            {answeredCount - correctCount}
          </p>

          <p className="muted small-text">
            מצב שאלות:{' '}
            {includeAdvanced
              ? 'רגילות ומתקדמות'
              : 'רגילות בלבד'}
          </p>

          <div className="cta-grid two-columns">
            <button
              className="button primary"
              onClick={restartPractice}
            >
              תרגול מחדש
            </button>

            <Link
              href="/laws"
              className="button"
            >
              חזרה לחוקים
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const submitAnswer = (index) => {
    if (
      !currentQuestion ||
      currentAnswer?.revealed
    ) {
      return;
    }

    const isCorrect =
      index === currentQuestion.correctIndex;

    setAnswersMap((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        selectedIndex: index,
        revealed: true,
        isCorrect,
      },
    }));

    recordPracticeAnswer(isCorrect);

    if (!isCorrect) {
      addWrongQuestionId(
        currentQuestion.id,
      );
    }
  };

  const nextQuestion = () => {
    setCurrentIndex((previous) =>
      Math.min(
        previous + 1,
        sessionQuestions.length,
      ),
    );
  };

  const previousQuestion = () => {
    setCurrentIndex((previous) =>
      Math.max(previous - 1, 0),
    );
  };

  const progressPercent =
    sessionQuestions.length
      ? Math.round(
          (answeredCount /
            sessionQuestions.length) *
            100,
        )
      : 0;

  return (
    <div className="stack-lg">
      <section className="card stack-sm">
        <div className="row-between wrap-gap">
          <div>
            <h1>
              חוק {law.number} — {law.name}
            </h1>

            <p className="muted">
              {progressText}
            </p>
          </div>

          <div className="mini-stats">
            <span>
              נכון: {correctCount} מתוך{' '}
              {answeredCount} שנענו
            </span>
          </div>
        </div>

        <div className="row-between wrap-gap practice-settings-row">
          <div className="question-count">
            בתרגול הזה:{' '}
            <strong>
              {sessionQuestions.length}
            </strong>{' '}
            שאלות
          </div>

          <label className="toggle-row">
            <input
              type="checkbox"
              checked={includeAdvanced}
              onChange={handleAudienceChange}
            />

            <span
              className="toggle-control"
              aria-hidden="true"
            />

            <span>
              כלול גם שאלות מתקדמות
            </span>
          </label>
        </div>

        <p className="muted small-text">
          שינוי הרמה מתחיל את התרגול מחדש.
        </p>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </section>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={
          currentAnswer?.selectedIndex ?? null
        }
        onSelect={submitAnswer}
        revealAnswer={Boolean(
          currentAnswer?.revealed,
        )}
      />

      {currentAnswer?.revealed ? (
        <section className="card stack-sm">
          <div
            className={`feedback-banner ${
              currentAnswer.isCorrect
                ? 'feedback-correct'
                : 'feedback-wrong'
            }`}
          >
            {currentAnswer.isCorrect
              ? 'נכון'
              : 'לא נכון'}
          </div>

          <p>
            {currentQuestion.explanation}
          </p>
        </section>
      ) : null}

      <div className="row-between wrap-gap">
        <button
          className="button"
          onClick={previousQuestion}
          disabled={currentIndex === 0}
        >
          שאלה קודמת
        </button>

        <button
          className="button primary"
          onClick={nextQuestion}
          disabled={
            !currentAnswer?.revealed
          }
        >
          שאלה הבאה
        </button>
      </div>
    </div>
  );
}