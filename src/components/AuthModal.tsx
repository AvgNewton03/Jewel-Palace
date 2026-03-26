"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Loader2, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult,
  fetchSignInMethodsForEmail,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "@/lib/firebase";

type AuthStep = "input" | "email-login" | "email-signup" | "phone-verify" | "unverified";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, firebaseUser } = useAuth();
  
  const [step, setStep] = useState<AuthStep>("input");
  const [inputVal, setInputVal] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically close modal if logged in successfully
    if (firebaseUser?.emailVerified !== false && isAuthModalOpen) {
      handleClose();
    }
  }, [firebaseUser, isAuthModalOpen]);

  useEffect(() => {
    return () => {
      // Clean up recaptcha strictly on the client side
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const handleClose = () => {
    closeAuthModal();
    // Reset state after animation
    setTimeout(() => {
      setStep("input");
      setInputVal("");
      setPassword("");
      setName("");
      setOtp("");
      setConfirmationResult(null);
      setError("");
      setMessage("");
    }, 300);
  };

  // Handle reCAPTCHA for phone auth safely
  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    if (!inputVal) return;

    setLoading(true);
    
    // Smart Input Detection
    const isEmail = inputVal.includes('@');

    try {
      if (isEmail) {
        // Auto-Routing for Email
        const methods = await fetchSignInMethodsForEmail(auth, inputVal);
        if (methods.length > 0) {
          setStep("email-login");
        } else {
          setStep("email-signup");
        }
      } else {
        // Treat as phone number
        setStep("phone-verify");
        // We do NOT auto-send OTP here, letting the user enter their name if they are new
        // and confirm the number before sending.
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify input.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, inputVal, password);
      // AuthContext will handle checking emailVerified and Syncing via onAuthStateChanged
      if (!userCredential.user.emailVerified) {
        setStep("unverified");
        // Context will automatically sign them out
      }
    } catch (err: any) {
      setError("Invalid password or account does not exist.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, inputVal, password);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      try {
        // We sync name explicitly because context syncWithBackend doesn't take Name.
        const idToken = await userCredential.user.getIdToken();
        await fetch(`${API_BASE}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ name })
        });
      } catch (e) {
        console.error("Initial Name sync failed", e);
      }

      await sendEmailVerification(userCredential.user);
      setStep("unverified");
      
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Ensure phone is in E.164 format e.g., +919876543210
      const formattedPhone = inputVal.startsWith("+") ? inputVal : `+91${inputVal}`; 
      const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confResult);
      setMessage(`OTP sent to ${formattedPhone}`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
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
      
      // If it's a new user and they gave a Name, we sync it
      if (name) {
        const idToken = await result.user.getIdToken();
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        await fetch(`${API_BASE}/api/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ name })
        }).catch(e => console.error(e));
      }
      
      // onAuthStateChanged in AuthContext will handle the standard sync & state update
    } catch (err: any) {
      setError("Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {step !== "input" && step !== "unverified" && (
           <button 
             onClick={() => { setStep("input"); setError(""); setMessage(""); setConfirmationResult(null); }}
             className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors flex items-center text-sm z-10"
           >
             <ChevronLeft className="w-4 h-4 mr-1" /> Back
           </button>
        )}
        
        <div className="p-8 pt-12">
          <h2 className="text-2xl font-serif text-brand-maroon text-center mb-6 tracking-wide">
            {step === "input" && "Welcome to Jewel Palace"}
            {step === "email-login" && "Sign In"}
            {step === "email-signup" && "Create Account"}
            {step === "phone-verify" && "Verify Phone Number"}
            {step === "unverified" && "Check Your Email"}
          </h2>

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

          {step === "input" && (
            <form onSubmit={handleInputSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 font-medium">Email or Phone Number</label>
                <div className="relative">
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
              </div>
              <button
                type="submit"
                disabled={loading || !inputVal.trim()}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center group cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          )}

          {step === "email-login" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 text-center">
                Logging in as <span className="font-semibold text-gray-900">{inputVal}</span>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
            </form>
          )}

          {step === "email-signup" && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 text-center">
                Creating account for <span className="font-semibold text-gray-900">{inputVal}</span>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
              </button>
            </form>
          )}

          {step === "phone-verify" && (
            <div className="space-y-5">
              {!confirmationResult ? (
                <form onSubmit={handlePhoneSendOtp} className="space-y-4">
                  <div className="text-sm text-gray-600 mb-2 text-center">
                    Using <span className="font-semibold text-gray-900">{inputVal}</span>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name (If new user)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded px-4 py-3 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div id="recaptcha-container" className="flex justify-center my-2"></div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePhoneVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-center text-gray-500 mb-2 font-medium">Enter 6-digit OTP</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      className="w-full border border-gray-200 rounded px-4 py-3 text-lg focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none text-center tracking-[0.5em] font-medium transition-all"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      placeholder="------"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center mt-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {step === "unverified" && (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
              <p className="text-gray-600">
                A verification link has been sent to <strong>{inputVal}</strong>.
              </p>
              <p className="text-sm text-gray-500">
                Please check your inbox (and spam folder) to verify your account. You will not be able to log in until it is verified.
              </p>
              <button
                onClick={handleClose}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 rounded transition-all duration-300 mt-4"
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
