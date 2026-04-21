import React, { useContext, useEffect, useMemo, useState } from 'react';
import { PageTransition, Navbar } from './Pages';
import { API_BASE } from '../lib/apiBase';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../auth/AuthProvider';

const ADMIN_TOKEN_STORAGE_KEY = 'hirelanka_admin_token';

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return '0.00';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (t) {
      navigate('/admin/payments', { replace: true });
    }
  }, [navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-md mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="card p-8 md:p-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Admin Login</h1>
            <p className="text-slate-600 font-medium mt-2">Sign in to manage payments and payouts.</p>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email</label>
                <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            {error && <div className="mt-4 text-sm font-bold text-red-600">{error}</div>}

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="btn-primary px-6 py-3 disabled:opacity-50"
                disabled={loading}
                onClick={async () => {
                  setError('');
                  const e = email.trim().toLowerCase();
                  if (!e || password.trim().length === 0) {
                    setError('Please enter email and password.');
                    return;
                  }
                  setLoading(true);
                  try {
                    const resp = await fetch(`${API_BASE}/api/admin/login`, {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ email: e, password }),
                    });
                    const json = await resp.json().catch(() => null);
                    if (!resp.ok) {
                      setError((json && json.error) || 'Login failed');
                      return;
                    }
                    const token = json && json.token;
                    if (!token) {
                      setError('Login failed');
                      return;
                    }
                    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, String(token));
                    try {
                      await supabase.auth.signOut();
                      localStorage.removeItem('hirelanka_session');
                      localStorage.removeItem('hirelanka_authed');
                    } catch { /* ignore */ }
                    navigate('/admin/payments', { replace: true });
                  } catch (err: any) {
                    setError(err?.message || 'Login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

function computeFees(total: number) {
  const platformFee = Math.round(total * 0.15 * 100) / 100;
  const netAmount = Math.round((total - platformFee) * 100) / 100;
  return { platformFee, netAmount };
}

type PaymentRow = {
  id: string;
  user_id: string;
  provider_id: string;
  service_type: string | null;
  file_path: string;
  total_amount: number;
  platform_fee: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type PayoutRow = {
  id: string;
  payment_id: string;
  provider_id: string;
  amount_to_pay: number;
  status: 'pending' | 'paid';
  paid_date: string | null;
  created_at: string;
};

function StatusPill({ value }: { value: string }) {
  const cls =
    value === 'approved' || value === 'paid'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : value === 'rejected'
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-amber-50 border-amber-200 text-amber-800';
  return <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${cls}`}>{value}</span>;
}

export const PaymentPage = () => {
  const { profile } = useContext(AuthContext);
  const [providerId, setProviderId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => Number(totalAmount || 0), [totalAmount]);
  const { platformFee, netAmount } = useMemo(() => computeFees(Number.isFinite(total) ? total : 0), [total]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="card p-8 md:p-12">
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Pay a Freelancer</h1>
            <p className="text-slate-500 font-medium mt-2">Transfer the full amount to our bank. We deduct 15% and pay the freelancer the rest.</p>

            {/* How it works */}
            <div className="mt-6 bg-primary-50 border border-primary-200/60 rounded-2xl p-5">
              <div className="text-sm font-bold text-primary-800 mb-3">How it works</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <span className="text-primary-700 font-medium">You pay the full amount to HireLanka's bank account</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <span className="text-primary-700 font-medium">We keep 15% as our platform commission</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <span className="text-primary-700 font-medium">The freelancer receives 85% after admin approval</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card p-6 bg-white border border-slate-100">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bank Details</div>
                <div className="mt-4 space-y-2 text-slate-700 font-semibold">
                  <div>Bank: <span className="font-extrabold">Your Bank Name</span></div>
                  <div>Account Name: <span className="font-extrabold">HireLanka</span></div>
                  <div>Account No: <span className="font-extrabold">000-000-0000</span></div>
                  <div>Reference: <span className="font-extrabold">{profile?.id || 'Your User ID'}</span></div>
                </div>
                <div className="mt-4 text-sm text-slate-500 font-medium">Upload your bank transfer slip below as proof of payment.</div>
              </div>

              <div className="card p-6 bg-white border border-primary-200/40">
                <div className="text-xs font-bold text-primary-600 uppercase tracking-wider">Commission Breakdown</div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between font-semibold text-slate-600">
                    <span>You pay (total)</span>
                    <span className="text-slate-900 font-extrabold">Rs. {formatMoney(Number.isFinite(total) ? total : 0)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-red-600">
                    <span>HireLanka keeps (15%)</span>
                    <span className="font-extrabold">− Rs. {formatMoney(platformFee)}</span>
                  </div>
                  <div className="h-px bg-primary-100" />
                  <div className="flex items-center justify-between font-extrabold text-primary-700">
                    <span>Freelancer receives (85%)</span>
                    <span>Rs. {formatMoney(netAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Your ID (Client)</label>
                <input className="input-field bg-slate-50" value={profile?.id || ''} readOnly placeholder="Auto-filled from your account" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Freelancer ID</label>
                <input className="input-field" value={providerId} onChange={(e) => setProviderId(e.target.value)} placeholder="Paste the freelancer's user ID" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Service type (optional)</label>
                <input className="input-field" value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="e.g. Logo Design, Web Development" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Total amount you are paying (Rs.)</label>
                <input className="input-field" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="e.g. 5000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700">Bank transfer slip (image or PDF)</label>
                <input
                  type="file"
                  className="input-field"
                  accept="image/*,application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                className="btn-primary px-6 py-3"
                disabled={submitting}
                onClick={async () => {
                  setError('');
                  setInfo('');

                  const userId = profile?.id || '';
                  const totalNum = Number(totalAmount);
                  if (!userId || !providerId.trim()) {
                    setError('Please sign in and enter the freelancer ID.');
                    return;
                  }
                  if (!Number.isFinite(totalNum) || totalNum <= 0) {
                    setError('Please enter a valid total amount.');
                    return;
                  }
                  if (!file) {
                    setError('Please upload the bank transfer slip.');
                    return;
                  }

                  const fd = new FormData();
                  fd.append('userId', userId);
                  fd.append('providerId', providerId.trim());
                  fd.append('serviceType', serviceType.trim());
                  fd.append('totalAmount', String(totalNum));
                  fd.append('paymentSlip', file);

                  setSubmitting(true);
                  try {
                    const resp = await fetch(`${API_BASE}/api/upload-payment`, {
                      method: 'POST',
                      body: fd,
                    });
                    const json = await resp.json().catch(() => null);
                    if (!resp.ok) {
                      setError((json && json.error) || 'Upload failed.');
                      return;
                    }
                    setInfo('Payment submitted! Admin will verify your slip. Freelancer gets 85% after approval.');
                    setProviderId('');
                    setServiceType('');
                    setTotalAmount('');
                    setFile(null);
                  } catch (e: any) {
                    setError(e?.message || 'Upload failed.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>

            {error && <div className="mt-4 text-sm font-bold text-red-600 text-right">{error}</div>}
            {info && <div className="mt-4 text-sm font-bold text-emerald-700 text-right">{info}</div>}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [tab, setTab] = useState<'payments' | 'payouts'>('payments');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) : null;

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      if (!token) {
        navigate('/admin/login', { replace: true });
        return;
      }
      const [pRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/payments`, { headers: { 'x-admin-token': token } }),
        fetch(`${API_BASE}/api/payouts`, { headers: { 'x-admin-token': token } }),
      ]);
      const pJson = await pRes.json().catch(() => null);
      const oJson = await oRes.json().catch(() => null);
      if (!pRes.ok) {
        if (pRes.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
          navigate('/admin/login', { replace: true });
          return;
        }
        throw new Error((pJson && pJson.error) || 'Failed to load payments');
      }
      if (!oRes.ok) {
        if (oRes.status === 401) {
          localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
          navigate('/admin/login', { replace: true });
          return;
        }
        throw new Error((oJson && oJson.error) || 'Failed to load payouts');
      }
      setPayments((pJson && pJson.payments) || []);
      setPayouts((oJson && oJson.payouts) || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Admin: Payments & Payouts</h1>
              <p className="text-slate-600 font-medium">Approve payments and mark payouts when you transfer manually.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className={tab === 'payments' ? 'btn-primary px-6' : 'btn-secondary px-6'} onClick={() => setTab('payments')}>
                Payments
              </button>
              <button type="button" className={tab === 'payouts' ? 'btn-primary px-6' : 'btn-secondary px-6'} onClick={() => setTab('payouts')}>
                Payouts
              </button>
              <button type="button" className="btn-secondary px-6" onClick={load}>
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && <div className="mb-6 text-sm font-bold text-red-600">{error}</div>}

          {tab === 'payments' && (
            <div className="card p-6 md:p-10 overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead>
                  <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3">User</th>
                    <th className="py-3">Provider</th>
                    <th className="py-3">Total</th>
                    <th className="py-3">Fee (15%)</th>
                    <th className="py-3">Net</th>
                    <th className="py-3">Slip</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-4 font-semibold text-slate-700">{p.user_id}</td>
                      <td className="py-4 font-semibold text-slate-700">{p.provider_id}</td>
                      <td className="py-4 font-extrabold text-slate-900">Rs. {formatMoney(Number(p.total_amount))}</td>
                      <td className="py-4 font-bold text-slate-700">Rs. {formatMoney(Number(p.platform_fee))}</td>
                      <td className="py-4 font-bold text-slate-700">Rs. {formatMoney(Number(p.net_amount))}</td>
                      <td className="py-4">
                        <a className="font-extrabold text-primary-600 hover:underline" href={`${API_BASE}${p.file_path}`} target="_blank" rel="noreferrer">
                          View
                        </a>
                      </td>
                      <td className="py-4"><StatusPill value={p.status} /></td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-primary px-4 py-2 text-sm"
                            disabled={p.status !== 'pending'}
                            onClick={async () => {
                              const t = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
                              if (!t) {
                                navigate('/admin/login', { replace: true });
                                return;
                              }
                              const resp = await fetch(`${API_BASE}/api/payments/${p.id}/approve`, {
                                method: 'PATCH',
                                headers: { 'x-admin-token': t },
                              });
                              const json = await resp.json().catch(() => null);
                              if (!resp.ok) {
                                if (resp.status === 401) {
                                  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
                                  navigate('/admin/login', { replace: true });
                                  return;
                                }
                                setError((json && json.error) || 'Approve failed');
                                return;
                              }
                              await load();
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-secondary px-4 py-2 text-sm"
                            disabled={p.status !== 'pending'}
                            onClick={async () => {
                              const t = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
                              if (!t) {
                                navigate('/admin/login', { replace: true });
                                return;
                              }
                              const resp = await fetch(`${API_BASE}/api/payments/${p.id}/reject`, {
                                method: 'PATCH',
                                headers: { 'x-admin-token': t },
                              });
                              const json = await resp.json().catch(() => null);
                              if (!resp.ok) {
                                if (resp.status === 401) {
                                  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
                                  navigate('/admin/login', { replace: true });
                                  return;
                                }
                                setError((json && json.error) || 'Reject failed');
                                return;
                              }
                              await load();
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-slate-500 font-semibold">No payments found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'payouts' && (
            <div className="card p-6 md:p-10 overflow-x-auto">
              <table className="min-w-[850px] w-full">
                <thead>
                  <tr className="text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-3">Provider</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Amount to pay</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Paid date</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="py-4 font-semibold text-slate-700">{p.provider_id}</td>
                      <td className="py-4 font-semibold text-slate-700">{p.payment_id}</td>
                      <td className="py-4 font-extrabold text-slate-900">Rs. {formatMoney(Number(p.amount_to_pay))}</td>
                      <td className="py-4"><StatusPill value={p.status} /></td>
                      <td className="py-4 font-semibold text-slate-700">{p.paid_date ? new Date(p.paid_date).toLocaleString() : '—'}</td>
                      <td className="py-4">
                        <button
                          type="button"
                          className="btn-primary px-4 py-2 text-sm"
                          disabled={p.status !== 'pending'}
                          onClick={async () => {
                            const t = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
                            if (!t) {
                              navigate('/admin/login', { replace: true });
                              return;
                            }
                            const resp = await fetch(`${API_BASE}/api/payouts/${p.id}/paid`, {
                              method: 'PATCH',
                              headers: { 'x-admin-token': t },
                            });
                            const json = await resp.json().catch(() => null);
                            if (!resp.ok) {
                              if (resp.status === 401) {
                                localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
                                navigate('/admin/login', { replace: true });
                                return;
                              }
                              setError((json && json.error) || 'Update failed');
                              return;
                            }
                            await load();
                          }}
                        >
                          Mark Paid
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 font-semibold">No payouts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
