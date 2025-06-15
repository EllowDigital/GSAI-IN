import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function FeeRLSTest() {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [adminCheck, setAdminCheck] = useState<boolean | null>(null);
  const [insertStatus, setInsertStatus] = useState<string | null>(null);
  const [feeInsertLoading, setFeeInsertLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState("");
  const [sessionObj, setSessionObj] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // On mount, fetch current session and check admin_users presence
  useEffect(() => {
    const getSessionDetails = async () => {
      setSessionLoading(true);
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionObj(session);
      setSessionEmail(session?.user?.email ?? null);
      console.log("👤 Supabase Session Object:", session);
      if (error) console.error("❌ Session error:", error.message);

      if (session?.user?.email) {
        const { data: adminCheckRows, error: adminError } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", session.user.email);

        setAdminCheck((adminCheckRows && adminCheckRows.length > 0) || false);
        console.log(
          "🛡️ Found in admin_users:",
          adminCheckRows && adminCheckRows.length > 0,
        );
        if (adminError) console.error("❌ Admin check error:", adminError.message);
      } else {
        setAdminCheck(null);
      }
      setSessionLoading(false);
    };

    getSessionDetails();
  }, []);

  // Test inserting a new minimal fee row for debugging
  const handleTestInsert = async () => {
    if (sessionLoading) {
      setInsertStatus("Session is still loading. Please wait and try again.");
      return;
    }
    if (!sessionObj) {
      setInsertStatus("No valid session found. Please log in again.");
      return;
    }
    setFeeInsertLoading(true);
    setInsertStatus(null);
    try {
      // Debug print: Access Token
      console.log("🔑 Access token used for this request:", sessionObj.access_token);
      // We need a valid student id in your students table! We'll grab the first available one.
      const { data: students, error: studentErr } = await supabase
        .from("students")
        .select("id")
        .limit(1);
      if (studentErr || !students || students.length === 0) {
        setInsertStatus("❌ Could not fetch a test student for fee insert.");
        setFeeInsertLoading(false);
        return;
      }
      const student_id = students[0].id;
      // Use current month/year
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      // Try inserting a test fee
      const { error: insertErr } = await supabase.from("fees").insert([
        {
          student_id,
          month,
          year,
          monthly_fee: 111,
          paid_amount: 0,
          balance_due: 111,
          notes: "Test insert (can delete)",
          status: "unpaid",
        },
      ]);
      if (insertErr) {
        if (
          insertErr.message.toLowerCase().includes("row-level security") ||
          insertErr.message.toLowerCase().includes("rls")
        ) {
          setInsertStatus(
            "❌ RLS Error: Your email is not authorized for fees table!\n"
            + "Check you are logged in as the admin and your email exists in admin_users table.\n\n"
            + `DEBUG: Session email: ${sessionObj.user?.email}\nAccess token: ${sessionObj.access_token?.slice(0,30)}...`
          );
          toast({
            title: "❌ RLS Error",
            description: "Not authorized. Check your login and admin_users table.",
            variant: "destructive",
          });
        } else {
          setInsertStatus(`❌ Insert error: ${insertErr.message}`);
        }
        setFeeInsertLoading(false);
        return;
      }
      setInsertStatus("✅ Success! Fee was inserted (you can delete it).");
      toast({ title: "Insert OK", description: "Fee inserted successfully!" });
    } catch (err: any) {
      setInsertStatus(`Unexpected error: ${err.message}`);
      toast({
        title: "Error",
        description: err.message || "Unknown error.",
        variant: "destructive",
      });
    }
    setFeeInsertLoading(false);
  };

  // UI to allow manual check for another email in admin_users
  const handleAdminEmailCheck = async () => {
    if (!customEmail) return;
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", customEmail.trim());
    if (error) {
      toast({
        title: "Error querying admin_users",
        description: error.message,
        variant: "destructive",
      });
    } else if (data && data.length > 0) {
      toast({ title: "Admin found!", description: customEmail });
    } else {
      toast({
        title: "Not found",
        description: "No record for " + customEmail,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded-xl flex flex-col gap-5">
      <h2 className="text-xl font-bold text-yellow-500">Fees Table RLS Auth Test</h2>
      <div className="bg-gray-50 p-3 rounded text-xs">
        <div>
          <b>Session email:</b>{" "}
          <span className={sessionEmail ? "text-green-700" : "text-red-600"}>
            {sessionLoading ? "Loading…" : (sessionEmail || "❌ None")}
          </span>
        </div>
        <div>
          <b>In admin_users table:</b>{" "}
          <span
            className={
              adminCheck == null
                ? "text-gray-500"
                : adminCheck
                  ? "text-green-700"
                  : "text-red-600"
            }
          >
            {adminCheck == null ? "…" : adminCheck ? "✅ Yes" : "❌ No"}
          </span>
        </div>
      </div>
      <div>
        <Button
          type="button"
          onClick={handleTestInsert}
          disabled={sessionLoading || !sessionEmail || !adminCheck || feeInsertLoading}
        >
          {feeInsertLoading ? "Inserting (wait…)" : "Test Insert Fee (RLS check)"}
        </Button>
        {insertStatus ? (
          <div className="mt-2 text-xs whitespace-pre-line">{insertStatus}</div>
        ) : null}
      </div>
      <div className="pt-2 border-t">
        <label className="text-xs font-semibold mb-1 block">Check admin_users by email</label>
        <div className="flex gap-2 items-center">
          <Input
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="eg: ghatakgsai@gmail.com"
            className="text-xs"
            style={{ width: "220px" }}
          />
          <Button variant="secondary" type="button" onClick={handleAdminEmailCheck}>
            Check
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-4">
        <b>Troubleshooting:</b> <br />
        <ul className="list-disc ml-6">
          <li>
            Make sure your email shows above <b>and</b> that it is found in the <b>admin_users</b> table.
          </li>
          <li>
            If you get RLS/authorization errors, check your <b>Supabase</b> Auth session and the <b>admin_users</b> table in the dashboard.
          </li>
          <li>
            You must use a <b>valid student_id</b> in fees (the test insert uses the first student found).
          </li>
        </ul>
      </div>
      <div className="mt-2 text-[10px] text-gray-400">
        <b>Session debug:</b>
        <pre>{sessionObj ? JSON.stringify(sessionObj, null, 2) : "No session"}</pre>
      </div>
    </div>
  );
}
