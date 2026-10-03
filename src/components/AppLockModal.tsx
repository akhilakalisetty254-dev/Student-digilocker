import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, HelpCircle, X, Check, ArrowRight } from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../services/storageService';

interface AppLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessUnlock: () => void;
  currentUser: UserProfile;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isOpen,
  onClose,
  onSuccessUnlock,
  currentUser,
  onShowToast
}) => {
  const [pinDigits, setPinDigits] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotFlow, setShowForgotFlow] = useState(false);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pinDigits.length < 4) {
      const next = pinDigits + digit;
      setPinDigits(next);
      setErrorMsg(null);
      if (next.length === 4) {
        verify(next);
      }
    }
  };

  const handleBackspace = () => {
    setPinDigits(prev => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const verify = (code: string) => {
    if (StorageService.verifyPin(code)) {
      onSuccessUnlock();
      onShowToast('success', 'Locker Unlocked', 'Sensitive vault items and document credentials are now accessible.');
      handleResetAndClose();
    } else {
      setErrorMsg('Incorrect PIN. Please try again or use the recovery hint.');
      setPinDigits('');
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim() || newPin.length !== 4) {
      setErrorMsg('Please answer the security question and choose a 4-digit PIN.');
      return;
    }

    const success = StorageService.resetPinWithSecurityAnswer(securityAnswer, newPin);
    if (success) {
      onShowToast('success', 'PIN Reset Successful', 'Your security PIN has been updated.');
      setShowForgotFlow(false);
      setPinDigits('');
      onSuccessUnlock();
      handleResetAndClose();
    } else {
      setErrorMsg('Incorrect answer to the security question.');
    }
  };

  const handleResetAndClose = () => {
    setPinDigits('');
    setErrorMsg(null);
    setShowForgotFlow(false);
    setSecurityAnswer('');
    setNewPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-lg animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleResetAndClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        {!showForgotFlow ? (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 mb-3">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
              LockerBox Security Lock
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your 4-digit PIN to access sensitive personal numbers and credentials.
            </p>
            <p className="text-[11px] font-mono text-indigo-500 dark:text-indigo-400 mt-0.5">
              (Demo PIN: 1234)
            </p>

            {/* Error badge */}
            {errorMsg && (
              <p className="mt-3 text-xs text-rose-500 font-semibold animate-shake">
                {errorMsg}
              </p>
            )}

            {/* Pin dots */}
            <div className="flex items-center justify-center gap-4 my-6">
              {[0, 1, 2, 3].map((index) => {
                const filled = pinDigits.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-indigo-600 scale-125 shadow-md shadow-indigo-500/40'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => {
                if (key === '') {
                  return <div key={i} />;
                }
                const isBackspace = key === '⌫';
                return (
                  <button
                    key={i}
                    onClick={() => (isBackspace ? handleBackspace() : handleDigit(key))}
                    className="h-12 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-slate-700 active:scale-95 text-base font-bold text-slate-800 dark:text-slate-100 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Forgot PIN trigger */}
            <button
              onClick={() => setShowForgotFlow(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Forgot your PIN? Recover with security question
            </button>
          </div>
        ) : (
          <form onSubmit={handleResetPin} className="text-left space-y-3.5">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recover & Reset PIN
              </h3>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-xs text-indigo-900 dark:text-indigo-200">
              <span className="font-bold">Security Question:</span>
              <p className="mt-0.5">{currentUser.securityQuestion}</p>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 font-semibold">{errorMsg}</p>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Answer
              </label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Enter your security answer (Demo: Vanderbilt)"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New 4-Digit PIN
              </label>
              <input
                type="text"
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="e.g. 5678"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotFlow(false)}
                className="text-xs text-slate-500 hover:underline"
              >
                Back to Keypad
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                Set New PIN & Unlock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
