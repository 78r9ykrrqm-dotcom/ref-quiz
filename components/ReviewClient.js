'use client';

import { useEffect, useMemo, useState } from 'react';
import QuestionCard from '@/components/QuestionCard';
import {
  clearWrongQuestionIds,
  getActiveProfile,
  removeWrongQuestionId,
} from '@/lib/storage';

export default function ReviewClient({ questions }) {
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [askRemoval, setAskRemoval] = useState(false);

  useEffect(() => {
    const active = getActiveProfile();
    setProfile(active);
    if (active) {
      setItems(questions.filter((question) => active.wrongQuestionIds.includes(question.id)));
    }
  }, [questions]);

  const currentQuestion = items[currentIndex];
  const total = items.length;
  const isEmpty = total === 0;

  const resetFlow = () => {
    setSelectedIndex(null);
    setRevealed(false);
    setAskRemoval(false);
  };

  const nextQuestion = () => {
    const next = currentIndex + 1;
    if (next >= items.length) {
      setStarted(false);
      setCurrentIndex(0);
    } else {
      setCurrentIndex(next);
    }
    resetFlow();
  };

  const removeCurrent = () => {
    removeWrongQuestionId(currentQuestion.id);
    const nextItems = items.filter((item) => item.id !== currentQuestion.id);
    setItems(nextItems);
    if (nextItems.length === 0) {
      setStarted(false);
      setCurrentIndex(0);
    } else if (currentIndex >= nextItems.length) {
      setCurrentIndex(nextItems.length - 1);
    }
    resetFlow();
    setProfile(getActiveProfile());
  };

  const submitAnswer = (index) => {
    if (revealed) return;
    setSelectedIndex(index);
    setRevealed(true);
    if (index === currentQuestion.correctIndex) {
      setAskRemoval(true);
    }
  };

  const title = useMemo(() => {
    if (!profile) return 'טעויות שלי';
    return `טעויות שלי — ${profile.username}`;
  }, [profile]);

  if (!profile) {
    return (
      <section className="card stack-md">
        <h1>{title}</h1>
        <p className="muted">כדי לשמור טעויות לחזרה, בחר שם משתמש בעמוד הבית. אפשר עדיין להשתמש באתר בלי זה.</p>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="card stack-md">
        <h1>{title}</h1>
        {isEmpty ? (
          <p className="muted">מעולה — אין כרגע שאלות לחזרה.</p>
        ) : (
          <>
            <p className="muted">יש לך {total} שאלות לחזרה.</p>
            <div className="cta-grid two-columns">
              <button className="button primary" onClick={() => setStarted(true)}>התחל תרגול טעויות</button>
              <button className="button danger" onClick={() => {
                clearWrongQuestionIds();
                setItems([]);
                setProfile(getActiveProfile());
              }}>נקה את כל הטעויות</button>
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <div className="stack-lg">
      <section className="card stack-sm">
        <div className="row-between wrap-gap">
          <h1>{title}</h1>
          <div className="mini-stats">
            <span>שאלה {currentIndex + 1} מתוך {items.length}</span>
            <span>לחזרה: {items.length}</span>
          </div>
        </div>
      </section>

      <QuestionCard
        question={currentQuestion}
        selectedIndex={selectedIndex}
        onSelect={submitAnswer}
        revealAnswer={revealed}
      />

      {revealed ? (
        <section className="card stack-sm">
          <div className={`feedback-banner ${selectedIndex === currentQuestion.correctIndex ? 'feedback-correct' : 'feedback-wrong'}`}>
            {selectedIndex === currentQuestion.correctIndex ? 'נכון' : 'לא נכון'}
          </div>
          <p>{currentQuestion.explanation}</p>

          {askRemoval ? (
            <div className="stack-sm">
              <p>להסיר את השאלה מרשימת הטעויות?</p>
              <div className="cta-grid two-columns">
                <button className="button primary" onClick={removeCurrent}>כן, הסר</button>
                <button className="button" onClick={nextQuestion}>השאר לחזרה נוספת</button>
              </div>
            </div>
          ) : (
            <button className="button primary" onClick={nextQuestion}>שאלה הבאה</button>
          )}
        </section>
      ) : null}
    </div>
  );
}
