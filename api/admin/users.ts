import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function verifyAdmin(supabaseAdmin: ReturnType<typeof createClient>, token: string) {
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) return null;
  return user;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  // Extract admin token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  const admin = await verifyAdmin(supabaseAdmin, token);
  if (!admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(supabaseAdmin, req, res);
      case 'POST':
        return await handlePost(supabaseAdmin, req, res);
      case 'PUT':
        return await handlePut(supabaseAdmin, req, res);
      case 'DELETE':
        return await handleDelete(supabaseAdmin, req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Admin API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

// GET — list old Streamlit users or current users
async function handleGet(
  supabaseAdmin: ReturnType<typeof createClient>,
  req: VercelRequest,
  res: VercelResponse
) {
  const action = req.query.action as string;

  if (action === 'old-users') {
    // Query old Streamlit "users" table
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, analyses_limit, analyses_total_lifetime, total_purchases, total_spent_cents, created_at');

    if (error) {
      // Table might not exist — return empty gracefully
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return res.json({ users: [], note: 'Legacy users table not found' });
      }
      return res.status(500).json({ error: error.message });
    }
    return res.json({ users: data || [] });
  }

  // Default: return current user_profiles
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.json({ users: data || [] });
}

// POST — create a new user
async function handlePost(
  supabaseAdmin: ReturnType<typeof createClient>,
  req: VercelRequest,
  res: VercelResponse
) {
  const { email, password, username, credits, isAdmin } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    return res.status(400).json({ error: authError.message });
  }

  const userId = authData.user.id;

  // Insert profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      username: username || null,
      credits_remaining: credits ?? 3,
      credits_lifetime: credits ?? 0,
      is_admin: isAdmin ?? false,
    })
    .select()
    .single();

  if (profileError) {
    // Cleanup: delete auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId);
    return res.status(500).json({ error: profileError.message });
  }

  return res.json({ user: profile });
}

// PUT — update a user profile
async function handlePut(
  supabaseAdmin: ReturnType<typeof createClient>,
  req: VercelRequest,
  res: VercelResponse
) {
  const { userId, updates } = req.body;

  if (!userId || !updates) {
    return res.status(400).json({ error: 'userId and updates are required' });
  }

  // Only allow safe fields
  const allowed: Record<string, any> = {};
  if (updates.username !== undefined) allowed.username = updates.username;
  if (updates.credits_remaining !== undefined) allowed.credits_remaining = updates.credits_remaining;
  if (updates.is_admin !== undefined) allowed.is_admin = updates.is_admin;

  if (Object.keys(allowed).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(allowed)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ user: data });
}

// DELETE — delete a user (auth + profile cascade)
async function handleDelete(
  supabaseAdmin: ReturnType<typeof createClient>,
  req: VercelRequest,
  res: VercelResponse
) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ success: true });
}
