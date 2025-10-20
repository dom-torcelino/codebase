"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // 'login' | 'mfa'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (res.mfaRequired) {
        setTempToken(res.tempToken);
        setStep("mfa");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitMfa = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/mfa/validate", {
        method: "POST",
        body: JSON.stringify({ code: otp, tempToken }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
    setLoading(false);
  };

  return (
    <main className="min-h-dvh grid grid-cols-1">
      <div className="flex items-center justify-center p-6 md:p-10 bg-[#F9FAFB]">
        <div className="w-full max-w-[420px] rounded-2xl bg-white shadow-lg border border-gray-100">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {step === "login" ? "Sign in" : "Enter your 6-digit code"}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {step === "login"
                  ? "Use email and password, or Google."
                  : "Open your authenticator app and enter the code."}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm p-3 border border-red-200">
                {error}
              </div>
            )}

            {step === "login" ? (
              <form className="grid gap-4" onSubmit={submitLogin}>
                <div className="grid gap-2">
                  <label className="text-sm text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full text-gray-700 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3FBAC2] focus:border-transparent"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-gray-700">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3FBAC2] focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-xl bg-[#1F7A8C] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#14505C] active:opacity-90 disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            ) : (
              <form className="grid gap-4" onSubmit={submitMfa}>
                <div className="grid gap-2">
                  <label className="text-sm text-gray-700">6-digit code</label>
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="tracking-widest text-center text-lg w-full rounded-xl border border-gray-200 px-3 py-3 outline-none focus:ring-2 focus:ring-[#3FBAC2] focus:border-transparent"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="mt-2 w-full rounded-xl bg-[#1F7A8C] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#14505C] active:opacity-90 disabled:opacity-70"
                >
                  {loading ? "Verifying..." : "Verify code"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-xs text-gray-500 hover:underline justify-self-center mt-1"
                >
                  Use a different account
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-xs text-black-400">
              <div className="h-px flex-1 bg-gray-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium bg-white hover:bg-gray-50 active:bg-gray-100 disabled:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.9 16 19.1 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.3 0 10.2-2 13.9-5.3l-6.4-5.4C29.4 35.7 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-7.8l-6.5 5C9 39.3 15.9 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.3-3.6 5.7-6.8 7.1l.1.1 6.4 5.4C37.6 39 40 33.3 40 27c0-2.2-.2-3.8-.4-4.7z"/>
              </svg>
              <span className="text-gray-800">{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
              <Link href="#" className="hover:underline">
                Forgot password
              </Link>
              <Link href="#" className="hover:underline">
                Privacy & Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
