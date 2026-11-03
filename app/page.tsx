'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import Billing from '../components/Billing';
type Business = {
  id: string;
  name: string;
  status: string;
  timezone: string;
  createdAt: string;
  _count: { users: number; apiKeys: number };
};
type Data = {
  metrics: {
    total: number;
    active: number;
    trial: number;
    suspended: number;
    users: number;
    keys: number;
  };
  businesses: Business[];
  audit: {
    id: string;
    action: string;
    createdAt: string;
    tenantId: string | null;
    actorId: string;
  }[];
  timezones: { timezone: string; _count: number }[];
};
export default function Admin() {
  const [user, setUser] = useState<{ email: string }>(),
    [data, setData] = useState<Data>(),
    [view, setView] = useState('Overview'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [search, setSearch] = useState(''),
    [filter, setFilter] = useState('ALL');
  async function load(term = '') {
    const me = await api<{ user: { email: string } }>('auth/me');
    setUser(me.user);
    setData(
      await api<Data>('admin/overview?search=' + encodeURIComponent(term)),
    );
  }
  useEffect(() => {
    void load().catch((e) => {
      if (e.status !== 401) setError(e.message);
    });
  }, []);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(
        'auth/login',
        'POST',
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }
  async function change(b: Business) {
    const status = b.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (
      !confirm(
        (status === 'SUSPENDED' ? 'Suspend ' : 'Activate ') +
          b.name +
          '? This changes integration access.',
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await api('admin/businesses/' + b.id + '/status', 'PATCH', { status });
      await load(search);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setBusy(false);
    }
  }
  if (!user)
    return (
      <main className="login-shell">
        <aside className="story">
          <a className="brand" href="/">
            <span className="mark">a</span>autometa
          </a>
          <div>
            <div className="eyebrow">PLATFORM OPERATIONS</div>
            <h1>
              A clear view.
              <br />A steady hand.
            </h1>
            <p>
              Oversee business accounts, manage access and keep track of the
              changes that matter.
            </p>
          </div>
          <footer>
            Private administration ? Authorized platform operators only
          </footer>
        </aside>
        <section className="auth-area">
          <div className="auth-card">
            <div className="eyebrow">ADMIN CONSOLE</div>
            <h1 style={{ marginTop: 16 }}>Sign in to Autometa</h1>
            <p>Use your provisioned platform administrator account.</p>
            {error && (
              <div role="alert" className="notice error">
                {error}
              </div>
            )}
            <form onSubmit={login}>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  required
                  maxLength={128}
                  autoComplete="current-password"
                />
              </label>
              <button disabled={busy}>
                {busy ? 'Signing in?' : 'Sign in ?'}
              </button>
            </form>
            <p className="footnote">
              Local credentials are saved by the trusted setup command in
              backend/.local/admin-credentials.txt.
            </p>
            <a href="http://localhost:3100/login">
              Business account? Open the user portal ?
            </a>
          </div>
        </section>
      </main>
    );
  const businesses = (data?.businesses ?? []).filter(
    (b) => filter === 'ALL' || b.status === filter,
  );
  return (
    <div className="shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="mark">a</span>autometa
        </a>
        <span className="badge">PLATFORM ADMIN</span>
        <nav>
          {[
            'Overview',
            'Businesses',
            'Billing',
            'Audit history',
            'System status',
          ].map((name, i) => (
            <button
              key={name}
              className={view === name ? 'current' : ''}
              onClick={() => setView(name)}
            >
              {['?', '?', '?', '?'][i]}?{name}
            </button>
          ))}
        </nav>
        <div className="side-note">
          <strong>Local environment</strong>
          <p>Manage workspaces, email automation and prepaid test billing.</p>
          <a href="http://localhost:3100">Open user portal ?</a>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Platform / <strong>{view}</strong>
          </span>
          <div className="account">
            <span className="badge">LOCAL</span>
            <small>{user.email}</small>
            <span className="avatar">AD</span>
            <button
              className="secondary"
              onClick={() => {
                void api('auth/logout', 'POST')
                  .then(() => {
                    setUser(undefined);
                    setData(undefined);
                  })
                  .catch((e) => setError(e.message));
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="content">
          <div className="heading">
            <div>
              <div className="eyebrow">PLATFORM OPERATIONS</div>
              <h1 style={{ marginTop: 12 }}>
                {view === 'Overview' ? 'Your platform at a glance' : view}
              </h1>
              <p>A live view of business accounts and integration access.</p>
            </div>
            <button
              className="secondary"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void load(search)
                  .catch((e) => setError(e.message))
                  .finally(() => setBusy(false));
              }}
            >
              ? Refresh data
            </button>
          </div>
          {error && (
            <div role="alert" className="notice error">
              {error}
            </div>
          )}
          {!data && <div className="card">Loading platform records?</div>}
          {data && view === 'Overview' && (
            <>
              <div className="metrics">
                {[
                  [
                    'Total businesses',
                    data.metrics.total,
                    'Registered on the platform',
                  ],
                  [
                    'Active businesses',
                    data.metrics.active,
                    'Enabled by platform admin',
                  ],
                  [
                    'Onboarding trials',
                    data.metrics.trial,
                    '14-day onboarding period',
                  ],
                  [
                    'Suspended businesses',
                    data.metrics.suspended,
                    'Integration access paused',
                  ],
                ].map(([name, value, detail]) => (
                  <article className="metric" key={name}>
                    <div className="metric-label">
                      {name}
                      <span>?</span>
                    </div>
                    <div className="value">{value}</div>
                    <p>{detail}</p>
                  </article>
                ))}
              </div>
              <div className="columns">
                <section className="card">
                  <div className="section-heading">
                    <h2>Business distribution</h2>
                    <small>By reporting timezone</small>
                  </div>
                  {data.timezones.length ? (
                    data.timezones.map((g) => (
                      <div key={g.timezone}>
                        <div className="metric-label">
                          <strong>{g.timezone}</strong>
                          <span>{g._count}</span>
                        </div>
                        <div className="bar">
                          <i
                            style={{
                              width:
                                (g._count / Math.max(data.metrics.total, 1)) *
                                  100 +
                                '%',
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty">
                      <strong>Your first business starts here</strong>
                      <p>
                        Register a business in the user portal. It appears here
                        automatically.
                      </p>
                      <a
                        className="button secondary"
                        href="http://localhost:3100/register"
                      >
                        Open registration ?
                      </a>
                    </div>
                  )}
                  <p className="footnote">
                    Derived from current business records. No sample analytics.
                  </p>
                </section>
                <section className="card">
                  <h2>Access overview</h2>
                  {[
                    [
                      'Business accounts',
                      data.metrics.users,
                      'Tenant administrators',
                    ],
                    [
                      'Active integration keys',
                      data.metrics.keys,
                      'Development and production',
                    ],
                    [
                      'Prepaid billing',
                      'Test mode',
                      'Open Billing for balances, top-ups and review flags',
                    ],
                  ].map(([name, value, detail]) => (
                    <div className="status-row" key={name}>
                      <div>
                        <strong>{name}</strong>
                        <p>{detail}</p>
                      </div>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}
          {data && ['Overview', 'Businesses'].includes(view) && (
            <section className="card">
              <div className="section-heading">
                <h2>Business accounts</h2>
                <small>Latest 50 matching records</small>
              </div>
              <div className="toolbar">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBusy(true);
                    void load(search)
                      .catch((e) => setError(e.message))
                      .finally(() => setBusy(false));
                  }}
                >
                  <input
                    aria-label="Search business name"
                    placeholder="Search business name?"
                    maxLength={100}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="secondary" disabled={busy}>
                    Search
                  </button>
                </form>
                <select
                  aria-label="Business status"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Business</th>
                      <th>Status</th>
                      <th>Members / keys</th>
                      <th>Registered</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {businesses.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>{b.name}</strong>
                          <small>{b.timezone}</small>
                        </td>
                        <td>
                          <span className={'badge ' + b.status}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b._count.users} / {b._count.apiKeys}
                        </td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={
                              b.status === 'SUSPENDED' ? 'secondary' : 'danger'
                            }
                            disabled={busy}
                            onClick={() => void change(b)}
                          >
                            {b.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!businesses.length && (
                  <div className="empty">
                    <strong>No businesses found</strong>
                    <p>
                      Try another search or register a business in the user
                      portal.
                    </p>
                  </div>
                )}
              </div>
              <p className="footnote">
                Customer messages are not accessible through platform
                administration.
              </p>
            </section>
          )}
          {data && ['Overview', 'Audit history'].includes(view) && (
            <section className="card">
              <div className="section-heading">
                <h2>Recent administrative activity</h2>
                <small>Latest 30 changes</small>
              </div>
              {data.audit.map((a) => (
                <div className="activity" key={a.id}>
                  <strong>
                    {a.action.replaceAll('.', ' ? ').replaceAll('_', ' ')}
                  </strong>
                  <p>
                    {new Date(a.createdAt).toLocaleString()} ?{' '}
                    {a.tenantId
                      ? 'Business ' + a.tenantId.slice(0, 8)
                      : 'Platform'}{' '}
                    ? Actor {a.actorId.slice(0, 12)}
                  </p>
                </div>
              ))}
              {!data.audit.length && (
                <div className="empty">No administrative changes yet.</div>
              )}
            </section>
          )}
          {view === 'Billing' && <Billing />}
          {view === 'System status' && (
            <section className="card">
              <h2>Available in this phase</h2>
              {[
                [
                  'Authentication',
                  'Registration, email verification, login and password reset',
                  'Available',
                ],
                [
                  'Tenant isolation',
                  'Server-side roles and tenant-scoped API keys',
                  'Available',
                ],
                [
                  'Account operations',
                  'Suspend and activate businesses with audit history',
                  'Available',
                ],
                [
                  'Automation workflows',
                  'Contact-event acknowledgements, queue and attempt logs',
                  'Available',
                ],
                [
                  'Outbound email',
                  'Mock and Gmail SMTP; delivery confirmation is unavailable',
                  'Available',
                ],
                [
                  'Additional channels',
                  'Inbound replies, AI and Telegram',
                  'Planned',
                ],
                [
                  'Prepaid credits',
                  'Razorpay test top-ups, verified payment webhooks and usage ledger',
                  'Available',
                ],
                ['Monthly reporting', 'Automated business reports', 'Planned'],
                [
                  'Production deployment',
                  'TLS, backups, monitoring and VPS checks',
                  'Planned',
                ],
              ].map(([name, detail, state]) => (
                <div className="status-row" key={name}>
                  <div>
                    <strong>{name}</strong>
                    <p>{detail}</p>
                  </div>
                  <span className="badge">{state}</span>
                </div>
              ))}
            </section>
          )}
          <p className="footnote">
            Platform controls use real database records. Further modules remain
            on the development checklist.
          </p>
        </main>
      </div>
    </div>
  );
}
