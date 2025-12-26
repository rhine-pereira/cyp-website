'use client';

import React, { useState, useRef, useEffect } from 'react';
import { auth } from '@/app/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function FirebasePhoneAuth({
  onSuccess,
}: {
  onSuccess?: (user: any) => void;
}) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaId = 'recaptcha-container';

  // Initialize reCAPTCHA ONCE
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        recaptchaId,
        {
          size: 'invisible',
          callback: () => {},
        }
      );

      window.recaptchaVerifier.render().catch(() => {});
    }

    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Enforce E.164 format
    if (!/^\+\d{10,15}$/.test(phone)) {
      setError(
        'Enter phone in E.164 format (e.g. +919876543210)'
      );
      return;
    }

    setLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        throw new Error('reCAPTCHA not initialized');
      }

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      confirmationResultRef.current = result;
      setStep('otp');
    } catch (err) {
      setError((err as any)?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!confirmationResultRef.current) {
        throw new Error('OTP session expired');
      }

      const result =
        await confirmationResultRef.current.confirm(otp);

      onSuccess?.(result.user);

      // Reset
      setPhone('');
      setOtp('');
      setStep('phone');
    } catch (err) {
      setError((err as any)?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <div id={recaptchaId} />

      {step === 'phone' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <h2 className="text-lg font-bold">
            Sign in with Phone
          </h2>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            className="w-full border p-2 rounded text-slate-900 placeholder-slate-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Sending OTP…' : 'Send OTP'}
          </button>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <h2 className="text-lg font-bold">Enter OTP</h2>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            className="w-full border p-2 rounded text-slate-900 placeholder-slate-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Verifying…' : 'Verify OTP'}
          </button>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
