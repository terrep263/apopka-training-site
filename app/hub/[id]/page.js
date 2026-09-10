import Link from 'next/link';
import { notFound } from 'next/navigation';
import DoneButton from '@/components/DoneButton';
import { SECTIONS, getSection } from '@/lib/content';

export function generateStaticParams() {
  return SECTIONS.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }) {
  const s = getSection(params.id);
  return { title: s ? `${s.title} \u2014 Apopka Seniors Council` : 'Apopka Seniors Council' };
}

export default function SectionPage({ params }) {
  const s = getSection(params.id);
  if (!s) notFound();

  const i = SECTIONS.indexOf(s);
  const prev = i > 0 ? SECTIONS[i - 1] : null;
  const next = i < SECTIONS.length - 1 ? SECTIONS[i + 1] : null;

  return (
    <article className="wrap">
      <p className="eyebrow">{s.group}</p>
      <h1>{s.title}</h1>
      <p className="meta">
        About {s.minutes} minutes &middot; Section {i + 1} of {SECTIONS.length}
      </p>

      <div dangerouslySetInnerHTML={{ __html: s.html }} />

      <div style={{ marginTop: '2.5rem' }}>
        <DoneButton id={s.id} />
      </div>

      <nav className="footnav" aria-label="Section navigation">
        {prev ? (
          <Link href={`/hub/${prev.id}`} className="btn ghost inline">&larr; {prev.title}</Link>
        ) : (
          <Link href="/hub" className="btn ghost inline">&larr; All sections</Link>
        )}
        {next ? (
          <Link href={`/hub/${next.id}`} className="btn ghost inline">{next.title} &rarr;</Link>
        ) : (
          <Link href="/hub" className="btn ghost inline">Back to all sections</Link>
        )}
      </nav>
    </article>
  );
}
