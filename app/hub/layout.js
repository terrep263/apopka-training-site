import { redirect } from 'next/navigation';
import Nav from '@/components/Nav';
import { ProgressProvider } from '@/components/Progress';
import { isSignedIn } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default function HubLayout({ children }) {
  if (!isSignedIn()) redirect('/login?e=expired');

  return (
    <ProgressProvider>
      <div className="shell">
        <Nav />
        <main className="main">{children}</main>
      </div>
    </ProgressProvider>
  );
}
