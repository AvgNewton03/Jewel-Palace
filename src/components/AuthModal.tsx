"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Loader2,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Mail,
  Lock,
  User,
  AlertCircle,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type ModalMode = "signin" | "signup" | "forgot-password" | "unverified";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, firebaseUser } = useAuth();

  const [mode, setMode] = useState<ModalMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Close modal automatically if authenticated and email is verified
  useEffect(() => {
    if (firebaseUser && isAuthModalOpen) {
      const isPasswordUser = firebaseUser.providerData.some(
        (p) => p.providerId === "password"
      );
      const isUnverified = isPasswordUser && !firebaseUser.emailVerified;

      if (!isUnverified) {
        handleClose();
      }
    }
  }, [firebaseUser, isAuthModalOpen]);

  const resetFormState = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setError("");
    setMessage("");
  };

  const handleClose = () => {
    closeAuthModal();
    setTimeout(() => {
      setMode("signin");
      resetFormState();
    }, 250);
  };

  const validateEmail = (val: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  // Sign In with Firebase Email & Password
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      if (!userCredential.user.emailVerified) {
        setMode("unverified");
      } else {
        handleClose();
      }
    } catch (err: any) {
      const errorCode = err.code || "";
      if (
        errorCode === "auth/wrong-password" ||
        errorCode === "auth/invalid-credential" ||
        errorCode === "auth/user-not-found"
      ) {
        setError("Invalid email or password. Please try again.");
      } else if (errorCode === "auth/too-many-requests") {
        setError("Too many failed attempts. Please reset your password or try again later.");
      } else {
        setError(err.message || "Failed to sign in. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Account with Firebase Email & Password
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      // Update displayName in Firebase Auth profile
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: cleanName,
        });

        // Sync user to MongoDB backend
        try {
          const API_BASE =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const idToken = await userCredential.user.getIdToken();
          await fetch(`${API_BASE}/api/users/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
            body: JSON.stringify({ name: cleanName }),
          });
        } catch (syncErr) {
          console.error("Backend sync failed:", syncErr);
        }

        // Send Email Verification
        await sendEmailVerification(userCredential.user);
        setMode("unverified");
      }
    } catch (err: any) {
      const errorCode = err.code || "";
      if (errorCode === "auth/email-already-in-use") {
        setError("An account already exists with this email address. Please Sign In.");
      } else if (errorCode === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Send Password Reset Link
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setMessage(`A password reset link has been sent to ${cleanEmail}. Please check your inbox.`);
    } catch (err: any) {
      const errorCode = err.code || "";
      if (errorCode === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(err.message || "Failed to send password reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white dark:bg-[#1a1512] border border-gray-100 dark:border-[#32251d] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors z-10 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Back Button (For forgot password mode) */}
        {mode === "forgot-password" && (
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setMessage("");
            }}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center text-xs font-medium z-10 py-1.5 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-0.5" /> Back to Sign In
          </button>
        )}

        <div className="p-7 md:p-9 pt-12">
          {/* Header Title & Branding */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-[#f5f3f0] tracking-wide">
              {mode === "forgot-password"
                ? "Reset Password"
                : mode === "unverified"
                ? "Verify Email"
                : "Jewel Palace"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mode === "signin" && "Sign in to access your orders and wishlist"}
              {mode === "signup" && "Create your account for a seamless shopping experience"}
              {mode === "forgot-password" && "Enter your email to receive a password recovery link"}
              {mode === "unverified" && "Please verify your email address to continue"}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In vs Sign Up) */}
          {(mode === "signin" || mode === "signup") && (
            <div className="flex border-b border-gray-100 dark:border-white/5 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all text-center cursor-pointer relative ${
                  mode === "signin"
                    ? "text-brand-maroon dark:text-brand-gold"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Sign In
                {mode === "signin" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-maroon dark:bg-brand-gold rounded-full" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 pb-3 text-sm font-semibold transition-all text-center cursor-pointer relative ${
                  mode === "signup"
                    ? "text-brand-maroon dark:text-brand-gold"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Create Account
                {mode === "signup" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-maroon dark:bg-brand-gold rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="mb-5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 rounded-xl flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success Message Notice */}
          {message && !error && (
            <div className="mb-5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-xl flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="flex-1 leading-relaxed">{message}</span>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot-password");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs text-brand-maroon dark:text-brand-gold hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: SIGN UP (CREATE ACCOUNT) */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3.5" noValidate>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    autoComplete="name"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full bg-gray-50 dark:bg-[#261b15] border border-gray-200 dark:border-[#38281f] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-[#f5f3f0] placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-brand-maroon/20 dark:focus:ring-brand-gold/20 focus:border-brand-maroon dark:focus:border-brand-gold outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3.5 rounded-xl shadow-md transition-all duration-200 disabled:opacity-60 flex justify-center items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  "Send Password Reset Link"
                )}
              </button>
            </form>
          )}

          {/* MODE: UNVERIFIED EMAIL NOTICE */}
          {mode === "unverified" && (
            <div className="flex flex-col items-center text-center space-y-4 py-3 animate-fade-in">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center border border-green-200 dark:border-green-900/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-[#f5f3f0]">
                  Verification Link Sent
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                  We have sent a verification link to{" "}
                  <strong className="text-gray-900 dark:text-white">{email}</strong>.
                  Please check your inbox (and spam folder) and verify your email to log in.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-[#f5f3f0] font-medium py-3 rounded-xl transition-all text-sm cursor-pointer mt-2"
              >
                Got it, Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
