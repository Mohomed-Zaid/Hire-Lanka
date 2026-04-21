import React, { useContext, useEffect, useState } from 'react';
import { 
  Filter, 
  ChevronDown, 
  Star, 
  Clock, 
  Search,
  Home,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Send, 
  Plus, 
  ArrowLeft,
  LayoutDashboard, 
  Settings, 
  LogOut, 
  FileText, 
  DollarSign,
  Zap,
  Briefcase,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, GigCard, BottomNav, PageTransition } from './Pages';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../auth/AuthProvider';

// --- Marketplace Page ---

export const MarketplacePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();

  const [remoteGigs, setRemoteGigs] = useState<any[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  
  const seedGigs = [
    { id: 'seed1', title: "Custom Sinhala & Tamil Logo Design", freelancer: "Vimal R.", price: 3000, rating: 4.9, image: "https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=800", category: "Graphic Design", sellerHandle: 'vimal' },
    { id: 'seed2', title: "Professional 4K Drone Photography in Kandy", freelancer: "Dilshan S.", price: 12000, rating: 5.0, image: "https://images.unsplash.com/photo-1473415786058-690293980af8?auto=format&fit=crop&q=80&w=800", category: "Photography", sellerHandle: 'dilshan' },
    { id: 'seed3', title: "Individual Chemistry Classes for O/L Students", freelancer: "Dr. Sandun", price: 2500, rating: 4.8, image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800", category: "Tuition", sellerHandle: 'sandun' },
    { id: 'seed4', title: "WordPress Speed Optimization & Security", freelancer: "Nuwan K.", price: 8500, rating: 4.7, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800", category: "Tech & IT", sellerHandle: 'nuwan' },
    { id: 'seed5', title: "Social Media Marketing for Local Shops", freelancer: "Amara P.", price: 5000, rating: 4.9, image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800", category: "Writing", sellerHandle: 'amara' },
    { id: 'seed6', title: "Mobile App Development for iOS & Android", freelancer: "TechLeap", price: 85000, rating: 5.0, image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800", category: "Tech & IT", sellerHandle: 'techleap' },
  ];

  useEffect(() => {
    let mounted = true;
    const channelRef: { current: any } = { current: null };

    const fetchGigs = async () => {
      setLoadingGigs(true);
      const { data: gigsData, error: gigsError } = await supabase
        .from('gigs')
        .select('id, title, category, description, requirements, packages, owner_id, created_at, cover_image_url')
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (gigsError) {
        setRemoteGigs([]);
        setLoadingGigs(false);
        return;
      }

      const ownerIds = Array.from(new Set((gigsData || []).map((g: any) => g.owner_id).filter(Boolean)));
      const { data: ownersData } = ownerIds.length
        ? await supabase.from('profiles').select('id, full_name, handle').in('id', ownerIds)
        : ({ data: [] } as any);
      const ownersById = new Map<string, any>();
      for (const o of ownersData || []) {
        ownersById.set(o.id, o);
      }

      const mapped = (gigsData || []).map((g: any) => {
        const owner = ownersById.get(g.owner_id);
        return {
          id: g.id,
          title: g.title,
          freelancer: owner?.full_name || 'Seller',
          price: Number(g.packages?.Basic?.price || 0),
          rating: 5.0,
          image: g.cover_image_url || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
          category: g.category,
          sellerHandle: owner?.handle || 'seller',
          sellerId: g.owner_id,
          sellerName: owner?.full_name || 'Seller',
          gigId: g.id,
          packages: g.packages,
        };
      });

      setRemoteGigs(mapped);
      setLoadingGigs(false);
    };

    (async () => {
      await fetchGigs();

      const chName = `gigs-marketplace`;
      const existing = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(chName));
      if (existing) supabase.removeChannel(existing);

      const ch = supabase
        .channel(chName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, async () => {
          await fetchGigs();
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
  }, []);

  const gigs = [...remoteGigs, ...(loadingGigs ? [] : seedGigs)];

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRatings([]);
  };

  const parsedMin = minPrice.trim() === '' ? undefined : Number(minPrice);
  const parsedMax = maxPrice.trim() === '' ? undefined : Number(maxPrice);

  const filteredGigs = gigs
    .filter(gig => (selectedCategory === 'All' ? true : gig.category === selectedCategory))
    .filter(gig => (parsedMin === undefined || Number.isNaN(parsedMin) ? true : gig.price >= parsedMin))
    .filter(gig => (parsedMax === undefined || Number.isNaN(parsedMax) ? true : gig.price <= parsedMax))
    .filter(gig => {
      if (selectedRatings.length === 0) return true;
      return selectedRatings.some(r => gig.rating >= r);
    });

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="mb-8 md:mb-10">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Explore services</h1>
                <p className="text-slate-500 font-medium mt-2">Find verified local talent and get work done fast.</p>
              </div>
            </div>
            <div className="mt-6 bg-white border border-slate-200/70 rounded-2xl shadow-card p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search services (e.g. logo design, video editing...)"
                className="flex-1 bg-transparent outline-none text-sm md:text-base font-medium text-slate-800 placeholder:text-slate-400"
              />
              <button type="button" className="btn-primary px-5 py-2.5 text-sm rounded-xl">Search</button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/70 shadow-card mb-2">
              <button className="flex items-center gap-2 font-extrabold text-slate-900" onClick={() => setIsMobileFiltersOpen(true)}>
                <Filter className="w-5 h-5 text-primary-600" />
                Filters
              </button>
              <button
                className="text-primary-700 font-bold text-sm hover:text-primary-600"
                onClick={clearAllFilters}
              >
                Clear
              </button>
            </div>

            {isMobileFiltersOpen && (
              <motion.div
                className="fixed inset-0 z-[70] lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsMobileFiltersOpen(false)}
                />
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-[92%] max-w-sm bg-white shadow-2xl p-6 overflow-y-auto"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="font-extrabold text-slate-900 text-lg">Filters</div>
                    <button type="button" className="text-slate-500 font-bold" onClick={() => setIsMobileFiltersOpen(false)}>
                      Close
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 mb-4">Categories</h3>
                      <div className="space-y-2">
                        {['All', 'Graphic Design', 'Video & Animation', 'Writing', 'Tech & IT', 'Tuition', 'Photography'].map(cat => (
                          <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="cat-mobile" 
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded" 
                              checked={selectedCategory === cat}
                              onChange={() => setSelectedCategory(cat)}
                            />
                            <span className={`text-sm font-semibold transition-colors ${selectedCategory === cat ? 'text-primary-600' : 'text-slate-600 group-hover:text-slate-900'}`}>
                              {cat}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-4">Price Range</h3>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="input-field py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="input-field py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-base font-extrabold text-slate-900 mb-4">Seller Rating</h3>
                      <div className="space-y-2">
                        {[5, 4, 3].map(rating => (
                          <label key={rating} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                              checked={selectedRatings.includes(rating)}
                              onChange={() => {
                                setSelectedRatings((prev) =>
                                  prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
                                );
                              }}
                            />
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold text-slate-600">{rating}+ Stars</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-3">
                    <button type="button" className="btn-secondary px-5 py-3" onClick={clearAllFilters}>
                      Clear
                    </button>
                    <button type="button" className="btn-primary px-6 py-3" onClick={() => setIsMobileFiltersOpen(false)}>
                      Apply
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Filters Sidebar */}
            <aside className="hidden lg:block w-64 space-y-8 shrink-0">
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-5">
                <h3 className="text-base font-extrabold text-slate-900 mb-4">Category</h3>
                <div className="space-y-2">
                  {['All', 'Graphic Design', 'Video & Animation', 'Writing', 'Tech & IT', 'Tuition', 'Photography'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="cat"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span className={`text-sm font-semibold transition-colors ${selectedCategory === cat ? 'text-primary-700' : 'text-slate-600 group-hover:text-slate-900'}`}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-5">
                <h3 className="text-base font-extrabold text-slate-900 mb-4">Price range</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="input-field py-2.5 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="input-field py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-5">
                <h3 className="text-base font-extrabold text-slate-900 mb-4">Seller rating</h3>
                <div className="space-y-2">
                  {[5, 4, 3].map(rating => (
                    <label key={rating} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => {
                          setSelectedRatings((prev) =>
                            prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
                          );
                        }}
                      />
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-slate-600">{rating}+ Stars</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button type="button" className="mt-4 w-full btn-secondary py-2.5 text-sm" onClick={clearAllFilters}>
                  Clear filters
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {selectedCategory} services
                  </h2>
                  <div className="text-sm text-slate-500 font-medium mt-1">{filteredGigs.length} results</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-500 hidden sm:block">Sort</span>
                  <button className="flex items-center justify-between gap-2 text-sm font-bold text-slate-900 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-card min-w-[180px]">
                    Best Selling <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {filteredGigs.map((gig: any, i) => (
                  <motion.div
                    key={gig.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.25) }}
                    onClick={() => {
                      navigate(`/gig/${gig.id || i}`, { state: gig });
                    }}
                  >
                    <GigCard {...gig} />
                  </motion.div>
                ))}
              </div>
            </main>
          </div>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

// --- Gig Detail Page ---

export const GigDetailPage = () => {
  const [activeTab, setActiveTab] = useState('Basic');
  const navigate = useNavigate();
  const location = useLocation();

  const gig = (location.state || {}) as any;

  const gigTitle = gig?.title || 'I will design a modern professional logo for your Sri Lankan business';
  const gigCategory = gig?.category || 'Graphic Design';
  const sellerName = gig?.sellerName || gig?.freelancer || 'Aruni Perera';
  const sellerHandle = gig?.sellerHandle || 'aruni';
  const sellerId = gig?.sellerId || 'seed_seller_1';
  const gigId = gig?.gigId || gig?.id || 'seed_gig_1';
  const coverImage = gig?.cover_image_url || gig?.image || "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=1200";

  const packages: any = gig?.packages
    ? {
        Basic: {
          price: Number(gig.packages?.Basic?.price || 2500),
          delivery: `${gig.packages?.Basic?.deliveryDays || 2} Days`,
          revisions: `${gig.packages?.Basic?.revisions || 1} Revision`,
          desc: gig.packages?.Basic?.desc || 'Standard package',
        },
        Standard: {
          price: Number(gig.packages?.Standard?.price || 5500),
          delivery: `${gig.packages?.Standard?.deliveryDays || 3} Days`,
          revisions: `${gig.packages?.Standard?.revisions || 3} Revisions`,
          desc: gig.packages?.Standard?.desc || 'Standard package',
        },
        Premium: {
          price: Number(gig.packages?.Premium?.price || 8500),
          delivery: `${gig.packages?.Premium?.deliveryDays || 5} Days`,
          revisions: `${gig.packages?.Premium?.revisions || 'Unlimited'} Revisions`,
          desc: gig.packages?.Premium?.desc || 'Premium package',
        },
      }
    : {
        Basic: { price: 2500, delivery: '2 Days', revisions: '1 Revision', desc: 'Standard high-quality logo design with 2 concepts and JPEG/PNG files.' },
        Standard: { price: 5500, delivery: '3 Days', revisions: '3 Revisions', desc: 'Premium logo design with 4 concepts, vector files, and 3D mockup.' },
        Premium: { price: 8500, delivery: '5 Days', revisions: 'Unlimited', desc: 'Full brand identity including logo, business card, and social media kit.' },
      };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Left Column: Content */}
            <div className="flex-1 space-y-8 md:space-y-10">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                  <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-card">{gigCategory}</span>
                  <span className="text-slate-300">/</span>
                  <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-card">Services</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                  {gigTitle}
                </h1>
                
                <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <Link to={`/freelancer/${sellerHandle}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-600 flex items-center justify-center text-white font-extrabold">
                        {sellerName?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-base">{sellerName}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary-700 bg-primary-50 border border-primary-200/70 px-2 py-1 rounded-full">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-semibold mt-1">Top rated seller • Local expert</div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-extrabold text-slate-900">4.9</span>
                        <span className="text-slate-400 text-sm font-semibold">(124)</span>
                      </div>
                      <div className="text-sm font-semibold">
                        <span className="text-slate-400">Response:</span>
                        <span className="text-emerald-600 font-extrabold ml-2">~1 hour</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery */}
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card overflow-hidden">
                <div className="aspect-video bg-slate-100 relative group overflow-hidden">
                  <img src={coverImage} alt="Gig Gallery" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">About this service</h2>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg font-medium">
                  Are you looking for a clean, modern, and memorable logo for your startup or business? I specialize in creating brand identities that resonate with the local market while maintaining international quality standards.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    "100% Original and Custom Designs",
                    "Fast Delivery & High-Resolution Files",
                    "Friendly Communication in Sinhala or English",
                    "Source Files Included (Vector/AI/PSD)"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm md:text-base font-medium">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Sticky Pricing */}
            <div className="lg:w-[400px]">
              <div className="bg-white border border-slate-200/70 rounded-2xl shadow-card sticky top-24 overflow-hidden">
                {/* Package Selector */}
                <div className="flex border-b border-slate-200/70 bg-slate-50/40">
                  {Object.keys(packages).map(pkg => (
                    <button
                      key={pkg}
                      onClick={() => setActiveTab(pkg)}
                      className={`flex-1 py-4 font-extrabold text-xs md:text-sm transition-all relative ${activeTab === pkg ? 'text-primary-700 bg-white' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      {pkg}
                      {activeTab === pkg && (
                        <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl md:text-3xl font-extrabold text-slate-900">Rs. {packages[activeTab].price.toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {packages[activeTab].desc}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-800">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {packages[activeTab].delivery}
                    </div>
                    <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-800">
                      <Zap className="w-4 h-4 text-slate-400" />
                      {packages[activeTab].revisions}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
                      <div className="text-xs font-extrabold text-slate-900">Secure</div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-1">Payments</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
                      <div className="text-xs font-extrabold text-slate-900">Fast</div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-1">Delivery</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-center">
                      <div className="text-xs font-extrabold text-slate-900">Support</div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-1">24/7</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      className="btn-primary w-full py-4 text-base md:text-lg shadow-lg shadow-primary-500/20"
                      onClick={() =>
                        navigate('/checkout', {
                          state: {
                            packageName: activeTab,
                            price: packages[activeTab].price,
                            gigId,
                            gigTitle,
                            sellerId,
                            sellerName,
                            sellerHandle,
                          },
                        })
                      }
                    >
                      Order Now
                    </button>
                    <button
                      type="button"
                      className="btn-secondary w-full py-4 text-base md:text-lg"
                      onClick={() => navigate(`/messages?partnerId=${encodeURIComponent(String(sellerId))}`)}
                    >
                      Contact Seller
                    </button>
                  </div>
                  <p className="text-center text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-widest">Secure Payment via HireLanka</p>
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

// --- Client Invoices Section ---

type ClientInvoiceRow = {
  id: string;
  type: 'final' | 'milestone';
  title: string;
  total_amount: number;
  milestones: { label: string; amount: number; status: 'pending' | 'paid' }[];
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  created_at: string;
  freelancer_name: string;
};

const ClientInvoicesSection = ({ profile }: { profile: any }) => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<ClientInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!profile?.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select('id, type, title, total_amount, milestones, status, created_at, freelancer:profiles!invoices_freelancer_id_fkey(id, full_name)')
        .eq('client_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const mapped: ClientInvoiceRow[] = (data || []).map((r: any) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        total_amount: Number(r.total_amount || 0),
        milestones: Array.isArray(r.milestones) ? r.milestones : [],
        status: r.status,
        created_at: r.created_at,
        freelancer_name: r.freelancer?.full_name || 'Freelancer',
      }));
      setInvoices(mapped);
      setLoading(false);
    };
    fetchInvoices();
  }, [profile?.id]);

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
        <h2 className="text-lg md:text-xl font-bold text-slate-900">Bills & Invoices</h2>
      </div>

      {loading ? (
        <p className="text-slate-400 font-medium">Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-500 font-medium">
          No invoices yet. When a freelancer sends you an invoice, it will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const paidAmount = inv.milestones.length
              ? inv.milestones.filter((m) => m.status === 'paid').reduce((s, m) => s + Number(m.amount), 0)
              : inv.status === 'paid' ? inv.total_amount : 0;
            return (
              <div key={inv.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{inv.title}</div>
                    <div className="text-sm text-slate-500 font-medium">
                      {inv.freelancer_name} • {inv.type === 'milestone' ? 'Milestone' : 'Final'} • {new Date(inv.created_at).toLocaleDateString()}
                    </div>
                    {inv.type === 'milestone' && inv.milestones.length > 0 && (
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        {inv.milestones.filter((m) => m.status === 'paid').length}/{inv.milestones.length} parts paid
                        {paidAmount > 0 ? ` • Rs. ${paidAmount.toLocaleString()} of Rs. ${inv.total_amount.toLocaleString()}` : ''}
                      </div>
                    )}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Client Dashboard ---

export const ClientDashboard = () => {
  const [activeView, setActiveView] = useState('Overview');
  const navigate = useNavigate();

  const { profile } = useContext(AuthContext);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [_loadingOrders, setLoadingOrders] = useState(true);
  void _loadingOrders;
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = (e.target.files || [])[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `avatars/${profile.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('media').upload(path, file, { upsert: true });
      if (uploadErr) { window.alert(uploadErr.message); return; }
      const { data: pub } = supabase.storage.from('media').getPublicUrl(path);
      const url = (pub as any)?.publicUrl ? String((pub as any).publicUrl) : '';
      if (!url) return;
      const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
      if (updateErr) { window.alert(updateErr.message); return; }
      // Force AuthProvider to re-fetch avatar by toggling auth state
      const { data: refreshed } = await supabase.auth.getSession();
      if (refreshed?.session) {
        await supabase.auth.updateUser({ data: { _avatarTs: Date.now() } });
      }
    } finally {
      setUploadingAvatar(false);
      try { (e.target as any).value = ''; } catch { /* ignore */ }
    }
  };

  useEffect(() => {
    let mounted = true;
    const channelRef: { current: any } = { current: null };

    const fetchOrders = async () => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from('orders')
        .select('id, package_name, total, status, created_at, gig:gigs(id, title), seller:profiles!orders_seller_id_fkey(id, full_name, handle)')
        .eq('buyer_id', profile.id)
        .order('created_at', { ascending: false });

      if (!mounted) return;
      if (error) {
        setMyOrders([]);
        setLoadingOrders(false);
        return;
      }

      setMyOrders(data || []);
      setLoadingOrders(false);
    };

    (async () => {
      if (!profile?.id) {
        setMyOrders([]);
        setLoadingOrders(false);
        return;
      }

      setLoadingOrders(true);
      await fetchOrders();

      const chName = `orders-buyer-${profile.id}`;
      const existing = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(chName));
      if (existing) supabase.removeChannel(existing);

      const ch = supabase
        .channel(chName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: `buyer_id=eq.${profile.id}` },
          async () => {
            await fetchOrders();
          }
        )
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
  }, [profile?.id]);

  const totalSpent = myOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const activeOrdersCount = myOrders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  const stats = [
    { label: 'Total Spent', value: `Rs. ${totalSpent.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Orders', value: String(activeOrdersCount), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Unread Messages', value: '12', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const orders = myOrders.map((o: any) => ({
    id: o.id,
    gig: o.gig?.title || '—',
    seller: o.seller?.full_name || '—',
    date: new Date(o.created_at || Date.now()).toLocaleDateString(),
    price: `Rs. ${Number(o.total || 0).toLocaleString()}`,
    status: o.status,
  }));

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pb-24 md:pb-0">
        {/* Sidebar */}
        <aside className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200/60 flex flex-col md:pt-8">
          <div className="hidden md:flex px-6 mb-12 items-center gap-2">
             <Link to="/" className="flex items-center gap-2">
               <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shrink-0">H</div>
               <span className="text-xl font-extrabold hidden lg:block truncate tracking-tight">HireLanka</span>
             </Link>
          </div>

          <nav className="flex md:flex-col px-4 py-4 md:py-0 space-x-4 md:space-x-0 md:space-y-1 overflow-x-auto md:overflow-x-visible no-scrollbar">
            {[
              { icon: LayoutDashboard, label: 'Overview' },
              { icon: Briefcase, label: 'Active Orders' },
              { icon: MessageSquare, label: 'Messages' },
              { icon: FileText, label: 'Bills & Invoices' },
              { icon: Settings, label: 'Settings' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveView(item.label)}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-all shrink-0
                  ${activeView === item.label ? 'bg-primary-50 text-primary-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden lg:block whitespace-nowrap text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="hidden md:block p-6 mt-auto border-t border-slate-200/60">
             <button
               className="flex items-center gap-4 text-slate-400 font-semibold hover:text-red-500 hover:bg-red-50 transition-colors w-full px-4 py-3 rounded-xl"
               onClick={async () => {
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
               }}
             >
               <LogOut className="w-6 h-6" />
               <span className="hidden lg:block">Logout</span>
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Hello, {profile?.fullName || 'there'}!</h1>
              <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Here's what's happening with your projects today.</p>
            </div>
            <div className="flex items-center gap-3 md:gap-4 self-end sm:self-auto">
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-slate-200/70 flex items-center justify-center relative hover:bg-slate-50 transition-colors shadow-sm">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-slate-400" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-primary-100">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary-700 font-extrabold text-sm md:text-base">{profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
                )}
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          {activeView === 'Overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-12">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white border border-slate-200/70 p-6 flex items-center gap-4 rounded-2xl shadow-card"
                  >
                    <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-white overflow-hidden rounded-2xl shadow-card border border-slate-200/70">
                <div className="p-6 md:p-8 border-b border-slate-200/60 flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900">Recent Orders</h2>
                  <button className="text-primary-600 font-semibold text-sm hover:text-primary-700" onClick={() => setActiveView('Active Orders')}>View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-6 md:px-8 py-4">Service</th>
                        <th className="px-6 md:px-8 py-4">Seller</th>
                        <th className="px-6 md:px-8 py-4">Date</th>
                        <th className="px-6 md:px-8 py-4">Total</th>
                        <th className="px-6 md:px-8 py-4">Status</th>
                        <th className="px-6 md:px-8 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((row: any, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 md:px-8 py-4 md:py-5 font-extrabold text-slate-900 text-sm">{row.gig}</td>
                          <td className="px-6 md:px-8 py-4 md:py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.seller}`} alt={row.seller} />
                              </div>
                              <span className="font-medium text-slate-600 text-sm">{row.seller}</span>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-5 text-slate-500 font-medium text-sm">{row.date}</td>
                          <td className="px-6 md:px-8 py-4 md:py-5 font-extrabold text-slate-900 text-sm">{row.price}</td>
                          <td className="px-6 md:px-8 py-4 md:py-5">
                             <span className={`px-3 py-1 rounded-full border text-[10px] md:text-xs font-extrabold ${
                               row.status === 'Placed' ? 'bg-slate-50 border-slate-200 text-slate-700' :
                               row.status === 'In Progress' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                               row.status === 'Delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                               'bg-amber-50 border-amber-200 text-amber-700'
                             }`}>
                               {row.status}
                             </span>
                          </td>
                          <td className="px-6 md:px-8 py-4 md:py-5">
                            <button
                              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
                              onClick={() => {
                                if (row.id) navigate(`/orders/${row.id}`);
                              }}
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeView === 'Active Orders' && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900">Active Orders</h2>
                <button className="text-primary-600 font-semibold text-sm hover:text-primary-700" onClick={() => setActiveView('Overview')}>Back to Overview</button>
              </div>
              <div className="space-y-3">
                {orders.filter((row: any) => String(row?.status) !== 'Cancelled').map((row: any, i: number) => (
                  <div key={i} className="p-5 rounded-xl border border-slate-200/60 bg-slate-50/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900">{row.gig}</div>
                      <div className="text-sm text-slate-500 font-medium mt-1">Seller: {row.seller} • Due: {row.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900">{row.price}</span>
                      <button
                        className="btn-primary py-2 px-4 text-sm"
                        onClick={() => {
                          if (row.id) navigate(`/orders/${row.id}`);
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

          {activeView === 'Messages' && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
              <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2">Messages</h2>
              <p className="text-slate-500 font-medium mb-6">Open your conversations and manage order communication.</p>
              <a href="/messages" className="btn-primary inline-flex items-center justify-center px-5 py-3">Go to Inbox</a>
            </div>
          )}

          {activeView === 'Bills & Invoices' && (
            <ClientInvoicesSection profile={profile} />
          )}

          {activeView === 'Settings' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">Profile Settings</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Update your personal information and public profile.</p>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                  <label className={`relative w-16 h-16 rounded-full shrink-0 cursor-pointer group ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-extrabold text-2xl">
                        {profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <input type="file" accept="image/*" disabled={uploadingAvatar} onChange={handleAvatarUpload} className="hidden" />
                  </label>
                  <div>
                    <div className="font-bold text-slate-900">{profile?.fullName || 'User'}</div>
                    <div className="text-sm text-slate-400 font-medium">{profile?.email}</div>
                    <div className="text-xs text-primary-600 font-semibold mt-1 capitalize">{profile?.role}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">{uploadingAvatar ? 'Uploading...' : 'Click avatar to change photo'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                    <input type="text" className="input-field" defaultValue={profile?.fullName || ''} placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                    <input type="email" className="input-field bg-slate-50" defaultValue={profile?.email || ''} disabled />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Phone Number</label>
                    <input type="tel" className="input-field" placeholder="+94 77 123 4567" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Location</label>
                    <input type="text" className="input-field" placeholder="Colombo, Sri Lanka" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Bio</label>
                  <textarea className="input-field min-h-[80px] resize-none" placeholder="Tell clients a bit about yourself..." />
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="btn-primary px-6 py-2.5 text-sm">Save Changes</button>
                </div>
              </div>

              {/* Password & Security */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">Password & Security</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Keep your account secure by updating your password.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Current Password</label>
                    <input type="password" className="input-field" placeholder="Enter current password" />
                  </div>
                  <div />
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">New Password</label>
                    <input type="password" className="input-field" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Confirm New Password</label>
                    <input type="password" className="input-field" placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="btn-primary px-6 py-2.5 text-sm">Update Password</button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">Notifications</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Manage how you receive updates and alerts.</p>
                <div className="space-y-4">
                  {[
                    { label: 'Order updates', desc: 'Get notified when an order status changes' },
                    { label: 'New messages', desc: 'Receive alerts for new chat messages' },
                    { label: 'Promotional emails', desc: 'Tips, offers, and platform updates' },
                    { label: 'Invoice & payments', desc: 'Payment receipts and invoice reminders' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 3} className="sr-only peer" />
                        <div className="w-10 h-5.5 bg-slate-200 peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:bg-primary-500 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-transform peer-checked:after:translate-x-[18px] after:shadow-sm" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-2xl shadow-card border border-slate-200/70 p-6 md:p-8">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">Account</h2>
                <p className="text-slate-500 text-sm font-medium mb-6">Manage your account session and data.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    className="btn-secondary px-5 py-2.5 text-sm flex items-center gap-2 hover:text-red-600 hover:border-red-200"
                    onClick={async () => {
                      try { await supabase.auth.signOut(); } catch { /* ignore */ }
                      try {
                        localStorage.removeItem('hirelanka_session');
                        localStorage.removeItem('hirelanka_authed');
                      } catch { /* ignore */ }
                      window.location.replace('/auth/signin');
                    }}
                  >
                    <LogOut className="w-4 h-4" />Logout
                  </button>
                  <button className="btn-secondary px-5 py-2.5 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

// --- Messaging System ---

export const ChatSystem = () => {
  const [msg, setMsg] = useState('');
  const [activeChat, setActiveChat] = useState(0);
  const [showList, setShowList] = useState(true);
  const { profile } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [_loadingChats, setLoadingChats] = useState(true);
  void _loadingChats;
  const [_loadingMessages, setLoadingMessages] = useState(true);
  void _loadingMessages;
  const [sending, setSending] = useState(false);
  const [forcedPartnerName, setForcedPartnerName] = useState<string>('');

  const partnerIdFromUrl = (() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const id = sp.get('partnerId');
      return id ? String(id) : undefined;
    } catch {
      return undefined;
    }
  })();

  const requestIdFromUrl = (() => {
    try {
      const sp = new URLSearchParams(location.search || '');
      const id = sp.get('requestId');
      return id ? String(id) : undefined;
    } catch {
      return undefined;
    }
  })();
  
  useEffect(() => {
    let mounted = true;
    const channelRef: { current: any } = { current: null };
    const userId = profile?.id;

    const fetchChats = async () => {
        if (!userId) return;
        setLoadingChats(true);
        const { data, error } = await supabase
          .from('messages')
          .select('id, body, created_at, sender_id, receiver_id, sender:profiles!messages_sender_id_fkey(id, full_name), receiver:profiles!messages_receiver_id_fkey(id, full_name)')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(200);

        if (!mounted) return;
        if (error) {
          setChats([]);
          setLoadingChats(false);
          return;
        }

        const latestByPartner = new Map<string, any>();
        for (const m of data || []) {
          const partnerId = m.sender_id === userId ? m.receiver_id : m.sender_id;
          if (!partnerId) continue;
          if (latestByPartner.has(partnerId)) continue;

          const partnerProfile = m.sender_id === userId ? m.receiver : m.sender;
          const partnerName = Array.isArray(partnerProfile)
            ? partnerProfile?.[0]?.full_name
            : (partnerProfile as any)?.full_name;
          latestByPartner.set(partnerId, {
            partnerId,
            name: partnerName || 'User',
            lastMsg: m.body,
            lastAt: m.created_at,
            unread: 0,
            online: true,
            role: '—',
          });
        }

        const list = Array.from(latestByPartner.values());
        setChats(list);
        setLoadingChats(false);
      };

      const fetchThread = async (partnerId: string) => {
        if (!userId) return;
        setLoadingMessages(true);
        const { data, error } = await supabase
          .from('messages')
          .select('id, body, created_at, sender_id, receiver_id')
          .or(
            `and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`
          )
          .order('created_at', { ascending: true })
          .limit(500);

        if (!mounted) return;
        if (error) {
          setMessages([]);
          setLoadingMessages(false);
          return;
        }

        setMessages(data || []);
        setLoadingMessages(false);
      };

      const ensurePartnerInList = (partnerId: string, partnerName?: string) => {
        setChats((prev) => {
          if (prev.some((c) => String(c?.partnerId) === String(partnerId))) return prev;
          return [
            {
              partnerId,
              name: partnerName || 'User',
              lastMsg: '',
              lastAt: new Date().toISOString(),
              unread: 0,
              online: true,
              role: '—',
            },
            ...prev,
          ];
        });
      };

    (async () => {
      if (!userId) {
        setChats([]);
        setMessages([]);
        setLoadingChats(false);
        setLoadingMessages(false);
        return;
      }

      await fetchChats();

      if (partnerIdFromUrl) {
        try {
          const { data: partnerProfile } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', partnerIdFromUrl)
            .maybeSingle();
          const partnerName = (partnerProfile as any)?.full_name ? String((partnerProfile as any).full_name) : 'User';
          if (mounted) setForcedPartnerName(partnerName);
          ensurePartnerInList(partnerIdFromUrl, partnerName);
        } catch {
          ensurePartnerInList(partnerIdFromUrl, 'User');
        }
      }

      const initialPartnerId = chats?.[activeChat]?.partnerId as string | undefined;
      const partnerToOpen = initialPartnerId || partnerIdFromUrl;
      if (partnerToOpen) {
        await fetchThread(partnerToOpen);
      } else {
        setMessages([]);
        setLoadingMessages(false);
      }

      const chName = `messages-${userId}`;
      const existing = supabase.getChannels().find((c: any) => String((c as any)?.topic || '').includes(chName));
      if (existing) supabase.removeChannel(existing);

      const ch = supabase
        .channel(chName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'messages' },
          async (payload) => {
            const row: any = payload.new || payload.old;
            if (!row) return;
            if (!userId) return;
            if (row.sender_id !== userId && row.receiver_id !== userId) return;
            await fetchChats();
            const partnerId = chats?.[activeChat]?.partnerId as string | undefined;
            if (!partnerId) return;
            if (row.sender_id === partnerId || row.receiver_id === partnerId) {
              await fetchThread(partnerId);
            }
          }
        )
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, activeChat]);

  const active = chats[activeChat];
  const activePartnerId = (active?.partnerId as string | undefined) || partnerIdFromUrl;
  const activeName = active?.name || forcedPartnerName || 'Messages';

  return (
    <PageTransition>
      <div className="h-screen bg-slate-50 flex flex-col md:flex-row pb-24 md:pb-0 overflow-hidden">
        {/* Sidebar - Chat List */}
        <aside className={`
          w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full
          ${!showList ? 'hidden md:flex' : 'flex'}
        `}>
          <div className="p-4 md:p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between mb-4 md:mb-6">
               <h1 className="text-xl md:text-2xl font-bold text-slate-900">Messages</h1>
               <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                 <Plus className="w-5 h-5 md:w-6 md:h-6" />
               </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search chats..." className="input-field pl-10 py-2 bg-slate-50 border-none text-sm" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
             {chats.map((chat, i) => (
               <button 
                key={i} 
                onClick={() => {
                  setActiveChat(i);
                  if (window.innerWidth < 768) setShowList(false);
                }}
                className={`
                  w-full p-4 md:p-6 flex gap-3 md:gap-4 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 relative group
                  ${activeChat === i ? 'bg-primary-50/50' : ''}
                `}
               >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt={chat.name} className="w-full h-full object-cover" />
                    </div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5 md:mb-1">
                      <span className={`font-bold text-sm md:text-base truncate ${chat.unread > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {chat.name}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{chat.time}</span>
                    </div>
                    <p className={`text-xs md:text-sm truncate ${chat.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                      {chat.lastMsg}
                    </p>
                  </div>
                  {chat.unread > 0 && ( activeChat !== i && (
                    <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 bg-primary-600 text-white w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold shadow-sm">
                      {chat.unread}
                    </div>
                  ))}
               </button>
             ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className={`
          flex-1 flex flex-col bg-white h-full relative
          ${showList ? 'hidden md:flex' : 'flex'}
        `}>
          {/* Chat Header */}
          <header className="px-4 md:px-8 py-3 md:py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 md:gap-4">
               {/* Mobile Back Button */}
               <button 
                onClick={() => setShowList(true)}
                className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>

               <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-200 overflow-hidden border border-slate-100">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeName}`} alt={activeName} />
               </div>
               <div>
                 <h3 className="font-bold text-slate-900 text-sm md:text-base">{activeName}</h3>
                 <span className="text-[10px] md:text-xs text-green-500 font-bold flex items-center gap-1">
                   <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-500 rounded-full animate-pulse" />
                   Online
                 </span>
               </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                onClick={() => navigate('/')}
              >
                <Home className="w-5 h-5 md:w-6 md:h-6" />
              </button>
               <button className="p-2 md:p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                  <Clock className="w-5 h-5 md:w-6 md:h-6" />
               </button>
               <button
                 disabled={!activePartnerId}
                 className="btn-primary py-2 md:py-2.5 px-4 text-xs md:text-sm whitespace-nowrap shadow-lg shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Hire {activeName.split(' ')[0]}
               </button>
            </div>
          </header>

          {/* Message Area */}
          <div className="flex-1 bg-slate-50 p-4 md:p-8 overflow-y-auto space-y-4 md:space-y-6 flex flex-col">
             {messages.map((m, i) => (
               (() => {
                 const isMe = String((m as any)?.sender_id ?? (m as any)?.sender) === String(profile?.id) || (m as any)?.sender === 'me';
                 const text = String((m as any)?.body ?? (m as any)?.text ?? '');
                 const createdAt = (m as any)?.created_at ?? (m as any)?.time;
                 const timeLabel = createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                 return (
               <motion.div 
                key={i}
                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 md:gap-4 max-w-[85%] md:max-w-lg ${isMe ? 'flex-row-reverse ml-auto' : ''}`}
               >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 mt-auto shrink-0 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeName}`} alt="avatar" />
                    </div>
                  )}
                  <div className={`
                    p-4 md:p-5 rounded-2xl shadow-sm border
                    ${isMe 
                      ? 'bg-primary-600 border-primary-500 rounded-br-none text-white' 
                      : 'bg-white border-slate-100 rounded-bl-none text-slate-600'}
                  `}>
                     <p className="font-medium text-sm md:text-base leading-relaxed">{text}</p>
                     <span className={`text-[9px] md:text-[10px] font-bold uppercase mt-2 md:mt-3 block ${isMe ? 'text-primary-200 text-right' : 'text-slate-400'}`}>
                       {timeLabel}
                     </span>
                  </div>
              </motion.div>
                 );
               })()
             ))}
          </div>

          {/* Chat Input */}
          <footer className="p-4 md:p-6 bg-white border-t border-slate-100 shrink-0">
             <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-center">
                <button className="p-2 text-slate-400 hover:text-primary-600 shrink-0 transition-colors">
                   <Plus className="w-6 h-6" />
                </button>
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Type a message..." 
                    className="input-field py-3 md:py-4 px-4 bg-slate-50 border-none shadow-inner text-sm md:text-base w-full focus:ring-2 focus:ring-primary-500/20 transition-all" 
                  />
                </div>
                <button
                  disabled={sending || !msg.trim() || !activePartnerId}
                  onClick={async () => {
                    if (!profile?.id) return;
                    if (!activePartnerId) return;
                    const body = msg.trim();
                    if (!body) return;
                    const optimistic: any = {
                      id: `tmp-${Date.now()}`,
                      body,
                      created_at: new Date().toISOString(),
                      sender_id: profile.id,
                      receiver_id: activePartnerId,
                    };
                    if (requestIdFromUrl) optimistic.request_id = requestIdFromUrl;
                    setMessages((prev) => [...prev, optimistic]);
                    setSending(true);
                    const insertPayload: any = {
                      sender_id: profile.id,
                      receiver_id: activePartnerId,
                      body,
                    };
                    if (requestIdFromUrl) insertPayload.request_id = requestIdFromUrl;
                    const { error } = await supabase.from('messages').insert(insertPayload);
                    setSending(false);
                    if (error) {
                      setMessages((prev) => prev.filter((x: any) => String(x?.id) !== String((optimistic as any).id)));
                      try {
                        window.alert(error.message);
                      } catch {
                        // ignore
                      }
                      return;
                    }
                    setMsg('');
                  }}
                  className="bg-primary-600 text-white w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 shrink-0 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
             </div>
          </footer>
        </main>
        <BottomNav />
      </div>
    </PageTransition>
  );
};
