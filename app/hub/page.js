'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MISSION, SECTIONS, grouped } from '@/lib/content';
import { useProgress } from '@/components/Progress';

export default function Dashboard() {
  const { done, ready } = useProgress();
  const groups = grouped();
  const total = SECTIONS.length;
  const count = done.size;
  const pct = Math.round((count / total) * 100);

  const message = !ready
    ? 'Loading your progress\u2026'
    : count === 0
      ? 'Start with Our mission. It takes about fifteen minutes.'
      : count === total
        ? 'You have been through everything. Come back when the material is updated.'
        : 'Pick up wherever you left off. Nothing has to be done in one sitting.';

  return (
    <div className="wrap">
      <div className="hero">
        <Image src="/logo-sm.webp" alt="" width={96} height={122} priority unoptimized />
        <div>
          <h1>Volunteer training</h1>
          <p>{MISSION}</p>
        </div>
      </div>

      <div className="card">
        <strong>
          {ready ? count : 0} of {total} sections done
        </strong>
        <div className="bar">
          <i style={{ width: `${ready ? pct : 0}%` }} />
        </div>
        <p style={{ margin: 0, color: 'var(--muted)' }}>{message}</p>
      </div>

      {groups.map((g) => {
        const n = g.items.filter((s) => done.has(s.id)).length;
        return (
          <section key={g.group}>
            <div className="ghead">
              <h2>{g.group}</h2>
              <span>
                {n}/{g.items.length}
              </span>
            </div>
            <ul className="mods">
              {g.items.map((s) => {
                const isDone = done.has(s.id);
                const cls = ['modlink', isDone ? 'done' : '', s.hold ? 'hold' : ''].filter(Boolean).join(' ');
                return (
                  <li key={s.id}>
                    <Link href={`/hub/${s.id}`} className={cls}>
                      <span className="top">
                        <span className="ttl">{s.title}</span>
                        <span className="min">{s.minutes} min</span>
                      </span>
                      <p className="sum">{s.summary}</p>
                      {s.hold && <span className="flag">Content not written yet</span>}
                      {isDone && !s.hold && <span className="tick">&#10003; Done</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
