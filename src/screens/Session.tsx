import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../ui/Icon';
import { TopSpacer } from '../ui/SafeArea';
import { speak } from '../lib/speech';
import { db } from '../db/db';
import { Rating, gradeReview } from '../srs/scheduler';
import { loadOrCreateState, loadSession, type SessionStep } from '../srs/session';
import { computeCoverage, loadHomeStats } from '../srs/stats';
import type { Example, Phrase, User, Word } from '../types/models';
import type { Grade } from 'ts-fsrs';

export interface ReviewedItemSummary {
  en: string;
  fr: string;
  isNew: boolean;
}

export interface SessionFinishResult {
  items: number;
  correct: number;
  prevCoverage: number;
  newCoverage: number;
  reviewedItems: ReviewedItemSummary[];
  streak: number;
}

interface SessionProps {
  user: User;
  onClose: () => void;
  onFinish: (result: SessionFinishResult) => void;
}

interface ProgressBarProps {
  step: number;
  total: number;
  streak: number;
  onClose: () => void;
}

function ProgressBar({ step, total, streak, onClose }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3 px-6 pb-4 pt-2">
      <button onClick={onClose} className="-ml-1 p-1 text-ink/70">
        <Icon name="x" size={20} />
      </button>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-[5px] flex-1 overflow-hidden rounded-full bg-softline">
            <div
              className="h-full rounded-full bg-ink transition-all duration-500"
              style={{ width: i < step ? '100%' : i === step ? '40%' : '0%' }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 text-[12px] text-muted">
        <Icon name="flame" size={13} />
        <span>{streak}</span>
      </div>
    </div>
  );
}

interface DiscoverCardProps {
  word: Word;
  example?: Example;
  onContinue: () => void;
}

function DiscoverCard({ word, example, onContinue }: DiscoverCardProps) {
  return (
    <div className="pop-in flex flex-1 flex-col px-6">
      <div className="mb-4 flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.16em] text-accent">
        <Icon name="sparkle" size={12} /> Nouveau mot
      </div>
      <div className="flex flex-col items-start">
        <div className="text-[64px] font-medium leading-[1] tracking-tight text-ink">
          {word.lemma}
        </div>
        <div className="mt-2 font-mono text-[15px] text-muted">{word.ipa}</div>
        <button
          onClick={() => speak(word.lemma)}
          className="mt-4 flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 transition active:scale-[0.98]"
        >
          <Icon name="volume" size={16} />
          <span className="text-[13px]">Écouter</span>
        </button>
      </div>

      <div className="mt-8 border-t border-softline pt-6">
        <div className="mb-2 text-[10.5px] uppercase tracking-[0.16em] text-muted">Traduction</div>
        <div className="text-[26px] font-medium text-ink">{word.translationFr}</div>
      </div>

      {example && (
        <div className="mt-6 rounded-2xl border border-line bg-paper p-5">
          <div className="mb-3 text-[10.5px] uppercase tracking-[0.16em] text-muted">En contexte</div>
          <div className="flex items-start gap-3">
            <button
              onClick={() => speak(example.sentenceEn)}
              className="mt-0.5 shrink-0 text-muted hover:text-ink"
            >
              <Icon name="volume-sm" size={18} />
            </button>
            <div>
              <div className="text-[17px] leading-snug text-ink">
                {example.sentenceEn.split(word.lemma).map((part, i, arr) => (
                  <Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="font-medium text-accent underline decoration-accent/40 underline-offset-4">
                        {word.lemma}
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
              <div className="mt-1.5 text-[14px] text-muted">{example.translationFr}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pb-6 pt-6">
        <button
          onClick={onContinue}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-[15px] font-medium text-bone transition active:scale-[0.99]"
        >
          J'ai compris
          <Icon name="arrow-right" size={18} />
        </button>
      </div>
    </div>
  );
}

type AnswerStatus = 'correct' | 'wrong' | null;

interface AnswerHook {
  picked: string | null;
  status: AnswerStatus;
  pick: (opt: string) => void;
  next: () => void;
}

/**
 * Gère l'état d'une question : option choisie, statut, et mesure le temps de
 * réponse (sert au bonus "Easy" FSRS < 2.5 s).
 */
function useAnswer(
  correct: string,
  onContinue: (wasCorrect: boolean, elapsedMs: number) => void,
): AnswerHook {
  const [picked, setPicked] = useState<string | null>(null);
  const [status, setStatus] = useState<AnswerStatus>(null);
  const startRef = useRef(performance.now());
  const elapsedRef = useRef(0);

  // Reset chronomètre quand la question change (correct change → nouvel item).
  useEffect(() => {
    startRef.current = performance.now();
    elapsedRef.current = 0;
  }, [correct]);

  const pick = (opt: string) => {
    if (status) return;
    elapsedRef.current = performance.now() - startRef.current;
    setPicked(opt);
    setStatus(opt === correct ? 'correct' : 'wrong');
  };

  const next = () => {
    const wasCorrect = status === 'correct';
    const elapsed = elapsedRef.current;
    setPicked(null);
    setStatus(null);
    onContinue(wasCorrect, elapsed);
  };

  return { picked, status, pick, next };
}

type OptionState =
  | 'idle'
  | 'picked-correct'
  | 'picked-wrong'
  | 'reveal-correct'
  | 'dim';

interface OptionButtonProps {
  children: ReactNode;
  onClick: () => void;
  state: OptionState;
  label?: string;
  big?: boolean;
}

const OPTION_CLASS: Record<OptionState, string> = {
  idle: 'bg-paper border-line hover:border-ink/30 text-ink',
  'picked-correct': 'bg-sageTint border-sage text-ink',
  'picked-wrong': 'bg-coralTint border-coral text-ink shake',
  'reveal-correct': 'bg-paper border-sage text-ink',
  dim: 'bg-paper border-line text-muted opacity-60',
};

function OptionButton({ children, onClick, state, label, big = false }: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full rounded-2xl border-2 px-4 text-left transition-all ${
        big ? 'py-5' : 'py-4'
      } ${OPTION_CLASS[state]}`}
    >
      <div className="flex items-center gap-3">
        {label && (
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] ${
              state === 'idle' || state === 'dim'
                ? 'border-line text-muted'
                : 'border-ink/30 text-ink'
            }`}
          >
            {label}
          </span>
        )}
        <span className={`flex-1 font-medium ${big ? 'text-[22px]' : 'text-[16px]'}`}>
          {children}
        </span>
        {(state === 'picked-correct' || state === 'reveal-correct') && (
          <Icon name="check-circle" size={20} className="text-sage" />
        )}
        {state === 'picked-wrong' && <Icon name="x-circle" size={20} className="text-coral" />}
      </div>
    </button>
  );
}

interface FeedbackBarProps {
  status: AnswerStatus;
  correctText?: string;
  onContinue: () => void;
}

function FeedbackBar({ status, correctText, onContinue }: FeedbackBarProps) {
  if (!status) return null;
  const isOk = status === 'correct';
  return (
    <div
      className={`fade-in -mx-6 border-t px-6 pb-6 pt-4 ${
        isOk ? 'border-sage/20 bg-sageTint/60' : 'border-coral/20 bg-coralTint/60'
      }`}
    >
      <div className="mb-3 flex items-start gap-2">
        <div className={`mt-0.5 ${isOk ? 'text-sage' : 'text-coral'}`}>
          <Icon name={isOk ? 'check-circle' : 'x-circle'} size={18} />
        </div>
        <div className="flex-1">
          <div className={`text-[13.5px] font-medium ${isOk ? 'text-sage' : 'text-coral'}`}>
            {isOk ? 'Exact.' : 'Pas tout à fait.'}
          </div>
          {!isOk && correctText && (
            <div className="mt-0.5 text-[13.5px] text-ink">
              Réponse : <b>{correctText}</b>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onContinue}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-medium active:scale-[0.99] ${
          isOk ? 'bg-sage text-paper' : 'bg-ink text-bone'
        }`}
      >
        Continuer
        <Icon name="arrow-right" size={18} />
      </button>
    </div>
  );
}

function optionState(
  status: AnswerStatus,
  picked: string | null,
  opt: string,
  correct: string,
): OptionState {
  if (!status) return 'idle';
  if (opt === correct) return picked === opt ? 'picked-correct' : 'reveal-correct';
  return picked === opt ? 'picked-wrong' : 'dim';
}

interface AnswerCardProps {
  word: Word;
  options: string[];
  onContinue: (wasCorrect: boolean, elapsedMs: number) => void;
}

function RecognizeCard({ word, options, onContinue }: AnswerCardProps) {
  const { picked, status, pick, next } = useAnswer(word.translationFr, onContinue);
  return (
    <div className="pop-in flex flex-1 flex-col px-6">
      <div className="mb-4 text-[10.5px] uppercase tracking-[0.16em] text-muted">Que signifie</div>
      <div className="mb-1 flex items-baseline gap-3">
        <div className="text-[56px] font-medium leading-none tracking-tight">{word.lemma}</div>
        <button
          onClick={() => speak(word.lemma)}
          className="translate-y-[-4px] text-muted hover:text-ink"
        >
          <Icon name="volume-sm" size={20} />
        </button>
      </div>
      <div className="font-mono text-[13px] text-muted">{word.ipa}</div>

      <div className="mt-8 flex-1 space-y-3">
        {options.map((opt, i) => (
          <OptionButton
            key={opt}
            onClick={() => pick(opt)}
            state={optionState(status, picked, opt, word.translationFr)}
            label={String.fromCharCode(65 + i)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <FeedbackBar status={status} correctText={word.translationFr} onContinue={next} />
    </div>
  );
}

function RecallCard({ word, options, onContinue }: AnswerCardProps) {
  const { picked, status, pick, next } = useAnswer(word.lemma, onContinue);
  return (
    <div className="pop-in flex flex-1 flex-col px-6">
      <div className="mb-4 text-[10.5px] uppercase tracking-[0.16em] text-muted">Comment dit-on</div>
      <div className="text-[44px] font-medium leading-tight tracking-tight text-ink">
        « {word.translationFr} »
      </div>
      <div className="mt-1 text-[12.5px] text-muted">en anglais</div>

      <div className="mt-8 flex-1 space-y-3">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            onClick={() => pick(opt)}
            state={optionState(status, picked, opt, word.lemma)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <FeedbackBar status={status} correctText={word.lemma} onContinue={next} />
    </div>
  );
}

function ListenCard({ word, options, onContinue }: AnswerCardProps) {
  const { picked, status, pick, next } = useAnswer(word.lemma, onContinue);
  const [played, setPlayed] = useState(false);

  const play = () => {
    setPlayed(true);
    speak(word.lemma);
  };

  useEffect(() => {
    const t = setTimeout(play, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pop-in flex flex-1 flex-col px-6">
      <div className="mb-4 text-[10.5px] uppercase tracking-[0.16em] text-muted">
        Qu'entends-tu ?
      </div>

      <button
        onClick={play}
        className="relative mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-full border border-line bg-paper shadow-card transition active:scale-[0.97]"
      >
        <Icon name="volume" size={42} stroke={1.6} />
        {played && (
          <span className="absolute -bottom-1 -right-1 text-[10px] text-muted">↻ rejouer</span>
        )}
      </button>
      <div className="mt-3 text-center text-[12px] text-muted">Touche pour écouter</div>

      <div className="mt-8 flex-1 space-y-3">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            onClick={() => pick(opt)}
            state={optionState(status, picked, opt, word.lemma)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <FeedbackBar
        status={status}
        correctText={`${word.lemma} — ${word.translationFr}`}
        onContinue={next}
      />
    </div>
  );
}

interface ClozeCardProps {
  phrase: Phrase;
  blank: string;
  options: string[];
  onContinue: (wasCorrect: boolean, elapsedMs: number) => void;
}

function ClozeCard({ phrase, blank, options, onContinue }: ClozeCardProps) {
  const { picked, status, pick, next } = useAnswer(blank, onContinue);
  const [before, after] = phrase.textEn.replace(blank, '___').split('___');

  return (
    <div className="pop-in flex flex-1 flex-col px-6">
      <div className="mb-4 text-[10.5px] uppercase tracking-[0.16em] text-muted">
        Complète l'expression
      </div>

      <div className="rounded-2xl border border-line bg-paper p-5">
        <div className="text-[22px] leading-snug text-ink">
          {before}
          <span
            className={`mx-1 inline-block min-w-[80px] rounded-md border-2 border-dashed px-3 py-0.5 align-baseline ${
              status === 'correct'
                ? 'border-sage text-sage'
                : status === 'wrong'
                  ? 'border-coral text-coral'
                  : 'border-line text-muted'
            }`}
          >
            {picked || '___'}
          </span>
          {after}
        </div>
        <div className="mt-2.5 text-[13px] text-muted">{phrase.translationFr}</div>
      </div>

      <div className="mt-8 flex-1 space-y-3">
        {options.map((opt) => (
          <OptionButton
            key={opt}
            onClick={() => pick(opt)}
            state={optionState(status, picked, opt, blank)}
          >
            {opt}
          </OptionButton>
        ))}
      </div>

      <FeedbackBar status={status} correctText={phrase.textEn} onContinue={next} />
    </div>
  );
}

/** Mapping note utilisateur → grade FSRS. */
function rateAnswer(wasCorrect: boolean, elapsedMs: number): Grade {
  if (!wasCorrect) return Rating.Again;
  // Réponse juste très rapide (< 2,5 s) = mot bien ancré → bonus Easy.
  if (elapsedMs < 2500) return Rating.Easy;
  return Rating.Good;
}

/**
 * Construit la liste affichée dans le bilan : 1 ligne par item touché,
 * avec un drapeau "Nouveau" pour ceux qui apparaissent comme `discover`.
 */
function summarizeReviewed(steps: SessionStep[]): ReviewedItemSummary[] {
  const seen = new Map<string, ReviewedItemSummary>();
  for (const s of steps) {
    const key = `${s.itemType}:${s.itemId}`;
    if (seen.has(key)) continue;
    if (s.kind === 'discover') {
      seen.set(key, { en: s.word.lemma, fr: s.word.translationFr, isNew: true });
    } else if (s.kind === 'cloze') {
      seen.set(key, { en: s.phrase.textEn, fr: s.phrase.translationFr, isNew: false });
    } else {
      seen.set(key, { en: s.word.lemma, fr: s.word.translationFr, isNew: false });
    }
  }
  // Marquer "Nouveau" même si la découverte précède un exercice sur le même mot.
  for (const s of steps) {
    if (s.kind === 'discover') {
      const key = `word:${s.itemId}`;
      const existing = seen.get(key);
      if (existing) existing.isNew = true;
    }
  }
  return Array.from(seen.values());
}

async function persistGrade(
  userId: string,
  step: SessionStep,
  grade: Grade,
  now: Date = new Date(),
): Promise<void> {
  // Pas de notation sur l'étape de découverte.
  if (step.kind === 'discover') return;
  const state = await loadOrCreateState(userId, step.itemType, step.itemId, now);
  const updated = gradeReview(state, grade, now);
  await db.reviewStates.put(updated);
}

export function Session({ user, onClose, onFinish }: SessionProps) {
  const [steps, setSteps] = useState<SessionStep[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [prevCoverage, setPrevCoverage] = useState(0);
  const [streak, setStreak] = useState(0);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [loaded, cov, home] = await Promise.all([
        loadSession(user.id, user.dailyGoal),
        computeCoverage(user.id),
        loadHomeStats(user.id),
      ]);
      if (cancelled) return;
      setSteps(loaded);
      setPrevCoverage(cov);
      setStreak(home.streak);
      startedAtRef.current = Date.now();
    })();
    return () => {
      cancelled = true;
    };
  }, [user.id, user.dailyGoal]);

  // Nombre d'items NOTÉS (les `discover` ne comptent pas).
  const gradedTotal = useMemo(
    () => (steps ? steps.filter((s) => s.kind !== 'discover').length : 0),
    [steps],
  );

  const finish = async (finalCorrect: number) => {
    if (!steps) return;
    await db.sessions.add({
      id: `sess-${startedAtRef.current}`,
      userId: user.id,
      startedAt: startedAtRef.current,
      itemsSeen: gradedTotal,
      itemsCorrect: finalCorrect,
      durationSec: Math.round((Date.now() - startedAtRef.current) / 1000),
    });
    // Stats post-session — calculées APRÈS l'insertion pour intégrer le jour
    // courant dans le streak.
    const [newCov, homeAfter] = await Promise.all([
      computeCoverage(user.id),
      loadHomeStats(user.id),
    ]);
    onFinish({
      items: gradedTotal,
      correct: finalCorrect,
      prevCoverage,
      newCoverage: newCov,
      reviewedItems: summarizeReviewed(steps),
      streak: homeAfter.streak,
    });
  };

  const advance = async (wasCorrect: boolean, elapsedMs: number) => {
    if (!steps) return;
    const step = steps[idx];
    const grade = rateAnswer(wasCorrect, elapsedMs);
    await persistGrade(user.id, step, grade);

    const nextCorrect = step.kind !== 'discover' && wasCorrect ? correct + 1 : correct;
    if (step.kind !== 'discover' && wasCorrect) setCorrect(nextCorrect);

    if (idx + 1 >= steps.length) {
      await finish(nextCorrect);
    } else {
      setIdx((i) => i + 1);
    }
  };

  if (!steps) {
    return (
      <div className="fade-in absolute inset-0 z-40 flex flex-col bg-bone">
        <TopSpacer />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-[12px] uppercase tracking-[0.18em] text-muted">
            Préparation de la session…
          </div>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="fade-in absolute inset-0 z-40 flex flex-col bg-bone">
        <TopSpacer />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
          <Icon name="check-circle" size={32} className="text-sage" />
          <div>
            <div className="text-[20px] font-medium tracking-tight text-ink">
              Rien à réviser pour l'instant.
            </div>
            <div className="mt-1 text-[13.5px] text-muted">
              Reviens plus tard ou ajuste ton rythme dans tes réglages.
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-2 rounded-2xl bg-ink px-6 py-3 text-[14px] font-medium text-bone"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const step = steps[idx];

  return (
    <div className="fade-in absolute inset-0 z-40 flex flex-col bg-bone">
      <TopSpacer />
      <ProgressBar step={idx} total={steps.length} streak={streak} onClose={onClose} />
      {step.kind === 'discover' && (
        <DiscoverCard
          word={step.word}
          example={step.example}
          onContinue={() => void advance(true, 0)}
        />
      )}
      {step.kind === 'recognize' && (
        <RecognizeCard
          word={step.word}
          options={step.options}
          onContinue={(c, e) => void advance(c, e)}
        />
      )}
      {step.kind === 'recall' && (
        <RecallCard
          word={step.word}
          options={step.options}
          onContinue={(c, e) => void advance(c, e)}
        />
      )}
      {step.kind === 'listen' && (
        <ListenCard
          word={step.word}
          options={step.options}
          onContinue={(c, e) => void advance(c, e)}
        />
      )}
      {step.kind === 'cloze' && (
        <ClozeCard
          phrase={step.phrase}
          blank={step.blank}
          options={step.options}
          onContinue={(c, e) => void advance(c, e)}
        />
      )}
    </div>
  );
}
