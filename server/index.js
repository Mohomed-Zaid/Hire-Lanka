const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET;

if (!SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

if (!ADMIN_API_KEY) {
  throw new Error('Missing ADMIN_API_KEY');
}

if (!ADMIN_EMAIL) {
  throw new Error('Missing ADMIN_EMAIL');
}

if (!ADMIN_PASSWORD) {
  throw new Error('Missing ADMIN_PASSWORD');
}

if (!ADMIN_TOKEN_SECRET) {
  throw new Error('Missing ADMIN_TOKEN_SECRET');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const crypto = require('crypto');

function signAdminToken(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json, 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(data).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  } catch {
    return false;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return false;
  }
  if (!payload || payload.email !== ADMIN_EMAIL) return false;
  if (!payload.exp || Date.now() > Number(payload.exp)) return false;
  return true;
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safe = String(file.originalname || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token');
  if (token && verifyAdminToken(token)) {
    return next();
  }
  const key = req.header('x-admin-key');
  if (!key || key !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }
    if (String(email).trim().toLowerCase() !== String(ADMIN_EMAIL).trim().toLowerCase()) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (String(password) !== String(ADMIN_PASSWORD)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signAdminToken({ email: ADMIN_EMAIL, exp: Date.now() + 1000 * 60 * 60 * 8 });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/admin/health', requireAdmin, async (_req, res) => {
  return res.json({ ok: true });
});

function computeFees(totalAmount) {
  const total = Number(totalAmount);
  if (!Number.isFinite(total) || total <= 0) {
    return null;
  }
  const platformFee = Math.round(total * 0.15 * 100) / 100;
  const netAmount = Math.round((total - platformFee) * 100) / 100;
  return { total, platformFee, netAmount };
}

app.post('/api/upload-payment', upload.single('paymentSlip'), async (req, res) => {
  try {
    const { userId, providerId, totalAmount, serviceType } = req.body || {};
    if (!userId || !providerId || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields: userId, providerId, totalAmount' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Missing payment slip file (paymentSlip)' });
    }

    const fees = computeFees(totalAmount);
    if (!fees) {
      return res.status(400).json({ error: 'Invalid totalAmount' });
    }

    const filePath = `/uploads/${req.file.filename}`;

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: String(userId),
        provider_id: String(providerId),
        service_type: serviceType ? String(serviceType) : null,
        file_path: filePath,
        total_amount: fees.total,
        platform_fee: fees.platformFee,
        net_amount: fees.netAmount,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ payment: data });
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : 'Server error' });
  }
});

app.get('/api/payments', requireAdmin, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ payments: data || [] });
});

app.patch('/api/payments/:id/approve', requireAdmin, async (req, res) => {
  try {
    const paymentId = req.params.id;

    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError) return res.status(404).json({ error: fetchError.message });

    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status: 'approved' })
      .eq('id', paymentId);

    if (updateError) return res.status(500).json({ error: updateError.message });

    const { data: payout, error: payoutError } = await supabaseAdmin
      .from('payouts')
      .insert({
        payment_id: paymentId,
        provider_id: payment.provider_id,
        amount_to_pay: payment.net_amount,
        status: 'pending',
        paid_date: null,
      })
      .select('*')
      .single();

    if (payoutError) return res.status(500).json({ error: payoutError.message });

    return res.json({ paymentId, payout });
  } catch (e) {
    return res.status(500).json({ error: e && e.message ? e.message : 'Server error' });
  }
});

app.patch('/api/payments/:id/reject', requireAdmin, async (req, res) => {
  const paymentId = req.params.id;
  const { error } = await supabaseAdmin
    .from('payments')
    .update({ status: 'rejected' })
    .eq('id', paymentId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ paymentId });
});

app.get('/api/payouts', requireAdmin, async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ payouts: data || [] });
});

app.patch('/api/payouts/:id/paid', requireAdmin, async (req, res) => {
  const payoutId = req.params.id;
  const paidDate = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('payouts')
    .update({ status: 'paid', paid_date: paidDate })
    .eq('id', payoutId)
    .select('*')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ payout: data });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
