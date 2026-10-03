import React from 'react';
import { Share2, Clock, Trash2, ExternalLink, ShieldAlert, Check, Copy } from 'lucide-react';
import { ShareLink } from '../types';
import { StorageService } from '../services/storageService';

interface ShareLinksViewProps {
  shareLinks: ShareLink[];
  onReload: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const ShareLinksView: React.FC<ShareLinksViewProps> = ({
  shareLinks,
  onReload,
  onShowToast
}) => {
  const handleRevoke = (id: string, title: string) => {
    if (confirm(`Revoke the link for "${title}" immediately? Recipients will no longer have access.`)) {
      StorageService.revokeShareLink(id);
      onReload();
      onShowToast('info', 'Link Revoked', `Share link for "${title}" is now inactive.`);
    }
  };

  const copyUrl = (id: string) => {
    const url = `${window.location.origin}/#share=${id}`;
    navigator.clipboard.writeText(url);
    onShowToast('success', 'Link Copied', 'Share URL copied to clipboard.');
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Share2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Active Share Links
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage time-limited links you have granted to professors, recruiters, or administrators.
            </p>
          </div>
        </div>
      </div>

      {/* Share Links List */}
      {shareLinks.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <Share2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Active Share Links</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Click the "Share" icon on any document card to generate a time-limited 24-hour access link.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareLinks.map((link) => {
            const isExpired = new Date(link.expiresAt).getTime() < Date.now();
            const isActive = !link.isRevoked && !isExpired;

            return (
              <div
                key={link.id}
                className="p-5 rounded-2xl glass-card border border-white/70 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {link.documentTitle}
                    </span>
                    {link.isRevoked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        Revoked
                      </span>
                    ) : isExpired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        Active Link
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Expires: {new Date(link.expiresAt).toLocaleString()}
                    </p>
                    {link.passcode && (
                      <p className="font-mono">
                        Passcode Protection: <span className="font-bold text-slate-700 dark:text-slate-200">{link.passcode}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <button
                        onClick={() => copyUrl(link.id)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy URL
                      </button>
                    )}
                  </div>

                  {isActive && (
                    <button
                      onClick={() => handleRevoke(link.id, link.documentTitle)}
                      className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Revoke Access
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
