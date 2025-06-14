
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
    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await signIn(email.trim(), password);
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center font-montserrat">
      <form
        className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full flex flex-col gap-5"
        style={{ boxShadow: "0 2px 20px rgba(31,41,55,.07)" }}
        onSubmit={handleSubmit}
      >
        <h2 className="font-bold text-2xl mb-2 text-yellow-400 text-center">Admin Login</h2>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1 text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            disabled
            value={email}
            autoComplete="username"
            className="rounded-xl"
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
            className="rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button
          variant="default"
          className="mt-2 rounded-xl h-12 text-lg flex gap-2 items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
