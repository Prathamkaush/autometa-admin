'use client';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
type Data = {
  enabled: boolean;
  mode: string;
  totals: { availablePaise: number | null; reservedPaise: number | null };
  accounts: {
    tenantId: string;
    availablePaise: number;
    reservedPaise: number;
    blocked: boolean;
    tenant: { name: string };
  }[];
  topups: {
    id: string;
    amountPaise: number;
    status: string;
    refundedPaise: number;
    disputed: boolean;
    createdAt: string;
    tenant: { name: string };
  }[];
};
const money = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
    n / 100,
  );
export default function Billing() {
  const [data, setData] = useState<Data>();
  const [error, setError] = useState('');
  const load = () =>
    api<Data>('admin/billing')
      .then((r) => {
        setData(r);
        setError('');
      })
      .catch((e) => setError(e.message));
  useEffect(() => {
    void load();
  }, []);
  return (
    <div className="email-automation">
      <section className="card">
        <div className="section-heading">
          <h2>Prepaid billing</h2>
          <span className="badge">TEST MODE</span>
          <button className="secondary" onClick={() => void load()}>
            Refresh
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
        <p>
          Test purchases and credit usage. Account balances are derived from
          verified payments and usage reservations; this screen cannot grant
          arbitrary funds.
        </p>
        {data && (
          <p>
            Available: {money(data.totals.availablePaise ?? 0)} / Reserved:{' '}
            {money(data.totals.reservedPaise ?? 0)}. Billing{' '}
            {data.enabled ? 'enabled' : 'disabled'}.
          </p>
        )}
      </section>
      <section className="card">
        <h2>Workspace balances</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Workspace</th>
                <th>Available</th>
                <th>Reserved</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.accounts.map((a) => (
                <tr key={a.tenantId}>
                  <td>{a.tenant.name}</td>
                  <td>{money(a.availablePaise)}</td>
                  <td>{money(a.reservedPaise)}</td>
                  <td>
                    {a.blocked
                      ? 'REVIEW'
                      : a.availablePaise < 0
                        ? 'CREDIT DEFICIT'
                        : 'ACTIVE'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h2>Recent top-ups</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Workspace</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Refunded</th>
              </tr>
            </thead>
            <tbody>
              {data?.topups.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.createdAt).toLocaleString()}</td>
                  <td>{t.tenant.name}</td>
                  <td>{money(t.amountPaise)}</td>
                  <td>
                    {t.status}
                    {t.disputed ? ' / DISPUTED' : ''}
                  </td>
                  <td>{money(t.refundedPaise)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
