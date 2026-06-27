// app/components/Login.tsx
'use client';

import { useState } from 'react';
import { Smartphone, ArrowRight, Shield, KeyRound } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/common/input-otp';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/Providers/LanguageProvider';

interface LoginProps {
  onLoginSuccess?: () => void;
  onSwitchToAdmin?: () => void;
}

export function LoginForm({ onLoginSuccess: _onLoginSuccess, onSwitchToAdmin }: LoginProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') {
        
        router.push(`/${language}/dashboard`);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    }, 1500);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    // Simulate resend OTP
    setTimeout(() => {
      setIsLoading(false);
      alert('OTP resent successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-red">
      
      {/* Content Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Main Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#63a9c3] p-8 text-center relative overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">

                  {/* Add your logo here */}
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm text-blue-600 font-bold">
                       <Image
                        src="/akolaLogo.png"
                        alt="Logo"
                        width={50}
                        height={50}
                        className="w-full h-full object-contain p-0.5"
                      />
                      
                    </span>
                  </div>
                </div>
                <h1 className="text-2xl text-gray-800 mb-1">Akola Municipal Corporation</h1>
                <p className="text-gray-700 text-sm">Right to Service (RTS) Act 2015</p>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Only show Welcome section on phone step, hide on OTP step */}
              {step === 'phone' && (
                <div className="text-center mb-8">
                  <h2 className="text-2xl text-gray-800 mb-2">Welcome to RTS Portal</h2>
                  <p className="text-gray-600 text-sm">Sign in to access municipal services</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 'phone' ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Phone Input */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#5B9AB7]" />
                        Mobile Number
                      </label>
                      <Input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPhoneNumber(value);
                          setError('');
                        }}
                        placeholder="Enter 10-digit mobile number"
                        className="h-12 text-base border-2 border-gray-400 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20"
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Send OTP Button */}
                    <Button
                      onClick={handleSendOtp}
                      disabled={isLoading || phoneNumber.length !== 10}
                      className="w-full h-12 bg-[#5B9AB7] hover:bg-[#4A8AA6] text-white shadow-lg text-base transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending OTP...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Send OTP
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Success Message */}
                    <div className="bg-gradient-to-r from-[#5B9AB7]/10 to-[#5B9AB7]/20 border border-[#5B9AB7]/30 rounded-lg p-4 text-center">
                      <div className="w-12 h-12 bg-[#5B9AB7]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Smartphone className="w-6 h-6 text-[#5B9AB7]" />
                      </div>
                      <p className="text-[#4A8AA6] mb-1">OTP Sent Successfully!</p>
                      <p className="text-[#5B9AB7] text-sm">
                        Enter the OTP sent to <span className="font-mono">+91 {phoneNumber}</span>
                      </p>
                    </div>

                    {/* OTP Input */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-[#5B9AB7]" />
                        Enter OTP
                      </label>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={otp}
                          onChange={(value) => {
                            setOtp(value);
                            setError('');
                          }}
                          disabled={isLoading}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                            <InputOTPSlot index={1} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                            <InputOTPSlot index={2} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                            <InputOTPSlot index={3} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                            <InputOTPSlot index={4} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                            <InputOTPSlot index={5} className="w-12 h-14 text-xl border-2 focus:border-[#5B9AB7] focus:ring-2 focus:ring-[#5B9AB7]/20" />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <p className="text-center text-xs text-gray-500 mt-2">
                        Demo OTP: <span className="font-mono font-semibold">123456</span>
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Verify Button */}
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isLoading || otp.length !== 6}
                      className="w-full h-12 bg-[#5B9AB7] hover:bg-[#4A8AA6] text-white shadow-lg text-base transition-colors"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Verify & login 
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>

                    {/* Resend OTP */}
                    <div className="text-center">
                      <button
                        onClick={handleResendOtp}
                        disabled={isLoading}
                        className="text-sm text-[#5B9AB7] hover:text-[#4A8AA6] hover:underline disabled:text-gray-400"
                      >
                        Resend OTP
                      </button>
                    </div>

                    {/* Back to Phone */}
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setStep('phone');
                          setOtp('');
                          setError('');
                        }}
                        disabled={isLoading}
                        className="text-sm text-gray-600 hover:text-gray-800 hover:underline disabled:text-gray-400"
                      >
                        ← Change Phone Number
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Admin Login Link */}
              {step === 'phone' && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center space-y-3">
                    <p className="text-sm text-gray-600">or continue with</p>
                    <Button
                      onClick={onSwitchToAdmin}
                      variant="outline"
                      className="w-full h-11 border-2 border-[#5B9AB7] hover:border-[#4A8AA6] hover:bg-[#5B9AB7]/10 text-[#5B9AB7]"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Login
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}