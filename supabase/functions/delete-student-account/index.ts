import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  RequestAuthError,
  requireAdminUser,
} from '../_shared/adminAuth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface DeleteStudentBody {
  student_id?: string;
  enrollment_request_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    try {
      await requireAdminUser(req);
    } catch (error) {
      if (error instanceof RequestAuthError) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: error.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Auth verification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as DeleteStudentBody;
    const studentId = body.student_id?.toString().trim();
    const enrollmentRequestId = body.enrollment_request_id?.toString().trim();

    if (!studentId && !enrollmentRequestId) {
      return new Response(
        JSON.stringify({ error: 'Either student_id or enrollment_request_id is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let deletedAuthUser = false;
    let deletedStudent = false;
    let deletedEnrollmentRequest = false;

    if (studentId) {
      const { data: student, error: studentErr } = await supabaseAdmin
        .from('students')
        .select('id, aadhar_number')
        .eq('id', studentId)
        .maybeSingle();

      if (studentErr) {
        return new Response(JSON.stringify({ error: studentErr.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!student) {
        return new Response(JSON.stringify({ error: 'Student not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: portalAccount } = await supabaseAdmin
        .from('student_portal_accounts')
        .select('auth_user_id')
        .eq('student_id', studentId)
        .maybeSingle();

      if (portalAccount?.auth_user_id) {
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
          portalAccount.auth_user_id
        );

        if (authDeleteError) {
          return new Response(
            JSON.stringify({
              error: `Failed to delete login credentials: ${authDeleteError.message}`,
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        deletedAuthUser = true;
      }

      const { error: studentDeleteErr } = await supabaseAdmin
        .from('students')
        .delete()
        .eq('id', studentId);

      if (studentDeleteErr) {
        return new Response(
          JSON.stringify({ error: `Failed to delete student: ${studentDeleteErr.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      deletedStudent = true;

      if (student.aadhar_number) {
        await supabaseAdmin
          .from('enrollment_requests')
          .delete()
          .eq('aadhar_number', student.aadhar_number);
      }
    }

    if (enrollmentRequestId) {
      const { error: requestDeleteErr } = await supabaseAdmin
        .from('enrollment_requests')
        .delete()
        .eq('id', enrollmentRequestId);

      if (requestDeleteErr) {
        return new Response(
          JSON.stringify({ error: `Failed to delete enrollment request: ${requestDeleteErr.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      deletedEnrollmentRequest = true;
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted_student: deletedStudent,
        deleted_login_credentials: deletedAuthUser,
        deleted_enrollment_request: deletedEnrollmentRequest,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
