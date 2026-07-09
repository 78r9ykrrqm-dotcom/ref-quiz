export function pickRandomQuestions(questions, limit) {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(limit, copy.length));
}

export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function shuffleQuestion(question) {
  const mappedAnswers = question.answers.map((answer, index) => ({
    answer,
    originalIndex: index,
  }));
  const shuffled = shuffleArray(mappedAnswers);

  return {
    ...question,
    answers: shuffled.map((item) => item.answer),
    correctIndex: shuffled.findIndex((item) => item.originalIndex === question.correctIndex),
    originalCorrectIndex: question.correctIndex,
  };
}

export function shuffleQuestionsForSession(questions) {
  return questions.map(shuffleQuestion);
}

export function clampNumber(value, min, max, fallback = min) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
}
