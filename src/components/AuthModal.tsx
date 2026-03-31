"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Loader2,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthStep =
  | "welcome"
  | "signin"
  | "signup"
  | "forgot-password"
  | "phone-verify"
  | "unverified";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, firebaseUser } = useAuth();

  const [step, setStep] = useState<AuthStep>("welcome");
  const [inputVal, setInputVal] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (firebaseUser && isAuthModalOpen) {
      const isPasswordUser = firebaseUser.providerData.some(
        (p) => p.providerId === "password",
      );
      const isUnverifiedPasswordUser =
        isPasswordUser && !firebaseUser.emailVerified;

      if (!isUnverifiedPasswordUser) {
        handleClose();
      }
    }
  }, [firebaseUser, isAuthModalOpen]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleClose = () => {
    closeAuthModal();
    // Clear recaptcha so it doesn't break on reopening
    if (typeof window !== "undefined" && window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    setTimeout(() => {
      setStep("welcome");
      setInputVal("");
      setPassword("");
      setName("");
      setOtp("");
      setConfirmationResult(null);
      setError("");
      setMessage("");
    }, 300);
  };

  const setupRecaptcha = () => {
    if (typeof window === "undefined") return;

    // If a verifier exists but the container is empty/stale, clear it to prevent the 400 error
    if (
      window.recaptchaVerifier &&
      !document.getElementById("recaptcha-container")?.innerHTML
    ) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // Solved successfully
          },
          "expired-callback": () => {
            if (window.recaptchaVerifier) {
              window.recaptchaVerifier.clear();
              window.recaptchaVerifier = null;
            }
          },
        },
      );
    }
  };

  const clearRecaptchaOnError = () => {
    if (typeof window !== "undefined" && window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!inputVal) return;
    setLoading(true);

    const isEmail = inputVal.includes("@");

    try {
      if (isEmail) {
        if (!password) {
          setError("Password required");
          setLoading(false);
          return;
        }
        const userCredential = await signInWithEmailAndPassword(
          auth,
          inputVal,
          password,
        );
        if (!userCredential.user.emailVerified) {
          setStep("unverified");
        }
      } else {
        setupRecaptcha();
        const formattedPhone = inputVal.startsWith("+")
          ? inputVal
          : `+91${inputVal}`;
        const confResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          window.recaptchaVerifier,
        );
        setConfirmationResult(confResult);
        setStep("phone-verify");
        setMessage(`OTP sent to ${formattedPhone}`);
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
      clearRecaptchaOnError();
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!inputVal) return;
    setLoading(true);

    const isEmail = inputVal.includes("@");

    try {
      if (isEmail) {
        if (!password) {
          setError("Password required");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          inputVal,
          password,
        );

        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const idToken = await userCredential.user.getIdToken();
        await fetch(`${API_BASE}/api/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name }),
        }).catch(console.error);

        await sendEmailVerification(userCredential.user);
        setStep("unverified");
      } else {
        setupRecaptcha();
        const formattedPhone = inputVal.startsWith("+")
          ? inputVal
          : `+91${inputVal}`;
        const confResult = await signInWithPhoneNumber(
          auth,
          formattedPhone,
          window.recaptchaVerifier,
        );
        setConfirmationResult(confResult);
        setStep("phone-verify");
        setMessage(`OTP sent to ${formattedPhone}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      clearRecaptchaOnError();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!inputVal) return;

    if (!inputVal.includes("@")) {
      setError(
        "Please enter your email to reset your password. Phone numbers use OTP and don't require passwords.",
      );
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, inputVal);
      setMessage("A password reset link has been sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setError("");
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);

      if (name) {
        const idToken = await result.user.getIdToken();
        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${API_BASE}/api/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name }),
        }).catch((e) => console.error(e));
      }
    } catch (err: any) {
      setError("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const resetFormState = () => {
    setInputVal("");
    setPassword("");
    setName("");
    setOtp("");
    setError("");
    setMessage("");
    setConfirmationResult(null);
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step !== "welcome" && step !== "unverified" && (
          <button
            onClick={() => {
              setStep("welcome");
              resetFormState();
            }}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors flex items-center text-sm z-10"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
        )}

        <div className="p-8 pt-12">
          {/* Persistently kept in DOM to prevent reCAPTCHA element removed errors */}
          <div id="recaptcha-container" className="flex justify-center"></div>

          {step === "welcome" && (
            <>
              <h2 className="text-2xl font-serif text-brand-maroon text-center mb-8 tracking-wide">
                Welcome to Jewel Palace
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setStep("signin");
                    resetFormState();
                  }}
                  className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 shadow-md flex justify-center items-center group cursor-pointer"
                >
                  Sign In{" "}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    setStep("signup");
                    resetFormState();
                  }}
                  className="w-full border border-brand-maroon text-brand-maroon hover:bg-brand-maroon/5 font-medium py-3 rounded transition-all duration-300 cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}

          {step !== "welcome" && (
            <h2 className="text-2xl font-serif text-brand-maroon text-center mb-6 tracking-wide">
              {step === "signin" && "Sign In"}
              {step === "signup" && "Create Account"}
              {step === "forgot-password" && "Reset Password"}
              {step === "phone-verify" && "Verify Phone Number"}
              {step === "unverified" && "Check Your Email"}
            </h2>
          )}

          {error && (
            <div className="mb-5 text-sm font-medium text-red-600 bg-red-50/50 border border-red-100 p-3 rounded text-center break-words">
              {error}
            </div>
          )}

          {message && !error && (
            <div className="mb-5 text-sm font-medium text-green-600 bg-green-50/50 border border-green-100 p-3 rounded text-center">
              {message}
            </div>
          )}

          {step === "signin" && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                />
              </div>

              {(!inputVal || inputVal.includes("@")) && (
                <div>
                  <div className="flex justify-between mb-1 items-end">
                    <label className="block text-xs uppercase tracking-wider text-gray-500 font-medium">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep("forgot-password");
                        setError("");
                        setMessage("");
                      }}
                      className="text-xs text-brand-maroon hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required={inputVal.includes("@")}
                    className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center group cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {!inputVal || inputVal.includes("@")
                      ? "Sign In"
                      : "Send OTP"}{" "}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="name@example.com or 9876543210"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              {(!inputVal || inputVal.includes("@")) && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    required={inputVal.includes("@")}
                    minLength={6}
                    className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Min 6 chars)"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !inputVal.trim() || !name.trim()}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center group cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {!inputVal || inputVal.includes("@")
                      ? "Create Account"
                      : "Send OTP"}{" "}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === "forgot-password" && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 text-center">
                Enter your email address to receive a password reset link.
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          {step === "phone-verify" && (
            <form onSubmit={handlePhoneVerifyOtp} className="space-y-4">
              <div className="text-sm text-gray-600 mb-2 text-center">
                OTP sent to{" "}
                <span className="font-semibold text-gray-900">{inputVal}</span>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-center text-gray-500 mb-2 font-medium">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-lg focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none text-center tracking-[0.5em] font-medium transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  placeholder="------"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center mt-4"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </form>
          )}

          {step === "unverified" && (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
              <p className="text-gray-600">
                A verification link has been sent to <strong>{inputVal}</strong>
                .
              </p>
              <p className="text-sm text-gray-500">
                Please check your inbox (and spam folder) to verify your
                account. You will not be able to log in until it is verified.
              </p>
              <button
                onClick={handleClose}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 rounded transition-all duration-300 mt-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
