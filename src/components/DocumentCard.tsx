import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  Archive, 
  File, 
  Star, 
  Eye, 
  Download, 
  Share2, 
  Trash2, 
  Calendar, 
  Clock, 
  Check, 
  Zap,
  Tag
} from 'lucide-react';
import { LockerDocument } from '../types';
import { CATEGORY_THEMES, getFileTypeBadge } from '../utils/theme';
import { formatBytes } from '../services/storageService';

interface DocumentCardProps {
  document: LockerDocument;
  onPreview: (doc: LockerDocument) => void;
  onDownload: (doc: LockerDocument) => void;
  onShare: (doc: LockerDocument) => void;
  onDelete: (doc: LockerDocument) => void;
  onToggleStar: (doc: LockerDocument) => void;
  onToggleQuickAccess: (doc: LockerDocument) => void;
  isSelectedForPack?: boolean;
  onToggleSelectPack?: (doc: LockerDocument) => void;
  isPackSelectionMode?: boolean;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onToggleStar,
  onToggleQuickAccess,
  isSelectedForPack = false,
  onToggleSelectPack,
  isPackSelectionMode = false
}) => {
  const theme = CATEGORY_THEMES[document.category] || CATEGORY_THEMES['Other'];
  const fileTypeBadge = getFileTypeBadge(document.fileType);

  // Expiry status
  let isExpiringSoon = false;
  let isExpired = false;
  if (document.expiryDate) {
    const exp = new Date(document.expiryDate).getTime();
    const now = Date.now();
    const in30Days = now + 30 * 24 * 60 * 60 * 1000;
    if (exp < now) isExpired = true;
    else if (exp <= in30Days) isExpiringSoon = true;
  }

  const renderFileIcon = () => {
    switch (document.fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-indigo-500" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div
      className={`group relative rounded-2xl glass-card border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isSelectedForPack
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30'
          : 'border-white/70 dark:border-slate-800/80 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Top category gradient hairline */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

      {/* Main card body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Category Badge + Star & Pack checkbox */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                {document.category}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${fileTypeBadge.bg} ${fileTypeBadge.color}`}>
                {fileTypeBadge.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {isPackSelectionMode ? (
                <button
                  onClick={() => onToggleSelectPack && onToggleSelectPack(document)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    isSelectedForPack 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 bg-white dark:bg-slate-800'
                  }`}
                  title="Select for ZIP bundle"
                >
                  {isSelectedForPack && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onToggleQuickAccess(document)}
                    className={`p-1 rounded-lg transition-colors ${
                      document.isQuickAccess 
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                    }`}
                    title={document.isQuickAccess ? 'Remove from Quick Access' : 'Pin to Quick Access'}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => onToggleStar(document)}
                    className={`p-1 rounded-lg transition-colors ${
                      document.isStarred 
                        ? 'text-amber-400 bg-amber-50 dark:bg-amber-950/40' 
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                    }`}
                    title={document.isStarred ? 'Unstar' : 'Star document'}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Document Title & File Name */}
          <div className="cursor-pointer" onClick={() => onPreview(document)}>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {document.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 truncate">
              {document.fileName}
            </p>
          </div>

          {/* Thumbnail preview snippet if available */}
          {document.dataUrl && (
            <div 
              onClick={() => onPreview(document)}
              className="mt-3 h-24 w-full rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800/80 overflow-hidden relative cursor-pointer group/img"
            >
              <img 
                src={document.dataUrl} 
                alt={document.title} 
                className="w-full h-full object-cover object-top opacity-85 group-hover/img:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 transition-opacity backdrop-blur-xs">
                <span className="px-2 py-1 rounded bg-white text-slate-900 text-xs font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Preview
                </span>
              </div>
            </div>
          )}

          {/* Notes or Subtitle preview */}
          {document.notes && !document.dataUrl && (
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50/80 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
              {document.notes}
            </p>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {document.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span>#{tag}</span>
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-[10px] text-slate-400">+{document.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Expiry Badge if any */}
        {document.expiryDate && (
          <div className="mt-3 pt-2">
            {isExpired ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <Clock className="w-3 h-3" /> Expired on {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            ) : isExpiringSoon ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                <Clock className="w-3 h-3" /> Expiring: {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3" /> Valid till: {new Date(document.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {/* Footer: Metadata & Action Icons */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums">{formatBytes(document.fileSize)}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPreview(document)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Preview Document"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(document)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download File"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShare(document)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Create Secure Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(document)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Move to Recycle Bin"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
