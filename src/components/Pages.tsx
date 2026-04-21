import React, { useContext, useEffect, useState } from 'react';
import { 
  Search, 
  Layout, 
  Video, 
  Code, 
  BookOpen, 
  Camera, 
  Star, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Users,
  Menu,
  X,
  Home,
  User,
  FileText,
  Plus,
  Briefcase,
  DollarSign,
  LogOut,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate, useParams, useLocation as useRouterLocation } from 'react-router-dom';
import { AuthContext } from '../auth/AuthProvider';
import { supabase } from '../lib/supabaseClient';

type HireLankaSession = {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'freelancer';
  loggedInAt: number;
};

type HireLankaRequest = {
  id: string;
  category: string;
  title: string;
  budget: number;
  deadline: string;
  description: string;
  createdAt: number;
  clientId?: string;
  clientName?: string;
};

type HireLankaGig = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerHandle: string;
  title: string;
  category: string;
  description: string;
  requirements: string;
  packages: Record<string, { price: string; deliveryDays: string; revisions: string; desc: string }>;
  createdAt: number;
};

type HireLankaOrder = {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerHandle: string;
  gigId: string;
  gigTitle: string;
  packageName: string;
  price: number;
  serviceFee: number;
  total: number;
  notes: string;
  paymentMethod: 'card' | 'bank';
  status: 'Placed' | 'In Progress' | 'Delivered';
  createdAt: number;
};

// --- Shared Components ---

export const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { session, profile } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem('hirelanka_admin_token'));
  }, []);

  const authed = !isAdmin && !!session;

  const logout = async () => {
    if (isAdmin) {
      localStorage.removeItem('hirelanka_admin_token');
      window.location.replace('/admin/login');
      return;
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('hirelanka_session');
      localStorage.removeItem('hirelanka_authed');
    } catch {
      // ignore
    }
    window.location.replace('/auth/signin');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-glow group-hover:shadow-lg transition-shadow">
              H
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 tracking-tight">
              HireLanka
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {(isAdmin
              ? [{ label: 'Payments', path: '/admin/payments' }]
              : [
                  { label: 'Find Talent', path: '/marketplace' },
                  { label: 'Post a Request', path: '/requests' },
                  { label: 'Become a Seller', path: '/become-seller' },
                  { label: 'Dashboard', path: '/dashboard' },
                ]
            ).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="text-sm font-bold text-red-700">Admin</span>
                </div>
                <button className="btn-secondary py-2 px-4 text-sm hover:text-red-600 hover:border-red-200" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : !authed ? (
              <>
                <button
                  className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all"
                  onClick={() => navigate('/auth/signin')}
                >
                  Sign In
                </button>
                <button className="btn-primary py-2 px-5 text-sm" onClick={() => navigate('/auth/join')}>
                  Join Now
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {profile?.fullName && (
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[140px] truncate">
                      {profile.fullName}
                    </span>
                  </div>
                )}
                <button className="btn-secondary py-2 px-4 text-sm" onClick={logout}>
                  Logout
                </button>
              </div>
            )}
            <button
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-white p-6 md:hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">HireLanka</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {(isAdmin
                ? [{ label: 'Payments', path: '/admin/payments' }]
                : [
                    { label: 'Home', path: '/' },
                    { label: 'Find Talent', path: '/marketplace' },
                    { label: 'Post a Request', path: '/requests' },
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Messages', path: '/messages' },
                    { label: 'Become a Seller', path: '/become-seller' },
                  ]
              ).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <hr className="border-slate-100 my-3" />
              {!authed ? (
                <>
                  <Link to="/auth/signin" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-base font-semibold text-slate-700 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Sign In</Link>
                  <Link to="/auth/join" onClick={() => setIsMobileMenuOpen(false)} className="mx-4 mt-2 btn-primary text-center py-3">Join Now</Link>
                </>
              ) : (
                <button
                  type="button"
                  className="px-4 py-3 text-left text-base font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const FreelancerProfilePage = () => {
  const params = useParams();
  const handle = params.handle || 'aruni';

  const [freelancer, setFreelancer] = useState<any | null>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingPortfolio(true);
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, full_name, handle')
        .eq('handle', handle)
        .maybeSingle();

      if (!mounted) return;
      setFreelancer(prof || null);

      const ownerId = (prof as any)?.id;
      if (!ownerId) {
        setPortfolio([]);
        setLoadingPortfolio(false);
        return;
      }

      const { data: items } = await supabase
        .from('portfolio_items')
        .select('id, image_url, created_at')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })
        .limit(24);

      if (!mounted) return;
      setPortfolio(items || []);
      setLoadingPortfolio(false);
    })();

    return () => {
      mounted = false;
    };
  }, [handle]);

  const skills = ['Logo Design', 'Brand Identity', 'Social Media', 'Packaging'];
  const reviews = [
    { name: 'Kasun', text: 'Very professional work and fast delivery. Highly recommended!', rating: 5 },
    { name: 'Madu', text: 'Great communication and quality. Will order again.', rating: 5 },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-200 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`}
                      alt={handle}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-900 capitalize">{freelancer?.full_name || handle}</div>
                    <div className="text-slate-600 font-semibold mt-1">Top Rated Seller • Sri Lanka</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-extrabold text-primary-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      to={`/messages${freelancer?.id ? `?partnerId=${encodeURIComponent(String(freelancer.id))}` : ''}`}
                      className="btn-secondary px-6 py-3 text-center"
                    >
                      Message
                    </Link>
                    <Link to="/marketplace" className="btn-primary px-6 py-3 text-center">Hire</Link>
                  </div>
                </div>
              </div>

              <div className="card p-6 md:p-10">
                <div className="font-extrabold text-slate-900 text-lg mb-3">About</div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  I help Sri Lankan businesses build modern brands with clean logo systems, social media kits, and fast communication.
                </p>
              </div>

              <div className="card p-6 md:p-10">
                <div className="font-extrabold text-slate-900 text-lg mb-6">Reviews</div>
                <div className="space-y-5">
                  {reviews.map((r, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-slate-900">{r.name}</div>
                        <div className="text-sm font-extrabold text-slate-900">{r.rating}.0 / 5</div>
                      </div>
                      <div className="text-slate-600 font-medium mt-2">{r.text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 md:p-10">
                <div className="font-extrabold text-slate-900 text-lg mb-6">Portfolio</div>
                {loadingPortfolio ? (
                  <div className="text-slate-500 font-medium">Loading...</div>
                ) : portfolio.length === 0 ? (
                  <div className="text-slate-500 font-medium">No portfolio items yet.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {portfolio.map((p: any) => (
                      <div key={p.id} className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                        <img src={p.image_url} alt="portfolio" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-6">
              <div className="card p-6 md:p-8">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stats</div>
                <div className="mt-4 space-y-3 text-slate-700 font-semibold">
                  <div className="flex items-center justify-between"><span>Rating</span><span className="font-black text-slate-900">4.9</span></div>
                  <div className="flex items-center justify-between"><span>Response time</span><span className="font-black text-slate-900">~1 hour</span></div>
                  <div className="flex items-center justify-between"><span>Orders</span><span className="font-black text-slate-900">124</span></div>
                </div>
              </div>

              <div className="card p-6 md:p-8">
                <div className="font-extrabold text-slate-900 mb-2">Hire this freelancer</div>
                <p className="text-slate-500 font-medium text-sm">Browse gigs and place an order securely.</p>
                <Link to="/marketplace" className="btn-primary w-full py-3 mt-5 text-center">Go to Marketplace</Link>
              </div>
            </aside>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const BrowseRequestsPage = () => {
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);
  const [category, setCategory] = useState('All');
  const [remoteRequests, setRemoteRequests] = useState<HireLankaRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const seed: HireLankaRequest[] = [
    {
      id: 'r1',
      title: 'Need a logo for a small tea shop in Galle',
      budget: 6000,
      category: 'Graphic Design',
      deadline: '3 days',
      description: 'Minimal, modern logo. Provide 2–3 concepts and final files.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      clientName: 'Nimal',
    },
    {
      id: 'r2',
      title: 'Edit a 60s TikTok-style promo video',
      budget: 9000,
      category: 'Video & Animation',
      deadline: '2 days',
      description: 'Fast cuts, captions, and upbeat music. I will provide raw clips.',
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
      clientName: 'Sachi',
    },
    {
      id: 'r3',
      title: 'Build a simple landing page for my tuition class',
      budget: 25000,
      category: 'Tech & IT',
      deadline: '7 days',
      description: 'One-page site with contact form and WhatsApp button.',
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      clientName: 'Madu',
    },
  ];

  useEffect(() => {
    let mounted = true;
    const channelRef: { current: any } = { current: null };

    const fetchRequests = async () => {
      setLoadingRequests(true);
      const { data, error } = await supabase
        .from('requests')
        .select('id, category, title, budget, deadline, description, created_at, client_id, client:profiles!requests_client_id_fkey(id, full_name)')
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        setRemoteRequests([]);
        setLoadingRequests(false);
        return;
      }

      const mapped: HireLankaRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        category: r.category,
        title: r.title,
        budget: Number(r.budget || 0),
        deadline: r.deadline,
        description: r.description,
        createdAt: new Date(r.created_at).getTime(),
        clientId: r.client_id,
        clientName: r.client?.full_name,
      }));

      setRemoteRequests(mapped);
      setLoadingRequests(false);
    };

    fetchRequests();

    const chName = 'requests-feed';
    const existing = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(chName));
    if (existing) supabase.removeChannel(existing);

    channelRef.current = supabase
      .channel(chName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, async () => {
        await fetchRequests();
      })
      .subscribe();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const requests = [...remoteRequests, ...(loadingRequests ? [] : seed)].sort((a, b) => b.createdAt - a.createdAt);

  const filtered = category === 'All' ? requests : requests.filter((r) => r.category === category);
  const canPost = Boolean(profile?.role === 'client');
  const isFreelancer = Boolean(profile?.role === 'freelancer');
  const isClient = Boolean(profile?.role === 'client');

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Client Requests</h1>
              <p className="text-slate-600 font-medium">Post a request or browse client needs.</p>
            </div>
            <div className="flex gap-3">
              <select className="input-field py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['All', 'Graphic Design', 'Video & Animation', 'Writing', 'Tech & IT', 'Tuition', 'Photography'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {canPost && (
                <button type="button" className="btn-primary px-6" onClick={() => navigate('/requests/new')}>
                  Post a Request
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((r) => (
              <div key={r.id} className="card p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{r.category}</div>
                    <div className="mt-2 text-lg md:text-xl font-extrabold text-slate-900">{r.title}</div>
                    <div className="mt-2 text-sm text-slate-500 font-medium">
                      {r.clientName ? `Client: ${r.clientName} • ` : ''}Posted: {new Date(r.createdAt).toLocaleDateString()} • Deadline: {r.deadline}
                    </div>
                    {r.description && <div className="mt-3 text-sm text-slate-600 font-medium">{r.description}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget</div>
                    <div className="text-lg font-black text-slate-900">Rs. {r.budget.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  {isClient && String(r.clientId || '') === String(profile?.id || '') && (
                    <button
                      type="button"
                      className="btn-secondary px-6 py-3 disabled:opacity-50"
                      disabled={deletingId === String(r.id)}
                      onClick={async () => {
                        try {
                          const ok = window.confirm('Delete this request? This action cannot be undone.');
                          if (!ok) return;
                          setDeletingId(String(r.id));
                          const { error } = await supabase
                            .from('requests')
                            .delete()
                            .eq('id', r.id)
                            .eq('client_id', profile?.id);
                          if (error) {
                            window.alert(error.message || 'Unable to delete request.');
                            return;
                          }
                          setRemoteRequests((prev) => prev.filter((x) => String(x.id) !== String(r.id)));
                        } catch {
                          // ignore
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                    >
                      {deletingId === String(r.id) ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                  {isFreelancer && (
                    <button
                      type="button"
                      className="btn-primary px-6 py-3 disabled:opacity-50"
                      onClick={() => {
                        if (!r.clientId) return;
                        navigate(
                          `/messages?partnerId=${encodeURIComponent(String(r.clientId))}&requestId=${encodeURIComponent(String(r.id))}`
                        );
                      }}
                      disabled={!r.clientId}
                    >
                      Message Client
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const CreateRequestPage = () => {
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);
  const [category, setCategory] = useState('Graphic Design');
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('3 days');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Post a Request</h1>
              <p className="text-slate-600 font-medium">Describe what you need and freelancers will send offers.</p>
            </div>
            <button type="button" className="btn-secondary px-6 py-3" onClick={() => navigate('/requests')}>
              Browse
            </button>
          </div>

          <div className="card p-6 md:p-10 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Category</label>
              <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Graphic Design', 'Video & Animation', 'Writing', 'Tech & IT', 'Tuition', 'Photography'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Title</label>
              <input className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., I need a logo for my new cafe" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Budget (LKR)</label>
                <input type="number" className="input-field" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="6000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Deadline</label>
                <select className="input-field" value={deadline} onChange={(e) => setDeadline(e.target.value)}>
                  {['1 day', '2 days', '3 days', '7 days', '14 days'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <textarea className="input-field min-h-[160px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your requirements, references, and what you will provide." />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <button type="button" className="btn-secondary px-6 py-3" onClick={() => navigate('/requests')}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary px-6 py-3 disabled:opacity-50"
                disabled={publishing}
                onClick={async () => {
                  if (publishing) return;
                  setPublishing(true);
                  setError('');
                  try {
                    const budgetNumber = Number(budget);
                    if (title.trim().length < 5) {
                      setError('Please add a more descriptive title.');
                      return;
                    }
                    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
                      setError('Please enter a valid budget.');
                      return;
                    }
                    if (description.trim().length < 20) {
                      setError('Please add a description (at least 20 characters).');
                      return;
                    }

                    if (!profile?.id) {
                      setError('Please sign in to publish a request.');
                      return;
                    }

                    const { error: insertError } = await supabase.from('requests').insert({
                      client_id: profile.id,
                      category,
                      title: title.trim(),
                      budget: Math.round(budgetNumber),
                      deadline,
                      description: description.trim(),
                    });

                    if (insertError) {
                      setError(insertError.message || 'Unable to publish request.');
                      return;
                    }
                    navigate('/requests');
                  } finally {
                    setPublishing(false);
                  }
                }}
              >
                {publishing ? 'Publishing...' : 'Publish Request'}
              </button>
            </div>
            {error && <div className="text-sm font-bold text-red-600 text-right">{error}</div>}
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

/* ---------- Invoices System ---------- */

type InvoiceMilestone = {
  label: string;
  amount: number;
  status: 'pending' | 'proof_submitted' | 'paid';
  proof_url?: string;
};

type InvoiceRow = {
  id: string;
  order_id: string | null;
  client_id: string;
  client_name: string;
  freelancer_id: string;
  type: 'final' | 'milestone';
  title: string;
  description: string;
  total_amount: number;
  milestones: InvoiceMilestone[];
  status: 'draft' | 'sent' | 'proof_submitted' | 'paid' | 'cancelled';
  created_at: string;
  payment_proof_url: string | null;
};

const SellerInvoicesTab = ({ profile, orders }: { profile: any; orders: any[] }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [invType, setInvType] = useState<'final' | 'milestone'>('final');
  const [invTitle, setInvTitle] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invOrderId, setInvOrderId] = useState('');
  const [invClientId, setInvClientId] = useState('');
  const [invTotal, setInvTotal] = useState('');
  const [milestoneCount, setMilestoneCount] = useState(2);
  const [milestoneLabels, setMilestoneLabels] = useState<string[]>(['Part 1', 'Part 2']);
  const [milestoneAmounts, setMilestoneAmounts] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchInvoices = async () => {
    if (!profile?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('invoices')
      .select('id, order_id, client_id, type, title, description, total_amount, milestones, status, created_at, client:profiles!invoices_client_id_fkey(id, full_name)')
      .eq('freelancer_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    const mapped: InvoiceRow[] = (data || []).map((r: any) => ({
      id: r.id,
      order_id: r.order_id,
      client_id: r.client_id,
      client_name: r.client?.full_name || 'Client',
      freelancer_id: profile.id,
      type: r.type,
      title: r.title,
      description: r.description || '',
      total_amount: Number(r.total_amount || 0),
      milestones: Array.isArray(r.milestones) ? r.milestones : [],
      status: r.status,
      created_at: r.created_at,
      payment_proof_url: r.payment_proof_url || null,
    }));
    setInvoices(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, [profile?.id]);

  const handleMilestoneCountChange = (count: number) => {
    setMilestoneCount(count);
    const newLabels = Array.from({ length: count }, (_, i) => milestoneLabels[i] || `Part ${i + 1}`);
    const newAmounts = Array.from({ length: count }, (_, i) => milestoneAmounts[i] || '');
    setMilestoneLabels(newLabels);
    setMilestoneAmounts(newAmounts);
  };

  const handleSubmit = async () => {
    if (!profile?.id) return;
    setFormError('');
    if (!invTitle.trim()) { setFormError('Title is required.'); return; }
    if (!invClientId) { setFormError('Select a client/order.'); return; }

    const totalNum = Number(invTotal);
    if (!Number.isFinite(totalNum) || totalNum <= 0) { setFormError('Enter a valid total amount.'); return; }

    let milestones: InvoiceMilestone[] = [];
    if (invType === 'milestone') {
      let sum = 0;
      for (let i = 0; i < milestoneCount; i++) {
        const amt = Number(milestoneAmounts[i] || 0);
        if (!Number.isFinite(amt) || amt <= 0) {
          setFormError(`Amount for "${milestoneLabels[i] || `Part ${i + 1}`}" must be positive.`);
          return;
        }
        sum += amt;
        milestones.push({ label: milestoneLabels[i] || `Part ${i + 1}`, amount: Math.round(amt), status: 'pending' });
      }
      if (Math.abs(sum - totalNum) > 1) {
        setFormError(`Milestone amounts (${sum}) must equal total (${totalNum}).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('invoices').insert({
        freelancer_id: profile.id,
        client_id: invClientId,
        order_id: invOrderId || null,
        type: invType,
        title: invTitle.trim(),
        description: invDesc.trim(),
        total_amount: Math.round(totalNum),
        milestones: invType === 'milestone' ? milestones : null,
        status: 'sent',
      });
      if (error) {
        setFormError(error.message || 'Failed to create invoice.');
        return;
      }
      setShowCreate(false);
      setInvTitle('');
      setInvDesc('');
      setInvTotal('');
      setMilestoneCount(2);
      setMilestoneLabels(['Part 1', 'Part 2']);
      setMilestoneAmounts(['', '']);
      await fetchInvoices();
    } finally {
      setSubmitting(false);
    }
  };

  const statusPill = (s: string) => {
    const cls = s === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : s === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700'
      : s === 'proof_submitted' ? 'bg-purple-50 border-purple-200 text-purple-700'
      : s === 'sent' ? 'bg-blue-50 border-blue-200 text-blue-700'
      : 'bg-amber-50 border-amber-200 text-amber-700';
    const label = s === 'proof_submitted' ? 'Proof Submitted' : s;
    return <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${cls}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="font-extrabold text-slate-900 text-lg">Invoices</div>
        <button type="button" className="btn-primary px-5 py-2 text-sm" onClick={() => setShowCreate(!showCreate)}>
          <span className="flex items-center gap-1"><Plus className="w-4 h-4" /> Create Invoice</span>
        </button>
      </div>

      {showCreate && (
        <div className="card p-6 md:p-8 space-y-5 border-2 border-primary-200">
          <div className="font-bold text-slate-900">New Invoice</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Invoice Type</label>
              <select className="input-field" value={invType} onChange={(e) => setInvType(e.target.value as 'final' | 'milestone')}>
                <option value="final">Final Invoice (full payment)</option>
                <option value="milestone">Milestone Invoice (break into parts)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Link to Order</label>
              <select
                className="input-field"
                value={invOrderId}
                onChange={(e) => {
                  const oid = e.target.value;
                  setInvOrderId(oid);
                  const sel = orders.find((o: any) => String(o.id) === oid);
                  if (sel) {
                    setInvClientId(sel.clientId || '');
                    if (!invTitle) setInvTitle(sel.gig || '');
                  }
                }}
              >
                <option value="">— Select an order —</option>
                {orders.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.gig} — {o.client}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Title</label>
            <input className="input-field" value={invTitle} onChange={(e) => setInvTitle(e.target.value)} placeholder="e.g., Logo Design Payment" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Description</label>
            <textarea className="input-field min-h-[80px]" value={invDesc} onChange={(e) => setInvDesc(e.target.value)} placeholder="Optional details about this invoice" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Total Amount (LKR)</label>
            <input type="number" className="input-field" value={invTotal} onChange={(e) => setInvTotal(e.target.value)} placeholder="25000" />
          </div>

          {invType === 'milestone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Number of Parts</label>
                <select className="input-field w-32" value={milestoneCount} onChange={(e) => handleMilestoneCountChange(Number(e.target.value))}>
                  {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} parts</option>)}
                </select>
              </div>
              {Array.from({ length: milestoneCount }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Part {i + 1} Label</label>
                    <input className="input-field text-sm" value={milestoneLabels[i] || ''} onChange={(e) => {
                      const next = [...milestoneLabels];
                      next[i] = e.target.value;
                      setMilestoneLabels(next);
                    }} placeholder={`Part ${i + 1}`} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Amount (LKR)</label>
                    <input type="number" className="input-field text-sm" value={milestoneAmounts[i] || ''} onChange={(e) => {
                      const next = [...milestoneAmounts];
                      next[i] = e.target.value;
                      setMilestoneAmounts(next);
                    }} placeholder="0" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {formError && <div className="text-red-600 text-sm font-bold">{formError}</div>}

          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary px-5 py-2 text-sm" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="button" className="btn-primary px-5 py-2 text-sm disabled:opacity-50" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Creating...' : 'Send Invoice'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-slate-400 font-medium">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="card p-6 text-slate-500 font-medium">No invoices yet. Create one to bill a client.</div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="card p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">{inv.title}</div>
                  <div className="text-sm text-slate-500 font-medium">
                    {inv.client_name} • {inv.type === 'milestone' ? 'Milestone' : 'Final'} • {new Date(inv.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-black text-slate-900">Rs. {inv.total_amount.toLocaleString()}</span>
                {statusPill(inv.status)}
                <button type="button" className="btn-secondary px-4 py-2 text-sm" onClick={() => navigate(`/invoice/${inv.id}`)}>
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);
  const invoiceRef = React.useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<InvoiceRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [proofModal, setProofModal] = useState<{ type: 'final' | 'milestone'; index?: number } | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('id, order_id, client_id, type, title, description, total_amount, milestones, payment_proof_url, status, created_at, freelancer:profiles!invoices_freelancer_id_fkey(id, full_name), client:profiles!invoices_client_id_fkey(id, full_name)')
        .eq('id', id)
        .single();

      if (error || !data) {
        setInvoice(null);
        setLoading(false);
        return;
      }

      const r: any = data;
      setInvoice({
        id: r.id,
        order_id: r.order_id,
        client_id: r.client_id,
        client_name: r.client?.full_name || 'Client',
        freelancer_id: r.freelancer?.id || '',
        type: r.type,
        title: r.title,
        description: r.description || '',
        total_amount: Number(r.total_amount || 0),
        milestones: Array.isArray(r.milestones) ? r.milestones : [],
        status: r.status,
        created_at: r.created_at,
        payment_proof_url: r.payment_proof_url || null,
      });
      setLoading(false);
    };
    fetchInvoice();
  }, [id, profile?.id]);

  const isFreelancer = profile?.role === 'freelancer';
  const isClient = profile?.role === 'client';
  const isOwner = isFreelancer && String(invoice?.freelancer_id) === String(profile?.id);
  const isRecipient = isClient && String(invoice?.client_id) === String(profile?.id);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      if (!invoice) return;

      const [{ jsPDF }, autoTableMod] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const autoTable = (autoTableMod as any).default || (autoTableMod as any);

      const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const left = 14;
      const right = pageWidth - 14;

      const invoiceNo = String(invoice.id).slice(0, 8).toUpperCase();
      const dateStr = new Date(invoice.created_at).toLocaleDateString();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('INVOICE', left, 18);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('HireLanka', left, 26);

      doc.setFont('helvetica', 'bold');
      doc.text(`Invoice #: ${invoiceNo}`, right, 18, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${dateStr}`, right, 24, { align: 'right' });

      doc.setDrawColor(230);
      doc.line(left, 30, right, 30);

      doc.setFont('helvetica', 'bold');
      doc.text('Bill To', left, 38);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.client_name || 'Client', left, 44);

      doc.setFont('helvetica', 'bold');
      doc.text('Invoice Type', right, 38, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.type === 'milestone' ? 'Milestones' : 'One-time', right, 44, { align: 'right' });

      const rows: any[] = [];
      if (invoice.type === 'milestone' && invoice.milestones?.length) {
        invoice.milestones.forEach((m, idx) => {
          rows.push([
            `${idx + 1}. ${m.label}`,
            `Rs. ${Number(m.amount || 0).toLocaleString()}`,
            m.status === 'paid' ? 'Paid' : m.status === 'proof_submitted' ? 'Proof Submitted' : 'Pending',
          ]);
        });
      } else {
        rows.push([
          invoice.title,
          `Rs. ${Number(invoice.total_amount || 0).toLocaleString()}`,
          invoice.status === 'paid' ? 'Paid' : invoice.status === 'proof_submitted' ? 'Proof Submitted' : 'Pending',
        ]);
      }

      autoTable(doc, {
        startY: 54,
        head: [['Description', 'Amount', 'Status']],
        body: rows,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 35, halign: 'right' },
          2: { cellWidth: 30, halign: 'right' },
        },
      });

      const endY = (doc as any).lastAutoTable?.finalY ? Number((doc as any).lastAutoTable.finalY) : 54;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total', right - 45, endY + 12);
      doc.text(`Rs. ${Number(invoice.total_amount || 0).toLocaleString()}`, right, endY + 12, { align: 'right' });

      if (invoice.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Notes', left, endY + 24);
        doc.setFont('helvetica', 'normal');
        const wrapped = doc.splitTextToSize(invoice.description, right - left);
        doc.text(wrapped, left, endY + 30);
      }

      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text('Generated by HireLanka • This invoice is valid without signature.', left, 290);

      doc.save(`invoice-${invoiceNo}.pdf`);
    } catch (err) {
      window.alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const uploadProofAndPay = async (file: File, type: 'final' | 'milestone', index?: number) => {
    if (!invoice || !profile?.id) return;
    setUploadingProof(true);
    try {
      const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${file.name}`;
      const path = `proofs/${profile.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, file, { upsert: false });
      if (uploadError) {
        window.alert(uploadError.message);
        return;
      }
      const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
      const proofUrl = (pub as any)?.publicUrl ? String((pub as any).publicUrl) : '';

      if (type === 'final') {
        const { error } = await supabase
          .from('invoices')
          .update({ status: 'proof_submitted', payment_proof_url: proofUrl })
          .eq('id', invoice.id);
        if (error) { window.alert(error.message); return; }
        setInvoice({ ...invoice, status: 'proof_submitted', payment_proof_url: proofUrl });
      } else if (type === 'milestone' && index !== undefined) {
        const updated = [...invoice.milestones];
        updated[index] = { ...updated[index], status: 'proof_submitted', proof_url: proofUrl };
        const anyProofSubmitted = updated.some((m) => m.status === 'proof_submitted');
        const { error } = await supabase
          .from('invoices')
          .update({ milestones: updated, status: anyProofSubmitted ? 'proof_submitted' : invoice.status, payment_proof_url: proofUrl })
          .eq('id', invoice.id);
        if (error) { window.alert(error.message); return; }
        setInvoice({ ...invoice, milestones: updated, status: anyProofSubmitted ? 'proof_submitted' : invoice.status, payment_proof_url: proofUrl });
      }
      setProofModal(null);
    } finally {
      setUploadingProof(false);
    }
  };

  const handleConfirmProof = async (type: 'final' | 'milestone', index?: number) => {
    if (!invoice) return;
    if (type === 'final') {
      const { error } = await supabase.from('invoices').update({ status: 'paid' }).eq('id', invoice.id);
      if (error) { window.alert(error.message); return; }
      setInvoice({ ...invoice, status: 'paid' });
    } else if (type === 'milestone' && index !== undefined) {
      const updated = [...invoice.milestones];
      updated[index] = { ...updated[index], status: 'paid' };
      const allPaid = updated.every((m) => m.status === 'paid');
      const { error } = await supabase
        .from('invoices')
        .update({ milestones: updated, status: allPaid ? 'paid' : 'sent' })
        .eq('id', invoice.id);
      if (error) { window.alert(error.message); return; }
      setInvoice({ ...invoice, milestones: updated, status: allPaid ? 'paid' : 'sent' });
    }
  };

  const handleRejectProof = async (type: 'final' | 'milestone', index?: number) => {
    if (!invoice) return;
    if (type === 'final') {
      const { error } = await supabase.from('invoices').update({ status: 'sent', payment_proof_url: null }).eq('id', invoice.id);
      if (error) { window.alert(error.message); return; }
      setInvoice({ ...invoice, status: 'sent', payment_proof_url: null });
    } else if (type === 'milestone' && index !== undefined) {
      const updated = [...invoice.milestones];
      updated[index] = { ...updated[index], status: 'pending', proof_url: undefined };
      const anyProofSubmitted = updated.some((m) => m.status === 'proof_submitted');
      const { error } = await supabase
        .from('invoices')
        .update({ milestones: updated, status: anyProofSubmitted ? 'proof_submitted' : 'sent' })
        .eq('id', invoice.id);
      if (error) { window.alert(error.message); return; }
      setInvoice({ ...invoice, milestones: updated, status: anyProofSubmitted ? 'proof_submitted' : 'sent' });
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;
    const ok = window.confirm('Cancel this invoice?');
    if (!ok) return;
    const { error } = await supabase.from('invoices').update({ status: 'cancelled' }).eq('id', invoice.id);
    if (error) { window.alert(error.message); return; }
    setInvoice({ ...invoice, status: 'cancelled' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center text-slate-400">Invoice not found</div>;

  const statusPill = (s: string) => {
    const cls = s === 'paid' ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
      : s === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700'
      : s === 'proof_submitted' ? 'bg-purple-50 border-purple-200 text-purple-700'
      : s === 'sent' ? 'bg-blue-50 border-blue-200 text-blue-700'
      : 'bg-amber-50 border-amber-200 text-amber-700';
    const label = s === 'proof_submitted' ? 'Proof Submitted' : s;
    return <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${cls}`}>{label}</span>;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-center justify-between mb-6">
            <button type="button" className="text-primary-600 font-bold text-sm flex items-center gap-1" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <button
              type="button"
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-50"
              disabled={downloadingPdf}
              onClick={handleDownloadPdf}
            >
              {downloadingPdf ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* PDF-printable invoice content */}
          <div
            ref={invoiceRef}
            className="bg-white"
            style={{ width: '794px', minHeight: '1123px', padding: '40px', margin: '0 auto' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-slate-900 font-black text-xl">HireLanka</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
                  {invoice.type === 'milestone' ? 'Milestone Invoice' : 'Final Invoice'}
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{invoice.title}</h1>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase">Invoice</div>
                <div className="font-black text-slate-900">#{String(invoice.id).slice(0, 8).toUpperCase()}</div>
                <div className="mt-2">{statusPill(invoice.status)}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 text-sm">
              <div className="border border-slate-100 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-400 uppercase">Bill To</div>
                <div className="font-extrabold text-slate-900 mt-1">{invoice.client_name}</div>
              </div>
              <div className="border border-slate-100 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Date</div>
                    <div className="font-extrabold text-slate-900 mt-1">{new Date(invoice.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Type</div>
                    <div className="font-extrabold text-slate-900 mt-1">{invoice.type === 'milestone' ? 'Milestones' : 'One-time'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-slate-400 uppercase">Total</div>
                    <div className="font-black text-2xl text-slate-900 mt-1">Rs. {invoice.total_amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {invoice.description && (
              <div className="mt-8">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Description</div>
                <div className="border border-slate-100 rounded-xl p-4 text-slate-700 font-medium">{invoice.description}</div>
              </div>
            )}

            {invoice.type === 'milestone' && invoice.milestones.length > 0 && (
              <div className="mt-8">
                <div className="text-xs font-bold text-slate-400 uppercase mb-3">Milestones</div>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-0 bg-slate-50 text-xs font-bold text-slate-500">
                    <div className="col-span-6 p-3">Item</div>
                    <div className="col-span-3 p-3 text-right">Amount</div>
                    <div className="col-span-3 p-3 text-right">Status</div>
                  </div>
                  {invoice.milestones.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 gap-0 border-t border-slate-100 text-sm">
                      <div className="col-span-6 p-3">
                        <div className="font-bold text-slate-900">{m.label}</div>
                        {m.proof_url && (
                          <a href={m.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 font-bold mt-1 inline-block hover:underline">
                            Payment Proof ↗
                          </a>
                        )}
                      </div>
                      <div className="col-span-3 p-3 text-right font-extrabold text-slate-900">Rs. {Number(m.amount).toLocaleString()}</div>
                      <div className="col-span-3 p-3 text-right">
                        <span className={`px-3 py-1 rounded-full border text-xs font-extrabold ${
                          m.status === 'paid'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : m.status === 'proof_submitted'
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                        >
                          {m.status === 'proof_submitted' ? 'Proof Submitted' : m.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invoice.payment_proof_url && invoice.type === 'final' && (
              <div className="mt-8">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Payment Proof</div>
                <a href={invoice.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold text-sm hover:underline">
                  View Payment Proof ↗
                </a>
              </div>
            )}

            <div className="mt-12 pt-6 border-t border-slate-100 text-xs text-slate-400 font-medium">
              Generated by HireLanka • This invoice is valid without signature.
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {invoice.type === 'final' && isRecipient && invoice.status === 'sent' && (
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-primary px-6 py-3" onClick={() => setProofModal({ type: 'final' })}>
                  Submit Payment Proof
                </button>
              </div>
            )}

            {invoice.status === 'proof_submitted' && isRecipient && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                <ShieldCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-extrabold text-purple-700">Proof Submitted</div>
                <div className="text-sm text-purple-600 font-medium">Your payment proof has been sent. Waiting for the freelancer to confirm.</div>
              </div>
            )}

            {invoice.status === 'proof_submitted' && isOwner && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="font-extrabold text-purple-700 mb-3 text-center">Payment Proof Submitted by Client</div>
                <div className="text-sm text-purple-600 font-medium text-center mb-4">Review the proof and confirm or reject the payment.</div>
                <div className="flex gap-3 justify-center flex-wrap">
                  <button type="button" className="btn-primary px-6 py-3" onClick={() => handleConfirmProof('final')}>Confirm Payment</button>
                  <button type="button" className="btn-secondary px-6 py-3 hover:text-red-600" onClick={() => handleRejectProof('final')}>Reject Proof</button>
                </div>
              </div>
            )}

            {invoice.type === 'milestone' && invoice.milestones.length > 0 && (
              <div className="space-y-3">
                {invoice.milestones.map((m, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{m.label}</div>
                      <div className="text-sm text-slate-500 font-medium">Rs. {Number(m.amount).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {m.status === 'paid' ? (
                        <span className="px-3 py-1 rounded-full border text-xs font-extrabold bg-emerald-50 border-emerald-200 text-emerald-700">Paid</span>
                      ) : m.status === 'proof_submitted' ? (
                        <>
                          {isRecipient && (
                            <span className="px-3 py-1 rounded-full border text-xs font-extrabold bg-purple-50 border-purple-200 text-purple-700">Awaiting Confirmation</span>
                          )}
                          {isOwner && (
                            <>
                              <button type="button" className="btn-primary px-4 py-2 text-xs" onClick={() => handleConfirmProof('milestone', i)}>Confirm</button>
                              <button type="button" className="btn-secondary px-4 py-2 text-xs hover:text-red-600" onClick={() => handleRejectProof('milestone', i)}>Reject</button>
                            </>
                          )}
                        </>
                      ) : isRecipient && invoice.status !== 'cancelled' && invoice.status !== 'paid' ? (
                        <button type="button" className="btn-primary px-4 py-2 text-xs" onClick={() => setProofModal({ type: 'milestone', index: i })}>
                          Submit Payment Proof
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full border text-xs font-extrabold bg-amber-50 border-amber-200 text-amber-700">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isOwner && invoice.status === 'sent' && (
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-secondary px-5 py-2 text-sm hover:text-red-600" onClick={handleCancel}>
                  Cancel Invoice
                </button>
              </div>
            )}

            {invoice.status === 'paid' && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="font-extrabold text-emerald-700">Payment Complete</div>
                <div className="text-sm text-emerald-600 font-medium">This invoice has been fully paid.</div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Proof Upload Modal */}
        {proofModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
              <div className="font-extrabold text-slate-900 text-lg">Submit Payment Proof</div>
              <p className="text-slate-500 text-sm font-medium">
                Upload a screenshot or receipt of your payment. This will be shared with the freelancer as proof of payment.
              </p>
              <ProofUploadForm
                uploading={uploadingProof}
                onSubmit={async (file) => {
                  await uploadProofAndPay(file, proofModal.type, proofModal.index);
                }}
                onCancel={() => setProofModal(null)}
              />
            </div>
          </div>
        )}

        <BottomNav />
      </div>
    </PageTransition>
  );
};

const ProofUploadForm = ({ uploading, onSubmit, onCancel }: { uploading: boolean; onSubmit: (file: File) => Promise<void>; onCancel: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          id="proof-upload"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
        <label htmlFor="proof-upload" className="cursor-pointer">
          {file ? (
            <div>
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900 text-sm">{file.name}</div>
              <div className="text-xs text-slate-400 mt-1">Click to change</div>
            </div>
          ) : (
            <div>
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-600 text-sm">Click to upload proof</div>
              <div className="text-xs text-slate-400 mt-1">Image or PDF</div>
            </div>
          )}
        </label>
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" className="btn-secondary px-5 py-2 text-sm" onClick={onCancel} disabled={uploading}>Cancel</button>
        <button
          type="button"
          className="btn-primary px-5 py-2 text-sm disabled:opacity-50"
          disabled={!file || uploading}
          onClick={async () => { if (file) await onSubmit(file); }}
        >
          {uploading ? 'Uploading...' : 'Submit & Mark Paid'}
        </button>
      </div>
    </div>
  );
};

export const SellerDashboardPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Overview' | 'Orders' | 'Gigs' | 'Portfolio' | 'Earnings' | 'Invoices'>('Overview');
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('hirelanka_session');
      localStorage.removeItem('hirelanka_authed');
    } catch {
      // ignore
    }
    window.location.replace('/auth/signin');
  };

  const { profile } = useContext(AuthContext);
  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  useEffect(() => {
    let mounted = true;
    const channelsRef: { current: any[] } = { current: [] };

    const fetchAll = async () => {
      if (!profile?.id) return;
      const [{ data: gigsData }, { data: ordersData }, { data: portfolioData }] = await Promise.all([
        supabase.from('gigs').select('id, title, packages, created_at').eq('owner_id', profile.id).order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id, status, created_at, buyer:profiles!orders_buyer_id_fkey(id, full_name), gig:gigs(id, title)')
          .eq('seller_id', profile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('portfolio_items')
          .select('id, image_url, created_at')
          .eq('owner_id', profile.id)
          .order('created_at', { ascending: false }),
      ]);

      if (!mounted) return;
      setMyGigs(gigsData || []);
      setMyOrders(ordersData || []);
      setPortfolioItems(portfolioData || []);
    };

    (async () => {
      if (!profile?.id) {
        setMyGigs([]);
        setMyOrders([]);
        return;
      }

      await fetchAll();

      const ordersChName = `orders-seller-${profile.id}`;
      const existingOrders = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(ordersChName));
      if (existingOrders) supabase.removeChannel(existingOrders);

      const ordersChannel = supabase
        .channel(ordersChName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `seller_id=eq.${profile.id}` },
          async () => {
            await fetchAll();
          }
        )
        .subscribe();
      channelsRef.current.push(ordersChannel);

      const gigsChName = `gigs-owner-${profile.id}`;
      const existingGigs = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(gigsChName));
      if (existingGigs) supabase.removeChannel(existingGigs);

      const gigsChannel = supabase
        .channel(gigsChName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'gigs', filter: `owner_id=eq.${profile.id}` },
          async () => {
            await fetchAll();
          }
        )
        .subscribe();
      channelsRef.current.push(gigsChannel);
    })();

    return () => {
      mounted = false;
      channelsRef.current.forEach(ch => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [profile?.id]);

  const gigs = myGigs.map((g: any) => ({
    id: g.id,
    title: g.title,
    price: Number(g.packages?.Basic?.price || 0),
    status: 'Active',
  }));

  const deleteGig = async (gigId: string) => {
    if (!profile?.id) return;
    if (!gigId) return;
    const ok = window.confirm('Delete this gig? This cannot be undone.');
    if (!ok) return;

    const { error } = await supabase.from('gigs').delete().eq('id', gigId).eq('owner_id', profile.id);
    if (error) {
      window.alert(error.message);
      return;
    }
    setMyGigs((prev) => (prev || []).filter((g: any) => String(g?.id) !== String(gigId)));
  };

  const orders = myOrders.map((o: any) => ({
    id: o.id,
    clientId: o.buyer?.id,
    client: o.buyer?.full_name || 'Client',
    gig: o.gig?.title || '—',
    status: o.status,
    due: '—',
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Seller Dashboard</h1>
              <p className="text-slate-500 font-medium mt-1">Manage gigs, orders, and earnings.</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="btn-secondary px-5 py-2.5 text-sm" onClick={logout}>
                <LogOut className="w-4 h-4 inline mr-1.5 -mt-0.5" />Logout
              </button>
              <button type="button" className="btn-primary px-5 py-2.5 text-sm" onClick={() => navigate('/seller/create-gig')}>
                <Plus className="w-4 h-4 inline mr-1.5 -mt-0.5" />Create a Gig
              </button>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-8">
            {(['Overview', 'Orders', 'Gigs', 'Portfolio', 'Earnings', 'Invoices'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">This Month</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">Rs. 38,500</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Earnings</div>
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Orders</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">2</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Need attention</div>
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Gigs</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">1</div>
                <div className="text-sm text-slate-500 font-medium mt-1">Published</div>
              </div>
            </div>
          )}

          {tab === 'Portfolio' && (
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 md:p-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="font-extrabold text-slate-900 text-lg">Portfolio</div>
                <label className={`btn-primary px-5 py-2.5 text-sm cursor-pointer ${uploadingPortfolio ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Plus className="w-4 h-4 inline mr-1.5 -mt-0.5" />{uploadingPortfolio ? 'Uploading...' : 'Add Photos'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploadingPortfolio}
                    className="hidden"
                    onChange={async (e) => {
                      if (!profile?.id) return;
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      setUploadingPortfolio(true);
                      try {
                        for (const file of files) {
                          const fileName = `${Date.now()}-${(globalThis as any)?.crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : Math.random().toString(16).slice(2)}-${file.name}`;
                          const path = `${profile.id}/${fileName}`;
                          const { error: uploadError } = await supabase.storage.from('media').upload(`portfolio/${path}`, file, { upsert: false });
                          if (uploadError) {
                            window.alert(uploadError.message);
                            continue;
                          }

                          const { data: pub } = supabase.storage.from('media').getPublicUrl(`portfolio/${path}`);
                          const imageUrl = (pub as any)?.publicUrl ? String((pub as any).publicUrl) : '';
                          if (!imageUrl) continue;

                          const { data: inserted, error: insertErr } = await supabase
                            .from('portfolio_items')
                            .insert({ owner_id: profile.id, image_url: imageUrl })
                            .select('id, image_url, created_at')
                            .single();
                          if (insertErr) {
                            window.alert(insertErr.message);
                            continue;
                          }
                          setPortfolioItems((prev) => [inserted, ...(prev || [])]);
                        }
                      } finally {
                        setUploadingPortfolio(false);
                        try {
                          (e.target as any).value = '';
                        } catch {
                          // ignore
                        }
                      }
                    }}
                  />
                </label>
              </div>

              {portfolioItems.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-8 text-center">
                  <div className="text-slate-400 font-medium">No portfolio items yet.</div>
                  <div className="text-slate-400 text-sm font-medium mt-1">Upload your best work to show clients.</div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioItems.map((p: any) => (
                    <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 group">
                      <img src={p.image_url} alt="portfolio" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Orders' && (
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 md:p-10">
              <div className="font-extrabold text-slate-900 text-lg mb-6">Orders</div>
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 rounded-xl border border-slate-200/60 bg-slate-50/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{o.gig}</div>
                      <div className="text-sm text-slate-500 font-medium mt-1">Client: {o.client} • Due: {o.due}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <span
                        className={`px-3 py-1 rounded-full border text-xs font-extrabold ${
                          String(o.status) === 'Cancelled'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : String(o.status) === 'Delivered'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : String(o.status) === 'In Progress'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        {o.status}
                      </span>
                      <Link
                        to={`/messages${o.clientId ? `?partnerId=${encodeURIComponent(String(o.clientId))}` : ''}`}
                        className="btn-secondary px-4 py-2 text-sm"
                      >
                        Message Client
                      </Link>
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 text-sm"
                        onClick={async () => {
                          if (!o?.id) return;
                          const { error } = await supabase.from('orders').update({ status: 'In Progress' }).eq('id', o.id);
                          if (error) {
                            try {
                              window.alert(error.message);
                            } catch {
                              // ignore
                            }
                            return;
                          }
                          setMyOrders((prev) =>
                            (prev || []).map((row: any) => (String(row?.id) === String(o.id) ? { ...row, status: 'In Progress' } : row))
                          );
                        }}
                        disabled={String(o.status) !== 'Placed'}
                      >
                        Start
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 text-sm"
                        onClick={async () => {
                          if (!o?.id) return;
                          const { error } = await supabase.from('orders').update({ status: 'Delivered' }).eq('id', o.id);
                          if (error) {
                            try {
                              window.alert(error.message);
                            } catch {
                              // ignore
                            }
                            return;
                          }
                          setMyOrders((prev) =>
                            (prev || []).map((row: any) => (String(row?.id) === String(o.id) ? { ...row, status: 'Delivered' } : row))
                          );
                        }}
                        disabled={String(o.status) !== 'In Progress'}
                      >
                        Mark Delivered
                      </button>
                      <button
                        type="button"
                        className="btn-primary px-4 py-2 text-sm"
                        onClick={() => {
                          if (o?.id) navigate(`/orders/${o.id}`);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Gigs' && (
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 md:p-10">
              <div className="font-extrabold text-slate-900 text-lg mb-6">Your Gigs</div>
              <div className="space-y-3">
                {gigs.map((g) => (
                  <div key={g.id} className="p-5 rounded-xl border border-slate-200/60 bg-slate-50/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{g.title}</div>
                      <div className="text-sm text-slate-500 font-medium mt-1">Starting at Rs. {g.price.toLocaleString()} • <span className="text-emerald-600">{g.status}</span></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn-secondary px-4 py-2 text-sm">Edit</button>
                      <button type="button" className="btn-primary px-4 py-2 text-sm">Preview</button>
                      <button
                        type="button"
                        className="btn-secondary px-4 py-2 text-sm hover:text-red-600 hover:border-red-200"
                        onClick={() => deleteGig(String(g.id))}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Earnings' && (
            <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 md:p-10">
              <div className="font-extrabold text-slate-900 text-lg mb-2">Earnings</div>
              <p className="text-slate-500 font-medium mb-6">Payouts, invoices, and earnings breakdown will appear here.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Available for withdrawal</div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">Rs. 12,200</div>
                </div>
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</div>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">Rs. 6,800</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'Invoices' && (
            <SellerInvoicesTab profile={profile} orders={orders} />
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const SignInPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [resendDisabledUntil, setResendDisabledUntil] = useState<number>(0);
  const [resendSecondsLeft, setResendSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!resendDisabledUntil) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((resendDisabledUntil - Date.now()) / 1000));
      setResendSecondsLeft(left);
      if (left <= 0) {
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [resendDisabledUntil]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Brand panel - desktop only */}
        <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
          <div className="relative z-10">
            <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">HireLanka</Link>
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">Sri Lanka's #1<br />Freelance Marketplace</h2>
            <p className="text-primary-200 font-medium text-lg max-w-md">Connect with trusted local talent for design, development, tuition, and more.</p>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-400 flex items-center justify-center text-white font-bold text-xs">AK</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-accent-400 flex items-center justify-center text-white font-bold text-xs">NP</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-300 flex items-center justify-center text-white font-bold text-xs">RS</div>
              </div>
              <span className="text-primary-200 text-sm font-semibold">2,400+ verified freelancers</span>
            </div>
          </div>
          <div className="relative z-10 text-primary-300 text-sm font-medium">&copy; {new Date().getFullYear()} HireLanka</div>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex flex-col pb-24 md:pb-0">
          <Navbar />
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-10 md:py-16">
            <div className="w-full max-w-md">
              <div className="md:hidden mb-8 text-center">
                <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">HireLanka</Link>
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-8 md:p-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
                <p className="text-slate-500 font-medium mt-2">Sign in to your account to continue.</p>

                <div className="space-y-5 mt-8">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <button
                    type="button"
                    className="btn-primary w-full py-3.5 text-base"
                    onClick={async () => {
                  setError('');
                  setInfo('');
                  const normalizedEmail = email.trim().toLowerCase();
                  if (!normalizedEmail || password.trim().length === 0) {
                    setError('Please enter your email and password.');
                    return;
                  }
                  const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: normalizedEmail,
                    password,
                  });
                  if (signInError) {
                    setError(signInError.message || 'Invalid email or password.');
                    return;
                  }
                  const from = (routerLocation.state as any)?.from?.pathname as string | undefined;
                  if (from) {
                    navigate(from, { replace: true });
                    return;
                  }
                  navigate('/dashboard');
                }}
              >
                Sign In
              </button>
              {error && <div className="text-sm font-semibold text-red-600 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3 text-center">{error}</div>}
              {info && <div className="text-sm font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-xl px-4 py-3 text-center">{info}</div>}
              {error.toLowerCase().includes('not confirmed') && (
                <button
                  type="button"
                  className="btn-secondary w-full py-3"
                  disabled={resendSecondsLeft > 0}
                  onClick={async () => {
                    setError('');
                    setInfo('');
                    const normalizedEmail = email.trim().toLowerCase();
                    if (!normalizedEmail.includes('@')) {
                      setError('Please enter your email address first.');
                      return;
                    }
                    const { error: resendError } = await supabase.auth.resend({
                      type: 'signup',
                      email: normalizedEmail,
                    });
                    if (resendError) {
                      const msg = resendError.message || 'Unable to resend confirmation email.';
                      if (msg.toLowerCase().includes('rate limit')) {
                        const until = Date.now() + 60_000;
                        setResendDisabledUntil(until);
                        setResendSecondsLeft(60);
                        setError('Email rate limit exceeded. Please wait a minute and try again. Also check your spam folder for earlier emails.');
                        return;
                      }
                      setError(msg);
                      return;
                    }
                    const until = Date.now() + 60_000;
                    setResendDisabledUntil(until);
                    setResendSecondsLeft(60);
                    setInfo('Confirmation email resent. Please check your inbox/spam.');
                  }}
                >
                  {resendSecondsLeft > 0 ? `Resend available in ${resendSecondsLeft}s` : 'Resend Confirmation Email'}
                </button>
              )}
              <div className="text-sm text-slate-500 font-medium text-center pt-2">
                Don't have an account?{' '}
                <Link to="/auth/join" className="font-extrabold text-primary-600 hover:text-primary-700">Join Now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      <BottomNav />
    </div>
  </PageTransition>
);
};

export const JoinNowPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [role, setRole] = useState<'client' | 'freelancer'>('client');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        {/* Brand panel - desktop only */}
        <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden flex-col justify-between p-12">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}} />
          <div className="relative z-10">
            <Link to="/" className="text-2xl font-extrabold text-white tracking-tight">HireLanka</Link>
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">Turn your skills<br />into income</h2>
            <p className="text-primary-200 font-medium text-lg max-w-md">Join thousands of Sri Lankan freelancers already earning on HireLanka. Or find the perfect talent for your project.</p>
            <div className="grid grid-cols-3 gap-4 mt-8 max-w-sm">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-white">2.4k+</div>
                <div className="text-[11px] font-semibold text-primary-200 mt-1">Freelancers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-white">5.8k+</div>
                <div className="text-[11px] font-semibold text-primary-200 mt-1">Projects</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-white">98%</div>
                <div className="text-[11px] font-semibold text-primary-200 mt-1">Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="relative z-10 text-primary-300 text-sm font-medium">&copy; {new Date().getFullYear()} HireLanka</div>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex flex-col pb-24 md:pb-0">
          <Navbar />
          <div className="flex-1 flex items-center justify-center px-4 md:px-8 py-10 md:py-16">
            <div className="w-full max-w-lg">
              <div className="md:hidden mb-8 text-center">
                <Link to="/" className="text-2xl font-extrabold text-primary-600 tracking-tight">HireLanka</Link>
              </div>
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-8 md:p-10">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
                <p className="text-slate-500 font-medium mt-2">Join HireLanka to hire talent or sell your services.</p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'client' ? 'bg-primary-50 border-primary-400 shadow-card' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setRole('client')}
                  >
                    <div className={`text-lg font-extrabold ${role === 'client' ? 'text-primary-700' : 'text-slate-700'}`}>
                      <Briefcase className="w-5 h-5 inline mr-1.5 -mt-0.5" />Client
                    </div>
                    <div className="text-xs font-medium mt-1.5 text-slate-500">Hire freelancers & place orders</div>
                  </button>
                  <button
                    type="button"
                    className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'freelancer' ? 'bg-primary-50 border-primary-400 shadow-card' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    onClick={() => setRole('freelancer')}
                  >
                    <div className={`text-lg font-extrabold ${role === 'freelancer' ? 'text-primary-700' : 'text-slate-700'}`}>
                      <Zap className="w-5 h-5 inline mr-1.5 -mt-0.5" />Freelancer
                    </div>
                    <div className="text-xs font-medium mt-1.5 text-slate-500">Create gigs & earn money</div>
                  </button>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full name</label>
                    <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password (6+ characters)" />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    className="btn-primary w-full py-3.5 text-base"
                    onClick={async () => {
                      setError('');
                      const normalizedEmail = email.trim().toLowerCase();
                      if (fullName.trim().length < 2) {
                        setError('Please enter your full name.');
                        return;
                      }
                      if (!normalizedEmail.includes('@')) {
                        setError('Please enter a valid email address.');
                        return;
                      }
                      if (password.length < 6) {
                        setError('Password must be at least 6 characters.');
                        return;
                      }

                      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: normalizedEmail,
                        password,
                        options: {
                          data: {
                            role,
                            fullName: fullName.trim(),
                          },
                        },
                      });
                      if (signUpError) {
                        setError(signUpError.message || 'Unable to create account.');
                        return;
                      }

                      if (!signUpData?.session) {
                        setError('Account created. Please check your email to confirm your account before signing in.');
                        return;
                      }

                      const from = (routerLocation.state as any)?.from?.pathname as string | undefined;
                      if (from) {
                        navigate(from, { replace: true });
                        return;
                      }
                      navigate('/dashboard');
                    }}
                  >
                    Create Account
                  </button>
                  <Link to="/auth/signin" className="btn-secondary w-full py-3.5 text-center text-base">I already have an account</Link>
                </div>
                {error && <div className="mt-4 text-sm font-semibold text-red-600 bg-red-50 border border-red-200/70 rounded-xl px-4 py-3 text-center">{error}</div>}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { profile } = useContext(AuthContext);
  const state = (routerLocation.state || {}) as {
    packageName?: string;
    price?: number;
    gigId?: string;
    gigTitle?: string;
    sellerId?: string;
    sellerName?: string;
    sellerHandle?: string;
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [error, setError] = useState('');

  const packageName = state.packageName || 'Basic';
  const price = state.price ?? 2500;
  const gigTitle = state.gigTitle || 'Logo Design Service';
  const gigId = state.gigId || 'seed_gig_1';
  const sellerId = state.sellerId || 'seed_seller_1';
  const sellerName = state.sellerName || 'Aruni Perera';
  const sellerHandle = state.sellerHandle || 'aruni';
  const serviceFee = Math.max(250, Math.round(price * 0.05));
  const total = price + serviceFee;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Checkout</h1>
              <p className="text-slate-600 font-medium">Confirm details and place your order.</p>
            </div>
            <button type="button" className="btn-secondary px-6 py-3" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card p-6 md:p-10 space-y-8">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Details</div>
                <div className="font-extrabold text-slate-900">{gigTitle}</div>
                <div className="text-slate-500 font-medium text-sm">Selected package: {packageName}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full name</label>
                  <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Email</label>
                  <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-700">Notes to seller (optional)</label>
                  <textarea className="input-field min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any details, references, or preferences" />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <div className="text-sm font-extrabold text-slate-900 mb-4">Payment method</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-5 rounded-2xl border text-left font-extrabold transition-colors ${paymentMethod === 'card' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-700'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    Card
                    <div className="text-sm font-medium mt-2 text-slate-500">Visa / MasterCard (demo)</div>
                  </button>
                  <button
                    type="button"
                    className={`p-5 rounded-2xl border text-left font-extrabold transition-colors ${paymentMethod === 'bank' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-700'}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    Bank Transfer
                    <div className="text-sm font-medium mt-2 text-slate-500">Local transfer (demo)</div>
                  </button>
                </div>
              </div>
            </div>

            <aside className="card p-6 md:p-8 h-fit sticky top-28">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between font-semibold text-slate-600">
                  <span>Package</span>
                  <span className="text-slate-900">Rs. {price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-slate-600">
                  <span>Service fee</span>
                  <span className="text-slate-900">Rs. {serviceFee.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex items-center justify-between font-extrabold text-slate-900">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary w-full py-3 mt-6"
                onClick={async () => {
                  setError('');
                  if (!profile?.id) {
                    setError('Please sign in to place an order.');
                    return;
                  }
                  if (!gigId || !sellerId || gigId.startsWith('seed') || sellerId.startsWith('seed')) {
                    setError('This is a demo gig. Please create and use a real gig from Supabase.');
                    return;
                  }

                  const { data, error: insertError } = await supabase
                    .from('orders')
                    .insert({
                      buyer_id: profile.id,
                      seller_id: sellerId,
                      gig_id: gigId,
                      package_name: packageName,
                      price: Math.round(price),
                      service_fee: Math.round(serviceFee),
                      total: Math.round(total),
                      notes,
                      payment_method: paymentMethod,
                      status: 'Placed',
                    })
                    .select('id')
                    .single();

                  if (insertError) {
                    setError(insertError.message || 'Unable to place order.');
                    return;
                  }

                  navigate(`/orders/${data.id}`);
                }}
              >
                Place Order
              </button>
              {error && <div className="text-sm font-bold text-red-600 text-right mt-3">{error}</div>}
            </aside>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const OrderStatusPage = () => {
  const params = useParams();
  const orderId = params.orderId || '—';
  const [order, setOrder] = useState<any | null>(null);
  const { profile } = useContext(AuthContext);

  useEffect(() => {
    let mounted = true;
    const channelRef: { current: any } = { current: null };

    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, package_name, total, status, created_at, notes, payment_method, gig:gigs(id, title), seller:profiles!orders_seller_id_fkey(id, full_name, handle), buyer:profiles!orders_buyer_id_fkey(id, full_name, handle)')
        .eq('id', orderId)
        .maybeSingle();

      if (!mounted) return;
      setOrder(data || null);
    };

    (async () => {
      if (!orderId || orderId === '—') {
        setOrder(null);
        return;
      }

      await fetchOrder();

      const chName = `order-${orderId}`;
      const existing = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(chName));
      if (existing) supabase.removeChannel(existing);

      const ch = supabase
        .channel(chName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, async () => {
          await fetchOrder();
        })
        .subscribe();

      channelRef.current = ch;
    })();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId]);

  const isSellerViewing = Boolean(profile?.id && order?.seller?.id && String(profile.id) === String(order.seller.id));
  const isBuyerViewing = Boolean(profile?.id && order?.buyer?.id && String(profile.id) === String(order.buyer.id));
  const otherParty = isSellerViewing ? order?.buyer : order?.seller;
  const canCancel = isBuyerViewing && String(order?.status) === 'Placed';

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="card p-8 md:p-12">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order</div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-2">Order Confirmed</h1>
            <p className="text-slate-600 font-medium mt-3">Order ID: <span className="font-black text-slate-900">{orderId}</span></p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Placed', desc: 'Your order has been placed successfully.' },
                { title: 'In Progress', desc: 'Seller is working on your delivery.' },
                { title: 'Delivered', desc: 'Review and request revisions if needed.' },
              ].map((s) => (
                <div key={s.title} className="bg-white border border-slate-100 rounded-2xl p-6">
                  <div className="font-black text-slate-900">{s.title}</div>
                  <div className="text-sm text-slate-500 font-medium mt-2">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Service</div>
                  <div className="text-slate-500 font-medium text-sm">{order?.gig?.title || '—'}</div>
                  <div className="mt-3 font-extrabold text-slate-900">{isSellerViewing ? 'Client' : 'Seller'}</div>
                  <div className="text-slate-500 font-medium text-sm">{otherParty?.full_name || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-900">Package</div>
                  <div className="text-slate-500 font-medium text-sm">{order?.package_name || 'Basic'}</div>
                  <div className="font-extrabold text-slate-900 mt-3">Total</div>
                  <div className="text-slate-500 font-medium text-sm">Rs. {Number(order?.total || 2750).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                to={`/messages${otherParty?.id ? `?partnerId=${encodeURIComponent(String(otherParty.id))}` : ''}`}
                className="btn-secondary px-6 py-3 text-center"
              >
                Message {isSellerViewing ? 'Client' : 'Seller'}
              </Link>
              {canCancel && (
                <button
                  type="button"
                  className="btn-secondary px-6 py-3 text-center border-red-200 text-red-600 hover:bg-red-50"
                  onClick={async () => {
                    if (!order?.id) return;
                    const ok = window.confirm('Cancel this order?');
                    if (!ok) return;
                    const { error } = await supabase.from('orders').update({ status: 'Cancelled' }).eq('id', order.id);
                    if (error) {
                      try {
                        window.alert(error.message);
                      } catch {
                        // ignore
                      }
                      return;
                    }
                    setOrder((prev: any) => (prev ? { ...prev, status: 'Cancelled' } : prev));
                  }}
                >
                  Cancel Order
                </button>
              )}
              <Link to="/dashboard" className="btn-primary px-6 py-3 text-center">Go to Dashboard</Link>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Explore', path: '/marketplace' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/dashboard' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 px-6 py-2.5 z-50 flex items-center justify-between">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="relative">
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600" />}
            </div>
            <span className={`text-[10px] font-semibold ${isActive ? 'font-extrabold' : ''}`}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export const TalentPage = () => {
  const [loading, setLoading] = useState(true);
  const [talent, setTalent] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');

  const categories = ['All', 'Design', 'Video', 'Dev', 'Tuition', 'Photo', 'Writing', 'Marketing'];

  useEffect(() => {
    let mounted = true;
    const channelsRef: { current: any[] } = { current: [] };

    const fetchTalent = async () => {
      setLoading(true);

      const [{ data: items, error }, { data: gigs }] = await Promise.all([
        supabase
          .from('portfolio_items')
          .select('id, owner_id, image_url, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
        supabase
          .from('gigs')
          .select('id, owner_id, category, cover_image_url, created_at')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      if (!mounted) return;
      if (error) {
        setTalent([]);
        setLoading(false);
        return;
      }

      const byOwner = new Map<string, any[]>();
      for (const it of items || []) {
        const ownerId = (it as any)?.owner_id;
        if (!ownerId) continue;
        const list = byOwner.get(ownerId) || [];
        list.push({ kind: 'portfolio', ...it });
        byOwner.set(ownerId, list);
      }
      for (const g of gigs || []) {
        const ownerId = (g as any)?.owner_id;
        const url = (g as any)?.cover_image_url;
        if (!ownerId || !url) continue;
        const list = byOwner.get(ownerId) || [];
        list.push({ kind: 'gig', image_url: url, category: (g as any)?.category, created_at: (g as any)?.created_at, id: (g as any)?.id });
        byOwner.set(ownerId, list);
      }

      const ownerIds = Array.from(byOwner.keys()).slice(0, 40);
      const { data: profiles } = ownerIds.length
        ? await supabase.from('profiles').select('id, full_name, handle, avatar_url').in('id', ownerIds)
        : ({ data: [] } as any);

      if (!mounted) return;

      const profById = new Map<string, any>();
      for (const p of profiles || []) profById.set((p as any).id, p);

      const result = ownerIds
        .map((id) => {
          const p = profById.get(id);
          const raw = (byOwner.get(id) || [])
            .sort((a: any, b: any) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
            .slice(0, 4);
          const categories = Array.from(new Set(raw.map((r: any) => r.category).filter(Boolean)));
          return {
            id,
            full_name: p?.full_name || 'Freelancer',
            handle: p?.handle || 'freelancer',
            avatar_url: p?.avatar_url || '',
            thumbs: raw,
            categories,
            latestAt: raw[0]?.created_at || '',
          };
        })
        .filter((x) => Boolean(x.handle));

      setTalent(result);
      setLoading(false);
    };

    (async () => {
      await fetchTalent();

      const portfolioChName = `talent-portfolio`;
      const existingPortfolio = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(portfolioChName));
      if (existingPortfolio) supabase.removeChannel(existingPortfolio);
      const portfolioCh = supabase
        .channel(portfolioChName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_items' }, async () => {
          await fetchTalent();
        })
        .subscribe();
      channelsRef.current.push(portfolioCh);

      const gigsChName = `talent-gigs`;
      const existingGigs = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(gigsChName));
      if (existingGigs) supabase.removeChannel(existingGigs);
      const gigsCh = supabase
        .channel(gigsChName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, async () => {
          await fetchTalent();
        })
        .subscribe();
      channelsRef.current.push(gigsCh);
    })();

    return () => {
      mounted = false;
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, []);

  const filteredTalent = talent
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || t.full_name.toLowerCase().includes(q) || t.handle.toLowerCase().includes(q) || t.categories.some((c: string) => c.toLowerCase().includes(q));
      const matchesCategory = selectedCategory === 'All' || t.categories.some((c: string) => c.toLowerCase().includes(selectedCategory.toLowerCase()));
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.full_name.localeCompare(b.full_name);
      return String(b.latestAt).localeCompare(String(a.latestAt));
    });

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Find Talent</h1>
              <p className="text-slate-500 font-medium mt-1">Browse freelancers and their latest work.</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field py-2 px-3 text-sm w-auto"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, handle, or skill..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-white shadow-card focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-base font-medium"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="md:hidden">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field py-2 px-3 text-sm w-auto"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : filteredTalent.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-slate-400 font-semibold text-lg mb-2">No freelancers found</div>
              <div className="text-slate-400 text-sm">Try adjusting your search or filters.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTalent.map((t: any) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-6 md:p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-primary-100 border border-slate-200/60 shrink-0">
                        {t.avatar_url ? (
                          <img src={t.avatar_url} alt={t.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary-700 font-extrabold text-lg">{t.full_name?.charAt(0)?.toUpperCase() || 'F'}</div>
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">{t.full_name}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">@{t.handle}</div>
                      </div>
                    </div>
                  </div>

                  {t.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.categories.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-200/60 px-2 py-0.5 rounded-md">{c}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[0, 1, 2, 3].map((i) => {
                      const item = t.thumbs?.[i];
                      return (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                          {item?.image_url ? (
                            <img src={item.image_url} alt="work" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link to={`/freelancer/${t.handle}`} className="btn-secondary flex-1 py-2.5 text-center">
                      View Profile
                    </Link>
                    <Link
                      to={`/messages?partnerId=${encodeURIComponent(String(t.id))}`}
                      className="btn-primary flex-1 py-2.5 text-center"
                    >
                      Message
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const GigCard = ({ title, freelancer, price, rating, reviews, image }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white rounded-2xl overflow-hidden group cursor-pointer border border-slate-100/80 shadow-card hover:shadow-card-hover transition-shadow duration-300"
  >
    <div className="relative h-44 bg-slate-100 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs font-bold text-slate-700">{rating}</span>
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {freelancer?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <span className="text-xs font-semibold text-slate-500">{freelancer}</span>
        <ShieldCheck className="w-3.5 h-3.5 text-primary-500 shrink-0" />
      </div>
      <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {title}
      </h3>
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Starting at</span>
        <span className="text-base font-extrabold text-slate-900">Rs. {price.toLocaleString()}</span>
      </div>
    </div>
  </motion.div>
);

export const CategoryBadge = ({ icon: Icon, label, active = false }: any) => (
  <button className={`
    flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 group
    ${active 
      ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-glow' 
      : 'bg-white border-slate-100 text-slate-500 hover:border-primary-200 hover:bg-primary-50/50 shadow-card'}
  `}>
    <div className={`p-3.5 rounded-2xl transition-colors ${active ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

// --- Pages ---

export const LandingPage = () => {
  const categories = [
    { icon: Layout, label: 'Design' },
    { icon: Video, label: 'Video' },
    { icon: Code, label: 'Dev' },
    { icon: BookOpen, label: 'Tuition' },
    { icon: Camera, label: 'Photo' },
  ];

  const featuredGigs = [
    { title: "I will design a modern logo for your local business", freelancer: "Aruni Perera", price: 2500, rating: 4.9, reviews: 120, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800" },
    { title: "I will edit high quality cinematic wedding videos", freelancer: "Kasun Jay", price: 15000, rating: 5.0, reviews: 45, image: "https://images.unsplash.com/photo-1536240478700-b86734927a3c?auto=format&fit=crop&q=80&w=800" },
    { title: "I will build a responsive React website for your shop", freelancer: "Lahiru Silva", price: 35000, rating: 4.8, reviews: 89, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800" },
    { title: "A/L ICT and Math individual home tuition", freelancer: "Nimali R.", price: 3000, rating: 4.9, reviews: 210, image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800" },
  ];

  const testimonials = [
    { name: "Tharindu K.", role: "Small Business Owner", text: "Found an amazing logo designer in under 24 hours. The quality was outstanding and the price was very fair.", avatar: "Tharindu" },
    { name: "Sachini M.", role: "Freelance Video Editor", text: "HireLanka transformed my side hobby into a real income stream. I now have consistent clients from across Sri Lanka.", avatar: "Sachini" },
    { name: "Ruwan D.", role: "Startup Founder", text: "We built our entire website through freelancers here. The communication tools made collaboration seamless.", avatar: "Ruwan" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 md:pb-28 px-4 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold mb-6 border border-primary-200/60"
              >
                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 fill-primary-500" />
                Sri Lanka's #1 Freelance Marketplace
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6 md:mb-8 tracking-tight"
              >
                Hire local <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-accent-500">talent</span> or grow your freelance career.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-slate-500 mb-8 md:mb-10 leading-relaxed max-w-xl"
              >
                Connect with trusted Sri Lankan freelancers for design, development, tuition, and more. Secure payments, real results.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative max-w-xl group"
              >
                <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  placeholder="Try 'Logo Design', 'Maths Tuition'..."
                  className="w-full pl-12 md:pl-14 pr-28 md:pr-36 py-4 md:py-5 rounded-2xl border-2 border-slate-200 bg-white shadow-card focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all text-base md:text-lg font-medium"
                />
                <Link to="/marketplace" className="absolute right-2 md:right-3 top-2 bottom-2 md:top-3 md:bottom-3 btn-primary px-5 md:px-8 text-sm md:text-base rounded-xl flex items-center justify-center">
                  Search
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 md:mt-8 flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm font-semibold text-slate-400"
              >
                <span>Popular:</span>
                {['Logo', 'WordPress', 'Video', 'Maths'].map(tag => (
                  <Link key={tag} to="/marketplace" className="hover:text-primary-600 hover:border-primary-300 transition-colors border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-primary-50 whitespace-nowrap">
                    {tag}
                  </Link>
                ))}
              </motion.div>
            </div>

            {/* Hero Visual - Stats + Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden h-40 shadow-card border border-slate-200/60">
                    <img src="https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=400&h=300" alt="Design" className="w-full h-full object-cover" />
                  </div>
                  <div className="bg-primary-600 rounded-2xl p-5 text-white">
                    <div className="text-3xl font-extrabold">2.4k+</div>
                    <div className="text-primary-200 text-sm font-semibold mt-1">Verified Freelancers</div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="bg-accent-500 rounded-2xl p-5 text-white">
                    <div className="text-3xl font-extrabold">5.8k+</div>
                    <div className="text-accent-100 text-sm font-semibold mt-1">Projects Completed</div>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-40 shadow-card border border-slate-200/60">
                    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400&h=300" alt="Dev" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-card border border-slate-200/60 px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">98% Satisfaction</div>
                  <div className="text-[10px] text-slate-400 font-medium">Based on 1,200+ reviews</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hero Background Elements */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-primary-50/40 to-transparent -z-0" />
        <div className="absolute -top-24 -right-24 w-72 h-72 md:w-[28rem] md:h-[28rem] bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-accent-200/20 rounded-full blur-3xl" />
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 overflow-x-auto no-scrollbar">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Browse by Category</h2>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Find the right service for your needs</p>
        </div>
        <div className="flex md:grid md:grid-cols-5 gap-4 md:gap-6 min-w-max md:min-w-0 pb-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="w-32 md:w-auto"
            >
              <CategoryBadge {...cat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Gigs */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16 md:mb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Most Popular Gigs</h2>
            <p className="text-slate-500 text-sm md:text-base font-medium">Hand-picked services from our top-rated local experts</p>
          </div>
          <Link to="/marketplace" className="text-primary-600 font-semibold flex items-center gap-2 group text-sm md:text-base hover:text-primary-700">
            View all services
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {featuredGigs.map((gig, i) => (
            <motion.div
              key={gig.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + (0.08 * i) }}
            >
              <GigCard {...gig} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-slate-900 py-16 md:py-24 px-4 md:px-8 text-white rounded-3xl md:rounded-[2.5rem] mx-4 md:mx-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary-300 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold mb-4 border border-white/10">
              Simple Process
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight">How it works</h2>
            <p className="text-slate-400 text-sm md:text-base font-medium">Three simple steps to get your work done</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              { title: "Find a Service", desc: "Browse through thousands of local gigs or post your custom request.", icon: Search, num: "01" },
              { title: "Connect & Chat", desc: "Talk directly to the freelancer to discuss details and requirements.", icon: MessageSquare, num: "02" },
              { title: "Get it Done", desc: "Receive high-quality work and release payment only when satisfied.", icon: CheckCircle2, num: "03" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                <div className="text-5xl md:text-6xl font-black text-white/5 absolute -top-2">{step.num}</div>
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-5 md:mb-6 shadow-lg shadow-primary-600/30 relative z-10">
                  <step.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 relative z-10">{step.title}</h3>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold mb-4 border border-primary-200/60">
            <Star className="w-3.5 h-3.5 fill-primary-500" />
            Testimonials
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">What our users say</h2>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Real stories from freelancers and clients across Sri Lanka</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-6 md:p-8"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {t.avatar.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-400 font-medium">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-primary-600 py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center text-white">
          {[
            { value: "2,400+", label: "Freelancers" },
            { value: "5,800+", label: "Projects Done" },
            { value: "98%", label: "Satisfaction" },
            { value: "24h", label: "Avg. Response" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl md:text-4xl font-extrabold">{stat.value}</div>
              <div className="text-primary-200 text-sm font-semibold mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl md:rounded-[2.5rem] p-8 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="relative z-10 text-white max-w-xl text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight">Ready to grow your freelance career?</h2>
            <p className="text-primary-200 text-base md:text-lg mb-8 md:mb-10 font-medium">Join thousands of Sri Lankan freelancers and start earning today by doing what you love.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/become-seller" className="bg-white text-primary-700 px-8 py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-primary-50 transition-colors text-center shadow-lg shadow-black/10">
                Become a Seller
              </Link>
              <Link to="/requests/new" className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-8 py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-white/20 transition-colors text-center">
                Post a Request
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative z-10">
             <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/10">
               <Users className="w-32 h-32 md:w-40 md:h-40 text-white/10" />
             </div>
          </div>

          {/* BG Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary-900/40 rounded-full -mr-32 -mt-32 md:-mr-48 md:-mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-accent-500/10 rounded-full -ml-24 -mb-24 md:-ml-32 md:-mb-32 blur-3xl" />
        </div>
      </section>

      <BottomNav />
    </div>
    </PageTransition>
  );
};

export const CreateGigPage = () => {
  const navigate = useNavigate();
  const { profile } = useContext(AuthContext);
  const [gig, setGig] = useState({
    title: '',
    category: 'Graphic Design',
    description: '',
    requirements: '',
    packages: {
      Basic: { price: '2500', deliveryDays: '2', revisions: '1', desc: '' },
      Standard: { price: '5500', deliveryDays: '3', revisions: '3', desc: '' },
      Premium: { price: '8500', deliveryDays: '5', revisions: 'Unlimited', desc: '' },
    } as Record<string, { price: string; deliveryDays: string; revisions: string; desc: string }>,
  });
  const [error, setError] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [publishing, setPublishing] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            <div className="flex-1">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900">Create a Gig</h1>
                  <p className="text-slate-600 text-base md:text-lg">Publish your service so clients can discover and order.</p>
                </div>
                <button type="button" className="btn-secondary px-5 py-3" onClick={() => navigate('/become-seller')}>
                  Back
                </button>
              </div>

              <div className="card p-6 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Gig title</label>
                    <input
                      value={gig.title}
                      onChange={(e) => setGig((p) => ({ ...p, title: e.target.value }))}
                      className="input-field"
                      placeholder="e.g., I will design a modern logo for your Sri Lankan business"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Category</label>
                    <select
                      value={gig.category}
                      onChange={(e) => setGig((p) => ({ ...p, category: e.target.value }))}
                      className="input-field"
                    >
                      {['Graphic Design', 'Video & Animation', 'Writing', 'Tech & IT', 'Tuition', 'Photography'].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Search tags</label>
                    <input className="input-field" placeholder="e.g., logo, brand, minimal" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <textarea
                      value={gig.description}
                      onChange={(e) => setGig((p) => ({ ...p, description: e.target.value }))}
                      className="input-field min-h-[160px]"
                      placeholder="Describe what you will deliver, what you need from the client, and what makes your service special."
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700">Gig cover image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="input-field"
                      onChange={(e) => setCoverFile((e.target.files && e.target.files[0]) || null)}
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-4">Packages</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {(['Basic', 'Standard', 'Premium'] as const).map((pkg) => (
                      <div key={pkg} className="bg-white border border-slate-100 rounded-2xl p-6 space-y-4">
                        <div className="font-black text-slate-900">{pkg}</div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Price (LKR)</label>
                          <input
                            type="number"
                            value={gig.packages[pkg].price}
                            onChange={(e) =>
                              setGig((p) => ({
                                ...p,
                                packages: { ...p.packages, [pkg]: { ...p.packages[pkg], price: e.target.value } },
                              }))
                            }
                            className="input-field"
                            placeholder="2500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Delivery</label>
                            <input
                              type="number"
                              value={gig.packages[pkg].deliveryDays}
                              onChange={(e) =>
                                setGig((p) => ({
                                  ...p,
                                  packages: { ...p.packages, [pkg]: { ...p.packages[pkg], deliveryDays: e.target.value } },
                                }))
                              }
                              className="input-field"
                              placeholder="2"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Revisions</label>
                            <input
                              value={gig.packages[pkg].revisions}
                              onChange={(e) =>
                                setGig((p) => ({
                                  ...p,
                                  packages: { ...p.packages, [pkg]: { ...p.packages[pkg], revisions: e.target.value } },
                                }))
                              }
                              className="input-field"
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">Package details</label>
                          <textarea
                            value={gig.packages[pkg].desc}
                            onChange={(e) =>
                              setGig((p) => ({
                                ...p,
                                packages: { ...p.packages, [pkg]: { ...p.packages[pkg], desc: e.target.value } },
                              }))
                            }
                            className="input-field min-h-[110px]"
                            placeholder="What is included in this package?"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-4">Requirements from client</h2>
                  <textarea
                    value={gig.requirements}
                    onChange={(e) => setGig((p) => ({ ...p, requirements: e.target.value }))}
                    className="input-field min-h-[120px]"
                    placeholder="e.g., Business name, preferred colors, sample logos you like"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-slate-500 font-medium">Publish your gig to appear in Marketplace.</div>
                  <button
                    type="button"
                    className="btn-primary px-7 py-3"
                    disabled={publishing}
                    onClick={() => {
                      setError('');
                      if (!profile?.id || profile.role !== 'freelancer') {
                        setError('Please sign in as a freelancer to publish a gig.');
                        return;
                      }
                      if (gig.title.trim().length < 8) {
                        setError('Please enter a clearer gig title.');
                        return;
                      }
                      if (gig.description.trim().length < 30) {
                        setError('Please add a longer description (at least 30 characters).');
                        return;
                      }
                      const basicPrice = Number(gig.packages?.Basic?.price || 0);
                      if (!Number.isFinite(basicPrice) || basicPrice <= 0) {
                        setError('Please set a valid Basic package price.');
                        return;
                      }

                      (async () => {
                        setPublishing(true);
                        const { data: insertedGig, error: insertError } = await supabase
                          .from('gigs')
                          .insert({
                          owner_id: profile.id,
                          title: gig.title.trim(),
                          category: gig.category,
                          description: gig.description.trim(),
                          requirements: gig.requirements.trim(),
                          packages: gig.packages,
                          })
                          .select('id')
                          .single();

                        if (insertError) {
                          setError(insertError.message || 'Unable to publish gig.');
                          setPublishing(false);
                          return;
                        }

                        const gigId = insertedGig?.id;
                        if (gigId && coverFile) {
                          const fileName = `${Date.now()}-${(globalThis as any)?.crypto?.randomUUID ? (globalThis as any).crypto.randomUUID() : Math.random().toString(16).slice(2)}-${coverFile.name}`;
                          const path = `${profile.id}/${gigId}/${fileName}`;
                          const { error: uploadError } = await supabase.storage.from('media').upload(`gigs/${path}`, coverFile, { upsert: false });
                          if (uploadError) {
                            try {
                              window.alert(uploadError.message);
                            } catch {
                              // ignore
                            }
                          } else {
                            const { data: pub } = supabase.storage.from('media').getPublicUrl(`gigs/${path}`);
                            const coverUrl = (pub as any)?.publicUrl ? String((pub as any).publicUrl) : '';
                            if (coverUrl) {
                              const { error: updateErr } = await supabase.from('gigs').update({ cover_image_url: coverUrl }).eq('id', gigId);
                              if (updateErr) {
                                try {
                                  window.alert(updateErr.message);
                                } catch {
                                  // ignore
                                }
                              }
                            }
                          }
                        }

                        navigate('/dashboard');
                        setPublishing(false);
                      })();
                    }}
                  >
                    {publishing ? 'Publishing...' : 'Publish Gig'}
                  </button>
                </div>
                {error && <div className="text-sm font-bold text-red-600 text-right">{error}</div>}
              </div>
            </div>

            <aside className="lg:w-[380px] shrink-0">
              <div className="card p-6 md:p-8 sticky top-28">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</div>
                <div className="mt-2">
                  <div className="font-black text-slate-900 text-lg leading-snug">
                    {gig.title.trim() || 'Your gig title will appear here'}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold mt-2">{gig.category}</div>
                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-sm font-black text-slate-900">Starting at</div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      Rs. {Number(gig.packages.Basic.price || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 font-medium mt-1">Delivery: {gig.packages.Basic.deliveryDays} days</div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export const BecomeSellerPage = () => {
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const steps = ['Profile', 'Skills', 'Portfolio', 'Review'];
  const [stepIndex, setStepIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    title: '',
    location: '',
    languages: '' as string,
    bio: '',
    skills: [] as string[],
    portfolioUrl: '',
    responseTime: '1 hour',
  });

  const isProfileValid =
    form.fullName.trim().length > 0 &&
    form.title.trim().length > 0 &&
    form.location.trim().length > 0 &&
    form.bio.trim().length >= 40;

  const isSkillsValid = form.skills.length >= 1;

  const isPortfolioValid = true;

  const canContinue =
    (stepIndex === 0 && isProfileValid) ||
    (stepIndex === 1 && isSkillsValid) ||
    (stepIndex === 2 && isPortfolioValid) ||
    stepIndex === 3;

  const toggleSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  const onNext = () => {
    setTouched(true);
    if (!canContinue) return;
    setTouched(false);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const onBack = () => {
    setTouched(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const becomeFreelancer = async () => {
    setError('');
    if (!session) {
      navigate('/auth/signin');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          role: 'freelancer',
          fullName: form.fullName.trim(),
          sellerTitle: form.title.trim(),
          sellerLocation: form.location.trim(),
          sellerLanguages: form.languages.trim(),
          sellerBio: form.bio.trim(),
          sellerSkills: form.skills,
          sellerPortfolioUrl: form.portfolioUrl.trim(),
          sellerResponseTime: form.responseTime,
        },
      });
      if (updateError) {
        setError(updateError.message || 'Unable to switch to seller mode.');
        return;
      }
      window.location.replace('/seller/create-gig');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16">
          <div className="card p-8 md:p-12">
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-4">Become a Seller</h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">
              Complete your seller profile. Next we’ll build the Create Gig form using this information.
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              {steps.map((s, idx) => {
                const isActive = idx === stepIndex;
                const isDone = idx < stepIndex;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStepIndex(idx)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white border-primary-600'
                        : isDone
                          ? 'bg-primary-50 text-primary-700 border-primary-100'
                          : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {idx + 1}. {s}
                  </button>
                );
              })}
            </div>

            {stepIndex === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Full name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Kavindi Perera"
                  />
                  {touched && form.fullName.trim().length === 0 && (
                    <div className="text-sm font-bold text-red-600">Please enter your name.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Seller title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Logo Designer & Brand Specialist"
                  />
                  {touched && form.title.trim().length === 0 && (
                    <div className="text-sm font-bold text-red-600">Please add a title.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Colombo"
                  />
                  {touched && form.location.trim().length === 0 && (
                    <div className="text-sm font-bold text-red-600">Please enter your location.</div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Languages</label>
                  <input
                    value={form.languages}
                    onChange={(e) => setForm((p) => ({ ...p, languages: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., Sinhala, English"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    className="input-field min-h-[140px]"
                    placeholder="Write a short bio (at least 40 characters) about your experience and what you offer."
                  />
                  <div className="flex items-center justify-between">
                    {touched && form.bio.trim().length < 40 ? (
                      <div className="text-sm font-bold text-red-600">Bio must be at least 40 characters.</div>
                    ) : (
                      <div className="text-sm text-slate-500 font-medium">Tip: Mention your niche, tools, and turnaround time.</div>
                    )}
                    <div className="text-xs font-bold text-slate-400">{form.bio.trim().length}/40</div>
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 1 && (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900">Choose your skills</h2>
                  <p className="text-slate-500 font-medium">Select at least one skill.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Logo Design',
                    'Social Media Design',
                    'Video Editing',
                    'Web Development',
                    'Mobile App Development',
                    'Photography',
                    'Tuition',
                    'Content Writing',
                    'WordPress',
                  ].map((skill) => {
                    const selected = form.skills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-3 rounded-2xl border text-left font-bold transition-colors ${
                          selected
                            ? 'bg-primary-50 border-primary-200 text-primary-700'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {skill}
                      </button>
                    );
                  })}
                </div>

                {touched && form.skills.length === 0 && (
                  <div className="mt-4 text-sm font-bold text-red-600">Please select at least one skill.</div>
                )}

                <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <label className="text-sm font-bold text-slate-700">Typical response time</label>
                  <select
                    value={form.responseTime}
                    onChange={(e) => setForm((p) => ({ ...p, responseTime: e.target.value }))}
                    className="input-field mt-2"
                  >
                    {['15 mins', '30 mins', '1 hour', '2 hours', 'Same day'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {stepIndex === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900">Portfolio</h2>
                  <p className="text-slate-500 font-medium">Add an optional link to your best work.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Portfolio URL</label>
                  <input
                    value={form.portfolioUrl}
                    onChange={(e) => setForm((p) => ({ ...p, portfolioUrl: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., https://behance.net/yourname"
                  />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <div className="font-extrabold text-slate-900 mb-1">Preview</div>
                  <div className="text-sm text-slate-500 font-medium mb-4">This is how you’ll appear on your seller profile.</div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black">
                      {(form.fullName.trim()[0] || 'H').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-slate-900">{form.fullName.trim() || 'Your Name'}</div>
                      <div className="text-slate-500 font-semibold text-sm">{form.title.trim() || 'Your Seller Title'}</div>
                      <div className="text-slate-500 font-medium text-sm mt-1">
                        {form.location.trim() || 'Sri Lanka'} • Response: {form.responseTime}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(form.skills.length ? form.skills : ['Your skills']).slice(0, 5).map((s) => (
                          <span key={s} className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stepIndex === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900">Review</h2>
                  <p className="text-slate-500 font-medium">Confirm your details before finishing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-100 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile</div>
                    <div className="mt-2 space-y-2">
                      <div className="font-black text-slate-900">{form.fullName}</div>
                      <div className="text-slate-600 font-semibold">{form.title}</div>
                      <div className="text-slate-500 font-medium text-sm">{form.location}</div>
                      {form.languages.trim() !== '' && (
                        <div className="text-slate-500 font-medium text-sm">Languages: {form.languages}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skills</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.skills.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-xs font-bold text-primary-700">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-slate-500 font-medium">Response time: {form.responseTime}</div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</div>
                  <div className="mt-2 text-slate-600 font-medium whitespace-pre-line">{form.bio}</div>
                </div>

                {form.portfolioUrl.trim() !== '' && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Portfolio</div>
                    <a href={form.portfolioUrl} className="mt-2 block text-primary-600 font-bold hover:underline" target="_blank" rel="noreferrer">
                      {form.portfolioUrl}
                    </a>
                  </div>
                )}

                <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-black text-slate-900">You’re ready to create your first gig</div>
                    <div className="text-sm text-slate-600 font-medium">Next: we’ll add the “Create Gig” form and connect it here.</div>
                  </div>
                  <button type="button" className="btn-primary px-6 py-3 disabled:opacity-50" disabled={saving} onClick={becomeFreelancer}>
                    {saving ? 'Switching...' : 'Create a Gig'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between gap-3">
              <button type="button" className="btn-secondary px-6 py-3 disabled:opacity-50" onClick={onBack} disabled={stepIndex === 0}>
                Back
              </button>
              {error && <div className="text-sm font-bold text-red-600">{error}</div>}
              <div className="flex items-center gap-3">
                <button type="button" className="text-slate-500 font-bold hover:text-slate-900" onClick={() => {
                  setTouched(false);
                  setStepIndex(0);
                  setForm({ fullName: '', title: '', location: '', languages: '', bio: '', skills: [], portfolioUrl: '', responseTime: '1 hour' });
                }}>
                  Reset
                </button>
                {stepIndex < steps.length - 1 && (
                  <button type="button" className="btn-primary px-6 py-3" onClick={onNext}>
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};
