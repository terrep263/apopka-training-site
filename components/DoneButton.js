'use client';

import { useProgress } from '@/components/Progress';

export default function DoneButton({ id }) {
  const { done, ready, toggle } = useProgress();
  const isDone = done.has(id);

  return (
    <button
      type="button"
      className={isDone ? 'btn ghost inline' : 'btn inline'}
      onClick={() => toggle(id)}
      disabled={!ready}
    >
      {isDone ? 'Completed \u2014 undo' : 'Mark this section done'}
    </button>
  );
}
