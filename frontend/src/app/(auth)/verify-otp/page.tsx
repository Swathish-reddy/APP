"use client";
import { BASE_URL } from "../../../services/api";

import { Suspense, useState, useRef, useEffect, KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

function VerifyOTPContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newOtp = [...otp];
    
    pastedData.forEach((char, index) => {
      if (!isNaN(Number(char)) && index < 6) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    
    // Focus last filled input or end
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = `${BASE_URL}/auth/verify-otp`;

      let response;
      try {
        response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpValue }),
        });
      } catch (networkError: any) {
        if (
          process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
          networkError.message.includes("Failed to fetch") ||
          networkError.message.includes("NetworkError")
        ) {
          if (email === "admin@cognivuex.com" && otpValue === "123456") {
             setSuccess("OTP verified successfully! (Demo Mode)");
             setTimeout(() => {
               router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpValue)}`);
             }, 1000);
             return;
          } else {
             throw new Error("Invalid OTP (Offline/Demo Mode: use 123456)");
          }
        }
        throw networkError;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "Invalid OTP");
      }

      setSuccess("OTP verified successfully!");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpValue)}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
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
             setSuccess("New OTP sent successfully! (Demo Mode)");
             setTimer(600);
             setOtp(["", "", "", "", "", ""]);
             inputRefs.current[0]?.focus();
             return;
          } else {
             throw new Error("Failed to resend OTP (Offline/Demo Mode)");
          }
        }
        throw networkError;
      }

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      setSuccess("New OTP sent successfully!");
      setTimer(600);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-4 md:px-4 md:px-6 lg:px-4 md:px-4 md:px-8">
      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-2xl">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl md:text-2xl md:text-2xl md:text-3xl font-extrabold text-foreground font-display">
            Verify Email
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter the 6-digit verification code sent to <br />
            <span className="font-medium text-foreground">{email}</span>
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

        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
              />
            ))}
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {timer > 0 ? (
              <p>Code expires in: <span className="font-medium text-foreground">{formatTime(timer)}</span></p>
            ) : (
              <p className="text-destructive">Code expired</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6 || timer === 0}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn't receive the code? </span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={timer > 0}
              className="font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
