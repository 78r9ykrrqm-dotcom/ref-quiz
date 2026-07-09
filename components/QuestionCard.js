export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  revealAnswer,
  allowChangeAfterReveal = false,
}) {
  if (!question) {
    return (
      <section className="card stack-md">
        <p className="muted">טוען שאלה...</p>
      </section>
    );
  }

  return (
    <section className="card stack-md">
      <div className="stack-xs">
        <div className="question-meta">
          {question.lawName ? <span className="pill">{question.lawName}</span> : null}
          {question.topic ? <span className="pill muted-pill">{question.topic}</span> : null}
          {question.difficulty ? <span className="pill muted-pill">{question.difficulty}</span> : null}
        </div>
        <h2 className="question-title">{question.question}</h2>
      </div>

      <div className="answers-grid">
        {question.answers.map((answer, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = revealAnswer && question.correctIndex === index;
          const isWrongSelected = revealAnswer && isSelected && question.correctIndex !== index;

          return (
            <button
              key={`${question.id}-${index}`}
              className={`answer-button ${isSelected ? 'answer-selected' : ''} ${isCorrect ? 'answer-correct' : ''} ${isWrongSelected ? 'answer-wrong' : ''}`}
              onClick={() => onSelect(index)}
              disabled={revealAnswer && !allowChangeAfterReveal}
            >
              <span className="answer-letter">{['א', 'ב', 'ג', 'ד'][index]}</span>
              <span>{answer}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
