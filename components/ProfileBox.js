'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createOrLoadProfile,
  getActiveProfile,
  getGuestMode,
  setGuestMode,
} from '@/lib/storage';

export default function ProfileBox() {
  const [mounted, setMounted] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [activeProfile, setActiveProfile] = useState(null);
  const [guestMode, setGuestModeState] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveProfile(getActiveProfile());
    setGuestModeState(getGuestMode());
  }, []);

  const helper = useMemo(() => {
    if (!mounted) return 'טוען פרופיל מקומי...';
    if (activeProfile) return `פעיל כרגע: ${activeProfile.username}`;
    if (guestMode) return 'כרגע אתה ממשיך בלי שמירה.';
    return 'אפשר להמשיך גם בלי שם משתמש.';
  }, [activeProfile, guestMode, mounted]);

  const recentExams = activeProfile?.completedExams?.slice(-5).reverse() || [];
  const recentAverage = recentExams.length
    ? Math.round(recentExams.reduce((sum, exam) => sum + exam.percent, 0) / recentExams.length)
    : 0;

  const handleSave = () => {
    const profile = createOrLoadProfile(usernameInput);
    if (!profile) return;
    setActiveProfile(profile);
    setGuestMode(false);
    setGuestModeState(false);
    setUsernameInput('');
  };

  const handleGuest = () => {
    setGuestMode(true);
    setGuestModeState(true);
    setActiveProfile(null);
  };

  return (
    <section className="card stack-md">
      <div className="stack-xs">
        <h2>רוצה לשמור תוצאות?</h2>
        <p className="muted">בחר שם משתמש כדי לשמור תוצאות במכשיר הזה.</p>
      </div>

      <div className="profile-box-grid">
        <input
          className="text-input"
          type="text"
          placeholder="למשל: ben-ref"
          value={usernameInput}
          onChange={(event) => setUsernameInput(event.target.value)}
        />
        <button className="button primary" onClick={handleSave}>שמור והמשך</button>
        <button className="button" onClick={handleGuest}>המשך בלי שמירה</button>
      </div>

      <div className="stack-xs">
        <p className="muted">{helper}</p>
        <p className="muted small-text">השם נשמר רק במכשיר הזה. זה לא חשבון אמיתי ואין צורך בסיסמה.</p>
      </div>

      {activeProfile ? (
        <>
          <div className="mini-stats">
            <span>נענו: {activeProfile.totalAnswered}</span>
            <span>נכונות: {activeProfile.totalCorrect}</span>
            <span>טעויות לחזרה: {activeProfile.wrongQuestionIds.length}</span>
          </div>

          <section className="card inset-card stack-sm home-history">
            <div className="row-between wrap-gap">
              <h3 className="section-title">היסטוריית מבחנים</h3>
              <span className="muted small-text">ממוצע 5 אחרונים: {recentAverage}%</span>
            </div>
            {recentExams.length ? (
              <div className="history-list stack-sm">
                {recentExams.map((exam, index) => (
                  <div key={`${exam.date}-${exam.mode}-${index}`} className="history-row">
                    <strong>{exam.mode === 'timed' ? 'לחץ זמן' : 'מבחן אקראי'}</strong>
                    <span>{exam.score}/{exam.total}</span>
                    <span>{exam.percent}%</span>
                    <span className="muted">{exam.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">עדיין אין מבחנים שמורים.</p>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
