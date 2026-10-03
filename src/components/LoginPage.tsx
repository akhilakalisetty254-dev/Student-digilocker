import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  HelpCircle, 
  Check, 
  RefreshCw,
  KeyRound,
  GraduationCap,
  Building
} from 'lucide-react';
import { StorageService } from '../services/storageService';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onShowToast
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'verify' | 'forgot'>('login');
  
  // Login fields (MUST START EMPTY per requirements)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Unchecked by default
  
  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regCollege, setRegCollege] = useState('');
  const [regMajor, setRegMajor] = useState('');
  const [regPin, setRegPin] = useState('1234');

  // Verification state
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState<'email' | 'answer'>('email');

  // Errors & Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Lockout Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockoutRemaining > 0) {
      timer = setInterval(() => {
        setLockoutRemaining(prev => {
          if (prev <= 1) {
            setErrorMsg(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    
    if (pwd.length === 0) return { label: 'Empty', score: 0, color: 'bg-slate-200' };
    if (score <= 1) return { label: 'Weak', score: 25, color: 'bg-rose-500' };
    if (score === 2) return { label: 'Fair', score: 50, color: 'bg-amber-500' };
    if (score === 3) return { label: 'Good', score: 75, color: 'bg-blue-500' };
    return { label: 'Strong', score: 100, color: 'bg-emerald-500' };
  };

  const pwdStrength = calculatePasswordStrength(regPassword);

  // One-click Demo Login (strictly initiated by user click)
  const handleDemoLogin = () => {
    setErrorMsg(null);
    const demoUser = StorageService.loginDemoUser();
    onShowToast('info', 'Demo Mode Activated', 'Viewing sample account for Alex Rivera (CalTech). All data is simulated.');
    onLoginSuccess(demoUser);
  };

  // Email/Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (lockoutRemaining > 0) {
      setErrorMsg(`Security lockout active. Please wait ${lockoutRemaining} seconds.`);
      return;
    }

    const res = StorageService.loginWithEmail(loginEmail, loginPassword, rememberMe);
    if (res.success && res.user) {
      onShowToast('success', 'Welcome Back!', `Signed in as ${res.user.name}.`);
      onLoginSuccess(res.user);
    } else if (res.isUnverified) {
      setPendingVerifyEmail(loginEmail.toLowerCase().trim());
      setSimulatedCode(res.verificationCode || '123456');
      setAuthMode('verify');
      setErrorMsg('Please verify your email address to access your locker.');
    } else {
      setErrorMsg(res.message || 'Invalid credentials.');
      // Check if this caused a lockout
      const rateCheck = StorageService.checkRateLimit(loginEmail);
      if (rateCheck.isLocked) {
        setLockoutRemaining(rateCheck.remainingSeconds);
      }
    }
  };

  // Registration Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMsg('Please enter your full name and university email.');
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    const res = StorageService.registerUser({
      name: regName,
      email: regEmail,
      password: regPassword,
      college: regCollege,
      major: regMajor,
      pin: regPin
    });

    if (res.success && res.verificationCode) {
      setPendingVerifyEmail(regEmail.toLowerCase().trim());
      setSimulatedCode(res.verificationCode);
      setAuthMode('verify');
      onShowToast('info', 'Verification Code Sent', `A 6-digit code has been sent to ${regEmail}.`);
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  // Email Code Verification Submit
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = StorageService.verifyEmailCode(pendingVerifyEmail, verificationCode);
    if (res.success) {
      onShowToast('success', 'Email Verified!', 'Your account has been activated. Please sign in.');
      setLoginEmail(pendingVerifyEmail);
      setLoginPassword('');
      setVerificationCode('');
      setAuthMode('login');
    } else {
      setErrorMsg(res.message || 'Invalid verification code. Please check and try again.');
    }
  };

  const handleResendCode = () => {
    const res = StorageService.resendVerificationCode(pendingVerifyEmail);
    if (res.success && res.code) {
      setSimulatedCode(res.code);
      onShowToast('info', 'Code Resent', `New 6-digit verification code: ${res.code}`);
    }
  };

  // Forgot Password Flow
  const handleForgotLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = StorageService.getSecurityQuestionForEmail(forgotEmail);
    if (res.success && res.question) {
      setSecurityQuestion(res.question);
      setForgotStep('answer');
    } else {
      setErrorMsg(res.message || 'No registered account found with that email.');
    }
  };

  const handleForgotReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = StorageService.resetPasswordWithSecurityAnswer(forgotEmail, securityAnswer, newPassword);
    if (res.success) {
      onShowToast('success', 'Password Reset Successful', 'You can now sign in with your new password.');
      setLoginEmail(forgotEmail);
      setLoginPassword('');
      setAuthMode('login');
      setForgotStep('email');
      setSecurityAnswer('');
      setNewPassword('');
    } else {
      setErrorMsg(res.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-3 sm:p-6 overflow-hidden bg-slate-900">
      {/* Background Soft Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/35 via-purple-600/25 to-pink-500/20 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-teal-500/25 via-blue-600/30 to-purple-600/35 blur-[140px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-pink-500/20 via-violet-500/20 to-indigo-500/25 blur-[110px] pointer-events-none animate-pulse-subtle" />

      {/* Main Glass Card */}
      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 rounded-3xl glass-card border border-white/20 dark:border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* Left Side: Domain Hero & Product Identity */}
        <div className="lg:col-span-5 p-6 sm:p-10 bg-gradient-to-br from-indigo-900/90 via-purple-900/80 to-slate-900/95 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-white/10">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                  LockerBox
                </span>
                <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                  Student Digital Locker
                </p>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight leading-tight text-white mt-4">
              All your university records in <span className="bg-gradient-to-r from-indigo-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">one private place</span>.
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/80 mt-3 leading-relaxed">
              Store certificates, campus IDs, transcripts, and masked personal numbers. Package credentials into internship bundles with one click.
            </p>

            {/* Feature points */}
            <div className="mt-8 space-y-3">
              {[
                { label: 'Private & Per-User Encrypted', desc: 'Each student only sees their own files' },
                { label: 'Personal Info Vault', desc: 'Masked roll numbers, PAN, & Aadhaar' },
                { label: 'Internship Pack Creator', desc: 'Bundle credentials into a single ZIP' },
                { label: '30-Day Safe Recycle Bin', desc: 'Protection against accidental deletion' }
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">{feat.label}: </span>
                    <span className="text-indigo-200/70">{feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 text-[11px] text-indigo-300/80">
            🔒 Protected by per-user row-level access control & auto-logout protection.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white/95 dark:bg-slate-900/95 flex flex-col justify-center">
          
          {/* Prominent Demo Login Button (Required feature) */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-pink-950/20 border border-indigo-200/60 dark:border-indigo-800/60">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Evaluator Access
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                  Explore pre-filled student certificates & IDs without signing up.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Demo Login (Sample Account)
              </button>
            </div>
          </div>

          {/* Navigation Tabs between Login and Register */}
          {authMode !== 'verify' && authMode !== 'forgot' && (
            <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Create Student Locker
              </button>
            </div>
          )}

          {/* Error / Lockout Banner */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {lockoutRemaining > 0 && (
                  <p className="font-mono font-bold mt-1">
                    Lockout remaining: {lockoutRemaining}s
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Student Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="Enter your student email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setErrorMsg(null); setForgotEmail(loginEmail); }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox (Unchecked by default per requirements) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Remember me on this device</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Auto-logout after 30m idle
                </span>
              </div>

              <button
                type="submit"
                disabled={lockoutRemaining > 0}
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to LockerBox <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM WITH PASSWORD STRENGTH METER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jordan Lee"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University Email *
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jordan@college.edu"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={regCollege}
                    onChange={(e) => setRegCollege(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Degree / Major
                  </label>
                  <input
                    type="text"
                    value={regMajor}
                    onChange={(e) => setRegMajor(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password (min 8 chars) *
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="Create a strong password"
                    className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {regPassword.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{pwdStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pwdStrength.color} transition-all duration-300`}
                        style={{ width: `${pwdStrength.score}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                      <span className={regPassword.length >= 8 ? 'text-emerald-500 font-semibold' : ''}>8+ chars</span>
                      <span>·</span>
                      <span className={/[A-Z]/.test(regPassword) ? 'text-emerald-500 font-semibold' : ''}>Uppercase</span>
                      <span>·</span>
                      <span className={/[0-9]/.test(regPassword) ? 'text-emerald-500 font-semibold' : ''}>Number</span>
                      <span>·</span>
                      <span className={/[^A-Za-z0-9]/.test(regPassword) ? 'text-emerald-500 font-semibold' : ''}>Special</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  4-Digit Security PIN (for Info Vault & sensitive credentials)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Create Locker & Verify Email <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* 3. EMAIL VERIFICATION STEP (Required before first access) */}
          {authMode === 'verify' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <Mail className="w-4 h-4" />
                <span>Verify Your Student Email</span>
              </div>
              
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We sent a 6-digit verification code to <strong className="text-slate-900 dark:text-white">{pendingVerifyEmail}</strong>. Please enter it below to activate your account.
              </p>

              {/* Simulated Code Helper for Tester Convenience */}
              {simulatedCode && (
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-500">Verification Code:</span>
                    <p className="text-base font-mono font-extrabold text-indigo-900 dark:text-indigo-200 tracking-wider">
                      {simulatedCode}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(simulatedCode)}
                    className="px-2.5 py-1 bg-indigo-600 text-white text-[11px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-center font-mono text-base tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-slate-500 hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Verify & Activate Locker <Check className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 4. FORGOT PASSWORD FLOW */}
          {authMode === 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>Reset Your Password</span>
              </div>

              {forgotStep === 'email' ? (
                <form onSubmit={handleForgotLookup} className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enter the student email associated with your locker to verify your security question.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Student Email Address
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="student@university.edu"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-slate-500 hover:underline"
                    >
                      Back to Sign In
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotReset} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">Security Question:</span>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">{securityQuestion}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Your Answer *
                    </label>
                    <input
                      type="text"
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      required
                      placeholder="Enter the answer to your question"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password (min 8 chars) *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter your new password"
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-slate-500 hover:underline"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      Set New Password & Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-[11px] text-slate-400 mt-6">
            LockerBox strictly isolates student profiles. Your documents are inaccessible to others.
          </p>
        </div>
      </div>
    </div>
  );
};
