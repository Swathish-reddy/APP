"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: formData.fullName,
            email: formData.email,
            password: formData.password,
          }),
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Registration failed");
      }
      const loginData = new URLSearchParams();
      loginData.append("username", formData.email);
      loginData.append("password", formData.password);
      const loginResponse = await fetch(
        "http://localhost:8000/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: loginData,
        },
      );
      if (loginResponse.ok) {
        const tokenData = await loginResponse.json();
        localStorage.setItem("token", tokenData.access_token);
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground font-display">
            {" "}
            Create an account{" "}
          </h2>{" "}
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {" "}
            Already have an account?{""}{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              {" "}
              Sign in{" "}
            </Link>{" "}
          </p>{" "}
        </div>{" "}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            {" "}
            {error}{" "}
          </div>
        )}{" "}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {" "}
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-foreground mb-1">
                {" "}
                Full Name{" "}
              </label>{" "}
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="Dr. John Doe"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className="block text-sm font-medium text-foreground mb-1">
                {" "}
                Email address{" "}
              </label>{" "}
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="appearance-none relative block w-full px-3 py-2.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:z-10 sm:text-sm bg-white"
                placeholder="••••••••"
              />{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {" "}
              {loading ? "Creating account..." : "Sign up"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
}
