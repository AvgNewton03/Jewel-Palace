"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Phone, Loader2 } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, firebaseUser } = useAuth();
  
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically close modal if logged in successfully
    if (firebaseUser && isAuthModalOpen) {
      closeAuthModal();
      // Reset state for next time
      setConfirmationResult(null);
      setOtp("");
      setError("");
    }
  }, [firebaseUser, isAuthModalOpen, closeAuthModal]);

  useEffect(() => {
    return () => {
      // Clean up recaptcha strictly on the client side
      if (typeof window !== "undefined" && window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Handle reCAPTCHA for phone auth safely
  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  };

  const syncUserSession = async (firebaseIdToken: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(
        `${API_BASE}/api/users/sync`,
        { name }, // Send name for registration
        { headers: { Authorization: `Bearer ${firebaseIdToken}` } }
      );
    } catch (e) {
      console.error("Backend sync failed immediately after login:", e);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      // Immediately make an Axios POST request to /api/users/sync
      const idToken = await userCredential.user.getIdToken();
      await syncUserSession(idToken);
      
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
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
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`; 
      const confResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confResult);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
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
      // Immediately make an Axios POST request to /api/users/sync
      const idToken = await result.user.getIdToken();
      await syncUserSession(idToken);
      
    } catch (err: any) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={closeAuthModal} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-serif text-brand-maroon text-center mb-6 tracking-wide">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === "email" ? "border-b-2 border-brand-maroon text-brand-maroon" : "text-gray-400 hover:text-gray-700"}`}
              onClick={() => { setTab("email"); setError(""); }}
            >
              <Mail className="w-4 h-4 inline-block mr-2" />
              Email
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium transition-colors ${tab === "phone" ? "border-b-2 border-brand-maroon text-brand-maroon" : "text-gray-400 hover:text-gray-700"}`}
              onClick={() => { setTab("phone"); setError(""); setConfirmationResult(null); }}
            >
              <Phone className="w-4 h-4 inline-block mr-2" />
              Phone OTP
            </button>
          </div>

          {error && (
            <div className="mb-5 text-sm font-medium text-red-600 bg-red-50/50 border border-red-100 p-3 rounded text-center">
              {error}
            </div>
          )}

          {tab === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full border border-gray-200 rounded px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center mt-2 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}
              </button>
            </form>
          )}

          {tab === "phone" && (
            <div>
              {!confirmationResult ? (
                <form onSubmit={handlePhoneSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Phone Number</label>
                    <div className="flex shadow-sm">
                      <span className="inline-flex items-center px-4 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 rounded-l text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        className="flex-1 w-full border border-gray-200 rounded-r px-4 py-2.5 text-sm focus:ring-1 focus:ring-brand-maroon focus:border-brand-maroon outline-none transition-all placeholder:text-gray-400"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                      />
                    </div>
                  </div>
                  <div id="recaptcha-container"></div>
                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePhoneVerifyOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-center text-gray-500 mb-2">Enter OTP sent to +91 {phone}</label>
                    <input
                      type="text"
                      required
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
                    className="w-full bg-brand-maroon hover:bg-brand-maroon/90 text-white font-medium py-3 rounded transition-all duration-300 disabled:opacity-70 flex justify-center items-center"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmationResult(null)}
                    className="w-full text-sm text-brand-maroon hover:text-brand-maroon/80 underline decoration-transparent hover:decoration-current transition-all"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {tab === "email" && (
            <div className="mt-6 text-center text-sm text-gray-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-maroon hover:text-brand-maroon/80 font-medium ml-1 underline transition-colors"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
