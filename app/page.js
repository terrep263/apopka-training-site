import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Apopka Senior Council for Good Governance',
  description:
    'A volunteer-led community organization helping Apopka residents understand local government, public policy, and civic responsibility.',
};

const NAME = 'Apopka Senior Council for Good Governance';

// The hero photograph is optional. If no image is in the repo, the band falls
// back to plain navy rather than showing a broken image.
const hasHero = fs.existsSync(path.join(process.cwd(), 'public', 'hero-wide.webp'));

export default function Home() {
  return (
    <>
      <header className="home-head">
        <nav className="home-nav">
          <Link href="/" className="idg">
            <Image src="/logo-sm.webp" alt="" width={44} height={56} unoptimized />
            <span>
              <b>Apopka Senior Council</b>
              <span className="kicker">For Good Governance</span>
            </span>
          </Link>
          <Link href="/login" className="signin">Member sign in</Link>
        </nav>
      </header>

      <section className={hasHero ? 'hero-band' : 'hero-band noshot'}>
        {hasHero && (
          <img className="bg" src="/hero-wide.webp" alt="" aria-hidden="true" />
        )}
        <div className="scrim" />
        <div className="in">
          <Image
            src="/logo-sm.webp"
            alt={`${NAME} seal`}
            width={120}
            height={152}
            className="crest"
            priority
            unoptimized
          />
          <p className="pillars">Experience &middot; Knowledge &middot; Service &middot; Accountability</p>
          <h1>
            Good government begins with an <em>informed community</em>.
          </h1>
          <p className="stand">
            A volunteer-led community organization helping Apopka residents understand local
            government, public policy, civic responsibility, and the decisions that affect our
            community.
          </p>
          <div className="hero-actions">
            <Link href="/login" className="primary">Member sign in</Link>
            <Link href="#what-we-do" className="secondary">What we do</Link>
          </div>
        </div>
      </section>

      <main className="home-main">
        <div className="intro">
          <p>
            Our members bring decades of professional experience, community involvement,
            leadership, and life experience to one purpose: helping the people of Apopka become
            better informed and more engaged in the civic process.
          </p>
        </div>

        <h2>Good government begins with an informed community</h2>
        <p>
          Local government affects many parts of everyday life, including public safety, roads,
          development, taxes, city services, budgeting, parks, utilities, and the long-term
          direction of our community.
        </p>
        <p>Yet government processes can often be difficult to understand.</p>
        <p>We work to make those processes clearer.</p>
        <p>
          Through educational programs, public discussions, community forums, research, and
          informational resources, the Council helps residents understand how local government
          works, how decisions are made, where public money goes, and how citizens can
          participate effectively.
        </p>

        <h2>Our mission</h2>
        <p>
          Our mission is to educate, inform, and encourage responsible civic participation while
          promoting the principles of good governance.
        </p>
        <div className="panel">
          <h3>We believe good governance includes:</h3>
          <ul className="principles">
            <li>Transparency in public decision-making.</li>
            <li>Accountability from public institutions and officials.</li>
            <li>Responsible management of taxpayer resources.</li>
            <li>Open access to reliable public information.</li>
            <li>Respectful public participation.</li>
            <li>Ethical leadership and public service.</li>
            <li>
              Decisions based on facts, evidence, and the long-term interests of the community.
            </li>
          </ul>
        </div>

        <h2 id="what-we-do">What we do</h2>
        <div className="grid2">
          <div className="panel">
            <h3>Civic Education</h3>
            <p>
              We explain how city government works, including the responsibilities of elected
              officials, city staff, boards, committees, and residents.
            </p>
          </div>
          <div className="panel">
            <h3>Community Information</h3>
            <p>
              We help residents understand important local issues by presenting relevant facts,
              public records, government documents, and other reliable information in clear
              language.
            </p>
          </div>
          <div className="panel">
            <h3>Public Forums and Discussions</h3>
            <p>
              We create opportunities for residents to learn about important community issues,
              ask questions, hear different perspectives, and better understand matters
              affecting Apopka.
            </p>
          </div>
          <div className="panel">
            <h3>Government Accountability</h3>
            <p>
              We encourage transparency, responsible stewardship of public resources, ethical
              conduct, and adherence to established government processes.
            </p>
          </div>
          <div className="panel">
            <h3>Citizen Engagement</h3>
            <p>
              We help residents understand how to attend public meetings, review government
              documents, communicate with public officials, participate in public hearings, and
              make their voices part of the civic process.
            </p>
          </div>
        </div>

        <h2>Seniors serving the community</h2>
        <p>
          Our members have spent decades building careers, raising families, serving their
          country, operating businesses, working in public service, volunteering, and
          contributing to their communities.
        </p>
        <p>Retirement does not end the value of that experience.</p>
        <p>
          The Apopka Senior Council for Good Governance provides seniors with an opportunity to
          continue serving by sharing their knowledge, experience, and perspective with the
          broader community.
        </p>

        <h2>Nonpartisan. Fact-based. Community-focused.</h2>
        <div className="pull">
          <p>
            The Council is not organized to serve a political party, candidate, faction, or
            special interest.
          </p>
          <p>
            <strong>Our responsibility is to the community.</strong>
          </p>
          <p>
            We believe residents should have access to accurate information, understand the
            issues before them, examine the evidence, ask serious questions, and reach their own
            conclusions.
          </p>
          <p>Good governance is not about who wins an argument.</p>
          <p>
            It is about whether government serves the public responsibly, transparently,
            ethically, and effectively.
          </p>
        </div>

        <h2>Know your government. Understand the issues. Participate in your community.</h2>
        <p>
          Democracy works best when citizens understand how their government operates and remain
          engaged in the decisions being made in their name.
        </p>
        <p>
          The Apopka Senior Council for Good Governance exists to help make that possible.
        </p>
        <p>
          <strong>Learn. Participate. Stay Informed.</strong>
        </p>

        <div className="cta">
          <h2>Council members</h2>
          <p>Training and reference material for members. Your Team Lead has the password.</p>
          <Link href="/login">Member sign in</Link>
        </div>
      </main>

      <footer className="home-foot">
        Apopka Senior Council for Good Governance &middot; Apopka, Florida &middot;{' '}
        <Link href="/login">Member sign in</Link>
      </footer>
    </>
  );
}
