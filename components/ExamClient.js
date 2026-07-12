'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import QuestionCard from '@/components/QuestionCard';
import {
  addWrongQuestionId,
  getIncludeAdvanced,
  recordCompletedExam,
  recordExamSession,
  setIncludeAdvanced,
} from '@/lib/storage';
import {
  clampNumber,
  filterQuestionsByAudience,
  pickRandomQuestions,
  shuffleQuestionsForSession,
} from '@/lib/utils';

const EXAM_SIZE = 20;
const DEFAULT_TIME = 30;
const QUICK_TIMERS = [7, 12, 20, 30];

export default function ExamClient({ questions, mode }) {
  const [started, setStarted] = useState(false);
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIME);
  const [finished, setFinished] = useState(false);
  const [customTime, setCustomTime] = useState(String(DEFAULT_TIME));
  const [includeAdvanced, setIncludeAdvancedState] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const currentQuestion = examQuestions[currentIndex];
  const isTimed = mode === 'timed';
  const selectedTime = clampNumber(customTime, 5, 30, DEFAULT_TIME);

  useEffect(() => {
    setIncludeAdvancedState(getIncludeAdvanced());
    setSettingsLoaded(true);
  }, []);

  const availableQuestions = useMemo(
    () => filterQuestionsByAudience(questions, includeAdvanced),
    [questions, includeAdvanced],
  );

  const results = useMemo(
    () => summarizeResults(examQuestions, answersMap),
    [examQuestions, answersMap],
  );

  const finishExam = useCallback(() => {
    setFinished((alreadyFinished) => {
      if (alreadyFinished) return alreadyFinished;

      const finalResults = summarizeResults(examQuestions, answersMap);

      recordExamSession(finalResults.total, finalResults.correct);

      finalResults.wrongItems.forEach((item) =>
        addWrongQuestionId(item.id),
      );

      recordCompletedExam({
        mode,
        score: finalResults.correct,
        total: finalResults.total,
        percent: finalResults.percent,
      });

      return true;
    });
  }, [answersMap, examQuestions, mode]);

  useEffect(() => {
    if (
      started &&
      !finished &&
      currentIndex >= examQuestions.length &&
      examQuestions.length > 0
    ) {
      finishExam();
    }
  }, [
    currentIndex,
    started,
    finished,
    examQuestions.length,
    finishExam,
  ]);

  useEffect(() => {
    if (!started || finished || !isTimed || !currentQuestion) return;

    setSelectedIndex(null);
    setSecondsLeft(selectedTime);

    const interval = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(interval);

          setAnswersMap((current) => ({
            ...current,
            [currentQuestion.id]: {
              selectedIndex: null,
              timedOut: true,
              submitted: true,
            },
          }));

          setCurrentIndex((index) => index + 1);

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [
    started,
    finished,
    isTimed,
    currentQuestion,
    selectedTime,
  ]);

  useEffect(() => {
    if (!currentQuestion || isTimed) return;

    setSelectedIndex(
      answersMap[currentQuestion.id]?.selectedIndex ?? null,
    );
  }, [currentIndex, currentQuestion, answersMap, isTimed]);

  const handleAudienceChange = (event) => {
    const nextValue = event.target.checked;

    setIncludeAdvancedState(nextValue);
    setIncludeAdvanced(nextValue);
  };

  const startExam = () => {
    const picked = pickRandomQuestions(
      availableQuestions,
      EXAM_SIZE,
    );

    setExamQuestions(shuffleQuestionsForSession(picked));
    setStarted(true);
    setCurrentIndex(0);
    setSelectedIndex(null);
    setAnswersMap({});
    setFinished(false);
    setSecondsLeft(selectedTime);
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);

    if (!currentQuestion || isTimed) return;

    setAnswersMap((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        ...previous[currentQuestion.id],
        selectedIndex: index,
        timedOut: false,
        submitted:
          previous[currentQuestion.id]?.submitted ?? false,
      },
    }));
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    setAnswersMap((previous) => ({
      ...previous,
      [currentQuestion.id]: {
        selectedIndex,
        timedOut: false,
        submitted: true,
      },
    }));

    setCurrentIndex((previous) => previous + 1);
    setSelectedIndex(null);
  };

  const handlePrevious = () => {
    if (isTimed) return;

    const previousIndex = Math.max(currentIndex - 1, 0);
    const previousQuestion = examQuestions[previousIndex];

    setCurrentIndex(previousIndex);

    setSelectedIndex(
      previousQuestion
        ? answersMap[previousQuestion.id]?.selectedIndex ?? null
        : null,
    );
  };

  const progressPercent = examQuestions.length
    ? Math.round((currentIndex / examQuestions.length) * 100)
    : 0;

  if (!started) {
    return (
      <section className="card stack-md">
        <h1>
          {isTimed ? 'מבחן לחץ זמן' : 'מבחן אקראי'}
        </h1>

        <div className="stack-xs muted">
          <p>
            {isTimed
              ? '20 שאלות'
              : '20 שאלות מכל המאגר שנבחר'}
          </p>

          <p>
            {isTimed
              ? 'בחר זמן בין 5 ל־30 שניות לכל שאלה'
              : 'בלי הגבלת זמן'}
          </p>

          <p>
            {isTimed
              ? 'אם הזמן נגמר — השאלה נחשבת טעות'
              : 'התוצאה תופיע בסוף'}
          </p>
        </div>

        <div className="card inset-card stack-sm audience-settings">
          <div className="row-between wrap-gap">
            <div className="stack-xs">
              <strong>רמת השאלות</strong>

              <span className="muted small-text">
                כברירת מחדל מוצגות שאלות רגילות בלבד.
              </span>
            </div>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={includeAdvanced}
                onChange={handleAudienceChange}
                disabled={!settingsLoaded}
              />

              <span
                className="toggle-control"
                aria-hidden="true"
              />

              <span>כלול גם שאלות מתקדמות</span>
            </label>
          </div>

          <div className="question-count">
            במאגר שנבחר:{' '}
            <strong>{availableQuestions.length}</strong> שאלות
          </div>
        </div>

        {isTimed ? (
          <div className="card inset-card timer-settings stack-sm">
            <div className="stack-xs">
              <label htmlFor="custom-timer">
                זמן לכל שאלה
              </label>

              <input
                id="custom-timer"
                className="text-input"
                type="number"
                min="5"
                max="30"
                value={customTime}
                onChange={(event) =>
                  setCustomTime(
                    String(
                      clampNumber(
                        event.target.value,
                        5,
                        30,
                        DEFAULT_TIME,
                      ),
                    ),
                  )
                }
              />
            </div>

            <div className="quick-timers">
              {QUICK_TIMERS.map((time) => (
                <button
                  key={time}
                  type="button"
                  className={`button ${
                    selectedTime === time ? 'primary' : ''
                  }`}
                  onClick={() =>
                    setCustomTime(String(time))
                  }
                >
                  {time} שנ׳
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          className="button primary"
          onClick={startExam}
          disabled={
            !settingsLoaded ||
            availableQuestions.length === 0
          }
        >
          {isTimed ? 'התחל' : 'התחל מבחן'}
        </button>
      </section>
    );
  }

  if (finished) {
    return (
      <div className="stack-lg">
        <section className="card stack-md">
          <h1>
            {isTimed
              ? 'סיכום מבחן לחץ זמן'
              : 'סיכום מבחן אקראי'}
          </h1>

          <div className="stats-grid compact-grid">
            <div className="card stat-card inset-card">
              <span className="stat-label">ציון</span>
              <strong>
                {results.correct} מתוך {results.total}
              </strong>
            </div>

            <div className="card stat-card inset-card">
              <span className="stat-label">
                אחוז הצלחה
              </span>
              <strong>{results.percent}%</strong>
            </div>

            <div className="card stat-card inset-card">
              <span className="stat-label">סטטוס</span>
              <strong>
                {results.percent >= 80 ? 'עבר' : 'לא עבר'}
              </strong>
            </div>
          </div>

          <p className="muted small-text">
            מצב שאלות:{' '}
            {includeAdvanced
              ? 'רגילות ומתקדמות'
              : 'רגילות בלבד'}
          </p>

          <button
            className="button primary"
            onClick={startExam}
          >
            מבחן נוסף
          </button>
        </section>

        <section className="stack-md">
          <h2>שאלות שטעית בהן</h2>

          {results.wrongItems.length === 0 ? (
            <div className="card">
              מעולה — אין טעויות במבחן הזה.
            </div>
          ) : (
            results.wrongItems.map((item, index) => {
              const answerState = answersMap[item.id];
              const timedOut = answerState?.timedOut;
              const selectedAnswer =
                answerState?.selectedIndex;

              return (
                <article
                  key={item.id}
                  className="card stack-sm"
                >
                  <div className="stack-xs">
                    <strong>שאלה {index + 1}</strong>
                    <p>{item.question}</p>
                  </div>

                  {timedOut ? (
                    <div className="feedback-banner feedback-wrong">
                      הזמן נגמר
                    </div>
                  ) : null}

                  {selectedAnswer !== null &&
                  selectedAnswer !== undefined ? (
                    <div className="stack-xs">
                      <span className="muted">
                        התשובה שסומנה:
                      </span>

                      <strong>
                        {item.answers[selectedAnswer]}
                      </strong>
                    </div>
                  ) : null}

                  <div className="stack-xs">
                    <span className="muted">
                      התשובה הנכונה:
                    </span>

                    <strong>
                      {item.answers[item.correctIndex]}
                    </strong>
                  </div>

                  <p className="muted">
                    {item.explanation}
                  </p>
                </article>
              );
            })
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <section className="card stack-sm">
        <div className="row-between wrap-gap">
          <div>
            <h1>
              {isTimed
                ? 'מבחן לחץ זמן'
                : 'מבחן אקראי'}
            </h1>

            <p className="muted">
              שאלה{' '}
              {Math.min(
                currentIndex + 1,
                examQuestions.length,
              )}{' '}
              מתוך {examQuestions.length}
            </p>
          </div>

          {isTimed ? (
            <div className="timer-badge">
              {secondsLeft} שנ׳
            </div>
          ) : null}
        </div>

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
        selectedIndex={selectedIndex}
        onSelect={handleSelect}
        revealAnswer={false}
        allowChangeAfterReveal
      />

      <div className="row-between wrap-gap">
        {!isTimed ? (
          <button
            className="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            שאלה קודמת
          </button>
        ) : (
          <span />
        )}

        <button
          className="button primary"
          onClick={handleNext}
          disabled={selectedIndex === null}
        >
          הבא
        </button>
      </div>
    </div>
  );
}

function summarizeResults(questions, answersMap) {
  const total = questions.length;
  let correct = 0;
  const wrongItems = [];

  questions.forEach((question) => {
    const answer = answersMap[question.id];

    if (
      answer &&
      answer.selectedIndex === question.correctIndex
    ) {
      correct += 1;
    } else {
      wrongItems.push(question);
    }
  });

  const percent = total
    ? Math.round((correct / total) * 100)
    : 0;

  return {
    total,
    correct,
    percent,
    wrongItems,
  };
}