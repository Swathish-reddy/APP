import { BASE_URL } from "../../../services/api";
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = `${BASE_URL}/auth/forgot-password`;
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (networkError: any) {
        if (
          process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
          networkError.message.includes("Failed to fetch") ||
          networkError.message.includes("NetworkError")
        ) {
          if (email === "admin@cognivuex.com") {
             setSuccess("OTP sent successfully! Please check your email. (Demo Mode)");
             setTimeout(() => {
               router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
             }, 1500);
             return;
          } else {
             throw new Error("Failed to send reset email (Offline/Demo Mode)");
          }
        }
        throw networkError;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to send reset email");
      }

      setSuccess("OTP sent successfully! Please check your email.");
      // Redirect to OTP verification page after a short delay
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-4 md:px-4 md:px-6 lg:px-4 md:px-4 md:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <KeyRound className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground font-display">
            Forgot Password
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your registered email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-card"
                placeholder="name@example.com"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
