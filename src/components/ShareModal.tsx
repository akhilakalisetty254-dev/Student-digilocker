import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { LockerDocument, ShareLink } from '../types';
import { StorageService } from '../services/storageService';

interface ShareModalProps {
  document: LockerDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  document,
  isOpen,
  onClose,
  onShowToast
}) => {
  const [hoursValid, setHoursValid] = useState<number>(24);
  const [passcode, setPasscode] = useState('');
  const [enablePasscode, setEnablePasscode] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRecipientPreview, setIsRecipientPreview] = useState(false);

  if (!isOpen || !document) return null;

  const handleCreateShareLink = (e: React.FormEvent) => {
    e.preventDefault();
    const link = StorageService.createShareLink(
      document.id, 
      hoursValid, 
      enablePasscode ? passcode : undefined
    );

    if (link) {
      const fullUrl = `${window.location.origin}/#share=${link.id}`;
      setGeneratedLink(fullUrl);
      onShowToast('success', 'Secure Share Link Created', `Valid for ${hoursValid} hours. Copy and send to recipient.`);
    } else {
      onShowToast('error', 'Failed to generate link');
    }
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    onShowToast('success', 'Link Copied to Clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetAndClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    setIsRecipientPreview(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/20 dark:from-blue-950/20 dark:to-purple-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Share2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
                Secure Time-Limited Share Link
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant temporary, revocable access to "{document.title}"
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {!generatedLink ? (
            <form onSubmit={handleCreateShareLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Link Expiration Window
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1 Hour', hours: 1 },
                    { label: '24 Hours', hours: 24 },
                    { label: '7 Days', hours: 168 }
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.hours}
                      onClick={() => setHoursValid(opt.hours)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        hoursValid === opt.hours
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passcode toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enablePasscode}
                    onChange={(e) => setEnablePasscode(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Require a 4-digit access passcode</span>
                </label>

                {enablePasscode && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      maxLength={6}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="e.g. 8420"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                🛡️ Recipients can only view this specific document. They cannot access your other files or personal info vault. You can revoke this link at any time from the "Share Links" tab.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Generate Share Link
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Link generated and active! Expires in {hoursValid} hours.</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate select-all">
                  {generatedLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1 shrink-0 hover:bg-indigo-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {enablePasscode && passcode && (
                <p className="text-xs text-slate-500 font-mono">
                  Passcode required for recipient: <span className="font-bold text-slate-800 dark:text-slate-200">{passcode}</span>
                </p>
              )}

              {/* Recipient preview demonstration */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsRecipientPreview(!isRecipientPreview)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isRecipientPreview ? 'Hide Recipient Preview' : 'Show Simulated Recipient View'}
                </button>

                {isRecipientPreview && (
                  <div className="mt-3 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white/90 dark:bg-slate-900/90 shadow-inner">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-indigo-600">RECIPIENT SECURE PORTAL</span>
                      <span className="text-[10px] text-slate-400">Read-Only View</span>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{document.title}</p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">{document.fileName}</p>
                      {document.dataUrl && (
                        <img 
                          src={document.dataUrl} 
                          alt="preview" 
                          className="mt-2 rounded-lg max-h-36 mx-auto object-contain border"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={resetAndClose}
                  className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
