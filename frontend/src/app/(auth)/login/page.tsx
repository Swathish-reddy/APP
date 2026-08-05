"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loginData = new URLSearchParams();
      loginData.append("username", email);
      loginData.append("password", password);
      
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginData,
      });
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid credentials");
      }
      
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-4 md:px-6 lg:px-4 md:px-8">
      {" "}
      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl">
        {" "}
        <div>
          {" "}
          <div className="flex justify-center">
            {" "}
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              {" "}
              <Activity className="h-8 w-8" />{" "}
            </div>{" "}
          </div>{" "}
          <h2 className="mt-6 text-center text-2xl md:text-3xl font-extrabold text-foreground font-display">
            {" "}
            Sign in to CogniVueX{" "}
          </h2>{" "}
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {" "}
            Or{""}{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:text-primary/80"
            >
              {" "}
              create a new account{" "}
            </Link>{" "}
          </p>{" "}
        </div>{" "}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {" "}
            {error}{" "}
          </div>
        )}{" "}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {" "}
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-foreground mb-1">
                {" "}
                Email address{" "}
              </label>{" "}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-card"
                placeholder="name@example.com"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-foreground mb-1">
                {" "}
                Password{" "}
              </label>{" "}
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-card"
                placeholder="••••••••"
              />{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {" "}
              {loading ? "Signing in..." : "Sign in"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
