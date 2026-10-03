import React from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Trash2, 
  Calendar, 
  ShieldCheck, 
  Tag, 
  FileText, 
  Clock, 
  Building, 
  Award,
  ExternalLink,
  Star
} from 'lucide-react';
import { LockerDocument } from '../types';
import { CATEGORY_THEMES, getFileTypeBadge } from '../utils/theme';
import { formatBytes } from '../services/storageService';

interface PreviewModalProps {
  document: LockerDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: LockerDocument) => void;
  onShare: (doc: LockerDocument) => void;
  onDelete: (doc: LockerDocument) => void;
  onToggleStar: (doc: LockerDocument) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onDelete,
  onToggleStar
}) => {
  if (!isOpen || !document) return null;

  const theme = CATEGORY_THEMES[document.category] || CATEGORY_THEMES['Other'];
  const fileTypeBadge = getFileTypeBadge(document.fileType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
              {document.category}
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white truncate">
                {document.title}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">
                {document.fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => onToggleStar(document)}
              className={`p-2 rounded-xl transition-colors ${
                document.isStarred 
                  ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40' 
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={document.isStarred ? 'Starred' : 'Star document'}
            >
              <Star className="w-4 h-4 fill-current" />
            </button>
            <button
              onClick={() => onDownload(document)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button
              onClick={() => onShare(document)}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Create Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(document)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Move to Recycle Bin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Preview, Right Meta Details */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800/80">
          {/* Main Visual Display (8 cols on lg) */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-950/40 min-h-[320px]">
            {document.dataUrl ? (
              <div className="w-full max-w-xl max-h-[500px] overflow-hidden rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900">
                <img
                  src={document.dataUrl}
                  alt={document.title}
                  className="max-h-[500px] w-auto object-contain mx-auto"
                />
              </div>
            ) : (
              <div className="text-center p-8">
                <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-3 opacity-80" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{document.fileName}</h3>
                <p className="text-xs text-slate-400 mt-1">Binary document stored in LockerBox vault</p>
                <button
                  onClick={() => onDownload(document)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 transition-colors"
                >
                  Download File to View
                </button>
              </div>
            )}
          </div>

          {/* Metadata Inspector (4 cols on lg) */}
          <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-white/40 dark:bg-slate-900/40">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document Details
                </span>
                <div className="mt-2 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">File Type</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${fileTypeBadge.bg} ${fileTypeBadge.color}`}>
                      {fileTypeBadge.label} ({document.mimeType || 'unknown'})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">File Size</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {formatBytes(document.fileSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Uploaded On</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {new Date(document.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  {document.expiryDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Valid Until</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {new Date(document.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Authority & Credential ID */}
              {(document.issuer || document.credentialId || document.scoreOrGrade) && (
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Verification & Issuer
                  </span>
                  <div className="mt-2 space-y-2 text-xs">
                    {document.issuer && (
                      <div className="flex items-start gap-2">
                        <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-slate-400">Issuing Authority</p>
                          <p className="font-medium text-slate-800 dark:text-slate-200">{document.issuer}</p>
                        </div>
                      </div>
                    )}
                    {document.credentialId && (
                      <div className="flex items-start gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-slate-400">Registration / Credential ID</p>
                          <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{document.credentialId}</p>
                        </div>
                      </div>
                    )}
                    {document.scoreOrGrade && (
                      <div className="flex items-start gap-2">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] text-slate-400">Grade / Standing</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{document.scoreOrGrade}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {document.notes && (
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Personal Notes
                  </span>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
                    {document.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tags
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {document.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Security stamp */}
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div className="text-[11px]">
                <p className="font-bold text-indigo-900 dark:text-indigo-200">Encrypted in Student Locker</p>
                <p className="text-indigo-600 dark:text-indigo-400">Only accessible by your authenticated session</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
