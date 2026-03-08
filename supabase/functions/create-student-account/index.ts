import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
    const { student_id, login_id, password } = body;

    if (!student_id || typeof student_id !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid student_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate login_id format
    const sanitizedLoginId = (login_id || '').toString().trim();
    if (!sanitizedLoginId || sanitizedLoginId.length < 3 || sanitizedLoginId.length > 30) {
      return new Response(JSON.stringify({ error: 'Login ID must be 3-30 characters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate password
    const sanitizedPassword = (password || '').toString().trim();
    if (sanitizedPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

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

    // Create auth user
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: sanitizedPassword,
      email_confirm: true,
      user_metadata: { role: 'student', login_id: sanitizedLoginId },
    });

    if (authErr) {
      return new Response(JSON.stringify({ error: authErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Create portal account record
    const { error: insertErr } = await supabaseAdmin.from('student_portal_accounts').insert({
      student_id,
      login_id: sanitizedLoginId.toLowerCase(),
      auth_user_id: authData.user.id,
    });

    if (insertErr) {
      // Cleanup: delete the auth user if record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Add student role
    await supabaseAdmin.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'student',
    });

    return new Response(JSON.stringify({ success: true, login_id: sanitizedLoginId }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
