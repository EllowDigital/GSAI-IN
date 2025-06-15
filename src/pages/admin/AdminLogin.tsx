
import React, { useState } from "react";
import { useAdminAuth } from "./AdminAuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const { signIn, isLoading, isAdmin } = useAdminAuth();
  const [email, setEmail] = useState("ghatakgsai@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    // If already admin, redirect to dashboard. (no need to ever show login when logged in)
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await signIn(email.trim(), password); // signIn already triggers admin/dashboard redirect
  };

  return (
    <div className="h-screen w-full bg-gradient-to-b from-yellow-100 to-yellow-50 flex flex-col items-center justify-center font-montserrat">
      <form
        className="bg-white rounded-2xl shadow-2xl p-8 px-6 md:px-10 max-w-md w-full flex flex-col gap-6 relative border border-yellow-200 animate-fade-in"
        style={{ boxShadow: "0 4px 24px 0 rgba(245, 158, 66, 0.14)" }}
        onSubmit={handleSubmit}
      >
        {/* Logo at Top */}
        <div className="flex flex-col items-center justify-center mb-3 mt-1">
          <img src="/favicon.ico" alt="Logo" className="w-12 h-12 rounded-full shadow mb-2" />
          <h2 className="font-bold text-2xl text-yellow-400 text-center tracking-widest">
            GSAI Admin
          </h2>
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1 text-gray-700">
            Admin Email
          </label>
          <Input
            id="email"
            type="email"
            disabled
            value={email}
            autoComplete="username"
            className="rounded-xl bg-gray-50 border-yellow-200 text-base"
          />
        </div>
        <div>
          <label htmlFor="password" className="block font-semibold mb-1 text-gray-700">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            minLength={6}
            className="rounded-xl bg-gray-50 border-yellow-200 text-base"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <Button
          variant="default"
          className="mt-1 rounded-xl h-12 text-lg flex gap-2 items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white font-bold shadow"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
