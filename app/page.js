import { redirect } from 'next/navigation';
import Image from 'next/image';
import ShowPassword from '@/components/ShowPassword';
import { isSignedIn } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const MESSAGES = {
  bad: 'That password is not right. Check with your Team Lead.',
  empty: 'Enter the group password to continue.',
  expired: 'Your sign-in expired. Enter the password again.',
  locked: 'Too many attempts. Wait ten minutes and try again.',
};

export default function Portal({ searchParams }) {
  if (isSignedIn()) redirect('/hub');

  const error = MESSAGES[searchParams?.e] || '';
  const next = typeof searchParams?.next === 'string' ? searchParams.next : '/hub';

  return (
    <main className="portal">
      <div className="portal-inner">
        <Image
          src="/logo.webp"
          alt="Apopka Seniors Council for Good Governance seal"
          width={566}
          height={720}
          className="seal"
          priority
          unoptimized
        />

        <h1>Apopka Seniors Council</h1>
        <p className="tag">For Good Governance</p>
        <div className="rule" />

        <div className="portal-card">
          <h2>Volunteer training portal</h2>
          <p className="sub">Enter the group password to continue.</p>

          {error && (
            <div className="err" role="alert">
              {error}
            </div>
          )}

          <form action="/api/login" method="POST">
            <input type="hidden" name="next" value={next} />
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>
            <ShowPassword />
            <button className="btn gold" type="submit">
              Sign in
            </button>
          </form>
        </div>

        <p className="foot">
          Your Team Lead has the password. It is the same one for everyone in the group.
        </p>
      </div>
    </main>
  );
}
