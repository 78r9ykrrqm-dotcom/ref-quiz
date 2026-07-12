const STORAGE_KEY = 'refQuizData';

const defaultData = {
  activeUsername: null,
  guestMode: false,
  profiles: {},
  settings: {
    includeAdvanced: false,
  },
};

function safeRead() {
  if (typeof window === 'undefined') return defaultData;

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return defaultData;

  try {
    const parsed = JSON.parse(raw);

    return {
      ...defaultData,
      ...parsed,
      profiles: parsed?.profiles || {},
      settings: {
        ...defaultData.settings,
        ...(parsed?.settings || {}),
      },
    };
  } catch {
    return defaultData;
  }
}

function safeWrite(data) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data),
  );
}

function touchProfile(profile) {
  return {
    ...profile,
    lastActiveAt: new Date().toISOString(),
  };
}

export function getIncludeAdvanced() {
  return Boolean(safeRead().settings?.includeAdvanced);
}

export function setIncludeAdvanced(value) {
  const data = safeRead();

  data.settings = {
    ...defaultData.settings,
    ...(data.settings || {}),
    includeAdvanced: Boolean(value),
  };

  safeWrite(data);

  return data.settings.includeAdvanced;
}

export function createOrLoadProfile(username) {
  const clean = String(username || '').trim();

  if (!clean) return null;

  const data = safeRead();
  const existing = data.profiles[clean];

  const profile = touchProfile(
    existing || {
      username: clean,
      totalAnswered: 0,
      totalCorrect: 0,
      wrongQuestionIds: [],
      completedExams: [],
      lastActiveAt: new Date().toISOString(),
    },
  );

  data.profiles[clean] = profile;
  data.activeUsername = clean;
  data.guestMode = false;

  safeWrite(data);

  return profile;
}

export function getActiveProfile() {
  const data = safeRead();

  if (!data.activeUsername) return null;

  return data.profiles[data.activeUsername] || null;
}

export function getGuestMode() {
  return safeRead().guestMode;
}

export function setGuestMode(value) {
  const data = safeRead();

  data.guestMode = Boolean(value);

  if (value) {
    data.activeUsername = null;
  }

  safeWrite(data);
}

function updateProfile(mutator) {
  const data = safeRead();
  const username = data.activeUsername;

  if (!username || !data.profiles[username]) {
    return null;
  }

  const nextProfile = touchProfile(
    mutator({ ...data.profiles[username] }),
  );

  data.profiles[username] = nextProfile;
  safeWrite(data);

  return nextProfile;
}

export function addWrongQuestionId(questionId) {
  return updateProfile((profile) => {
    if (!profile.wrongQuestionIds.includes(questionId)) {
      profile.wrongQuestionIds.push(questionId);
    }

    return profile;
  });
}

export function removeWrongQuestionId(questionId) {
  return updateProfile((profile) => {
    profile.wrongQuestionIds =
      profile.wrongQuestionIds.filter(
        (id) => id !== questionId,
      );

    return profile;
  });
}

export function clearWrongQuestionIds() {
  return updateProfile((profile) => {
    profile.wrongQuestionIds = [];

    return profile;
  });
}

export function recordPracticeAnswer(isCorrect) {
  return updateProfile((profile) => {
    profile.totalAnswered += 1;

    if (isCorrect) {
      profile.totalCorrect += 1;
    }

    return profile;
  });
}

export function recordExamSession(answered, correct) {
  return updateProfile((profile) => {
    profile.totalAnswered += answered;
    profile.totalCorrect += correct;

    return profile;
  });
}

export function recordCompletedExam(exam) {
  return updateProfile((profile) => {
    profile.completedExams = [
      ...profile.completedExams,
      {
        date: new Date().toISOString().slice(0, 10),
        mode: exam.mode,
        score: exam.score,
        total: exam.total,
        percent: exam.percent,
      },
    ];

    return profile;
  });
}