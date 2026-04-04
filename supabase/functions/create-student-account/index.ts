import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function validateHttpsUrl(value: string): string {
  const trimmed = value.trim();

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('redirect_to must be a valid URL');
  }

  if (parsed.protocol !== 'https:') {
    throw new Error('redirect_to must use HTTPS');
  }

  return parsed.toString();
}

function generateTemporaryPassword(length = 32): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const random = crypto.getRandomValues(new Uint32Array(length));
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += alphabet[random[i] % alphabet.length];
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify caller is admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check admin role
    const { data: roleData } = await supabaseClient.from('user_roles').select('id').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { student_id, login_id, redirect_to } = body;

    if (!student_id || typeof student_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid student_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate login_id format
    const sanitizedLoginId = (login_id || '').toString().trim();
    if (!sanitizedLoginId || sanitizedLoginId.length < 3 || sanitizedLoginId.length > 30) {
      return new Response(JSON.stringify({ error: 'Login ID must be 3-30 characters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const setupRedirectTo = redirect_to ? validateHttpsUrl(String(redirect_to)) : undefined;
    const temporaryPassword = generateTemporaryPassword();

    // Use service role to create auth user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Verify student exists
    const { data: student, error: studentErr } = await supabaseAdmin
      .from('students')
      .select('id, name')
      .eq('id', student_id)
      .maybeSingle();

    if (studentErr || !student) {
      return new Response(JSON.stringify({ error: 'Student not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if student already has a portal account
    const { data: existingAccount } = await supabaseAdmin
      .from('student_portal_accounts')
      .select('id')
      .eq('student_id', student_id)
      .maybeSingle();

    if (existingAccount) {
      return new Response(JSON.stringify({ error: 'Student already has a portal account' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const email = `${sanitizedLoginId.toLowerCase()}@student.gsai.app`;

    // Try to create auth user; if email already exists, reuse the orphaned auth user
    let authUserId: string;

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { role: 'student', login_id: sanitizedLoginId, require_password_setup: true },
    });

    if (authErr) {
      // Check if user already exists (orphaned auth user without portal account record)
      if (authErr.message?.includes('already been registered')) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users?.find((u: any) => u.email === email);
        if (existingUser) {
          // Update password and metadata for the existing orphaned user
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: temporaryPassword,
            user_metadata: { role: 'student', login_id: sanitizedLoginId, require_password_setup: true },
          });
          authUserId = existingUser.id;
        } else {
          return new Response(JSON.stringify({ error: 'User email conflict. Please try a different Login ID.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      } else {
        return new Response(JSON.stringify({ error: authErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      authUserId = authData.user.id;
    }

    // Create portal account record
    const { error: insertErr } = await supabaseAdmin.from('student_portal_accounts').insert({
      student_id,
      login_id: sanitizedLoginId.toLowerCase(),
      auth_user_id: authUserId,
    });

    if (insertErr) {
      // Only cleanup if we created a new user (not reused)
      if (authData?.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      }
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Add student role (ignore if already exists)
    await supabaseAdmin.from('user_roles').upsert({
      user_id: authUserId,
      role: 'student',
    }, { onConflict: 'user_id,role' });

    const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      ...(setupRedirectTo ? { options: { redirectTo: setupRedirectTo } } : {}),
    });

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('Failed to generate setup link:', linkErr);
      return new Response(JSON.stringify({ error: 'Failed to generate setup link' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, login_id: sanitizedLoginId, setup_link: linkData.properties.action_link }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
