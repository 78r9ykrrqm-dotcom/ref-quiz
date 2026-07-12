export function pickRandomQuestions(questions, limit) {
  const copy = [...questions];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ];
  }

  return copy.slice(0, Math.min(limit, copy.length));
}

export function shuffleArray(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [copy[index], copy[randomIndex]] = [
      copy[randomIndex],
      copy[index],
    ];
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
    correctIndex: shuffled.findIndex(
      (item) => item.originalIndex === question.correctIndex,
    ),
    originalCorrectIndex: question.correctIndex,
  };
}

export function shuffleQuestionsForSession(questions) {
  return questions.map(shuffleQuestion);
}

export function isAdvancedQuestion(question) {
  return (
    question?.audience === 'advanced' ||
    question?.includeInDefault === false
  );
}

export function filterQuestionsByAudience(
  questions,
  includeAdvanced = false,
) {
  if (!Array.isArray(questions)) {
    return [];
  }

  if (includeAdvanced) {
    return [...questions];
  }

  return questions.filter(
    (question) => !isAdvancedQuestion(question),
  );
}

export function clampNumber(value, min, max, fallback = min) {
  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
}