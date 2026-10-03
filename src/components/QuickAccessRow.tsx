import React from 'react';
import { LockerDocument } from '../types';
import { CATEGORY_THEMES } from '../utils/theme';
import { Eye, Download, Zap, CreditCard, ShieldCheck } from 'lucide-react';

interface QuickAccessRowProps {
  documents: LockerDocument[];
  onPreview: (doc: LockerDocument) => void;
  onDownload: (doc: LockerDocument) => void;
}

export const QuickAccessRow: React.FC<QuickAccessRowProps> = ({
  documents,
  onPreview,
  onDownload
}) => {
  const quickDocs = documents.filter(d => !d.isDeleted && (d.isQuickAccess || d.isStarred)).slice(0, 5);

  if (quickDocs.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 fill-amber-500" />
          </div>
          <h2 className="text-base font-bold font-heading text-slate-800 dark:text-slate-100">
            Quick Access Cards
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            · High-frequency student IDs & passes
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickDocs.map((doc) => {
          const theme = CATEGORY_THEMES[doc.category] || CATEGORY_THEMES['Other'];
          return (
            <div
              key={doc.id}
              className="group relative overflow-hidden rounded-2xl glass-card border border-white/70 dark:border-slate-800/80 p-3.5 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              {/* Top Accent Strip */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`} />

              <div className="flex items-start justify-between gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.badgeText}`}>
                      {doc.category}
                    </span>
                    <h3 
                      className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer"
                      onClick={() => onPreview(doc)}
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Preview Thumbnail area or credential info */}
              <div 
                onClick={() => onPreview(doc)}
                className="mt-2.5 h-20 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60 overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 cursor-pointer flex items-center justify-center group-hover:border-indigo-400/50 transition-colors"
              >
                {doc.dataUrl ? (
                  <img 
                    src={doc.dataUrl} 
                    alt={doc.title} 
                    className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity" 
                  />
                ) : (
                  <div className="text-center p-2">
                    <ShieldCheck className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono text-slate-500">{doc.fileName}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity backdrop-blur-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <Eye className="w-3 h-3" /> Quick View
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {doc.credentialId ? doc.credentialId : (doc.expiryDate ? `Exp: ${new Date(doc.expiryDate).toLocaleDateString()}` : 'Encrypted')}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPreview(doc)}
                    className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDownload(doc)}
                    className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
