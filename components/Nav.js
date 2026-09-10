'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { grouped } from '@/lib/content';
import { useProgress } from '@/components/Progress';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { done, reset } = useProgress();
  const groups = grouped();
  const close = () => setOpen(false);

  return (
    <>
      <div className="mobilebar">
        <span className="mb">
          <Image src="/logo-sm.webp" alt="" width={35} height={44} unoptimized />
          <b>Volunteer training</b>
        </span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="sidenav">
          {open ? 'Close menu' : 'Menu'}
        </button>
      </div>

      <nav id="sidenav" className={open ? 'sidebar open' : 'sidebar'} aria-label="Training sections">
        <Link href="/hub" className="brand" onClick={close}>
          <Image src="/logo-sm.webp" alt="" width={52} height={66} unoptimized />
          <span>
            <b>Apopka Seniors Council</b>
            <span>For Good Governance</span>
          </span>
        </Link>

        {groups.map((g) => (
          <div className="navgroup" key={g.group}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map((s) => {
                const href = `/hub/${s.id}`;
                const isDone = done.has(s.id);
                return (
                  <li key={s.id}>
                    <Link
                      href={href}
                      onClick={close}
                      className={pathname === href ? 'on' : undefined}
                      aria-current={pathname === href ? 'page' : undefined}
                    >
                      <span className={isDone ? 'dot done' : 'dot todo'} aria-hidden="true">
                        {isDone ? '\u25CF' : '\u25CB'}
                      </span>
                      {s.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="navgroup">
          <h3>This site</h3>
          <ul>
            <li><Link href="/hub" onClick={close}>All sections</Link></li>
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm('Clear your progress on this device? The training material is not affected.')) reset();
                }}
              >
                Reset my progress
              </a>
            </li>
            <li><a href="/logout">Sign out</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
}
