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
  Check, 
  Zap,
  Calendar
} from 'lucide-react';
import { LockerDocument } from '../types';
import { CATEGORY_THEMES, getFileTypeBadge } from '../utils/theme';
import { formatBytes } from '../services/storageService';

interface DocumentListProps {
  documents: LockerDocument[];
  onPreview: (doc: LockerDocument) => void;
  onDownload: (doc: LockerDocument) => void;
  onShare: (doc: LockerDocument) => void;
  onDelete: (doc: LockerDocument) => void;
  onToggleStar: (doc: LockerDocument) => void;
  onToggleQuickAccess: (doc: LockerDocument) => void;
  selectedDocIds?: Set<string>;
  onToggleSelectPack?: (doc: LockerDocument) => void;
  isPackSelectionMode?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onPreview,
  onDownload,
  onShare,
  onDelete,
  onToggleStar,
  onToggleQuickAccess,
  selectedDocIds,
  onToggleSelectPack,
  isPackSelectionMode = false
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl glass-card border border-white/70 dark:border-slate-800/80 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isPackSelectionMode && <th className="p-3 w-10">Select</th>}
              <th className="p-3.5 pl-4">Document Title & File</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Date Added</th>
              <th className="p-3.5">Validity</th>
              <th className="p-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-200">
            {documents.map((doc) => {
              const theme = CATEGORY_THEMES[doc.category] || CATEGORY_THEMES['Other'];
              const typeBadge = getFileTypeBadge(doc.fileType);
              const isSelected = selectedDocIds?.has(doc.id);

              return (
                <tr 
                  key={doc.id}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group ${
                    isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  {isPackSelectionMode && (
                    <td className="p-3 pl-4">
                      <button
                        onClick={() => onToggleSelectPack && onToggleSelectPack(doc)}
                        className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                    </td>
                  )}

                  {/* Title & File */}
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleStar(doc)}
                        className={`p-0.5 transition-colors ${
                          doc.isStarred 
                            ? 'text-amber-400' 
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                        }`}
                        title={doc.isStarred ? 'Starred' : 'Click to star'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      <div 
                        onClick={() => onPreview(doc)} 
                        className="cursor-pointer max-w-xs sm:max-w-md"
                      >
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {doc.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          {doc.fileName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="p-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText}`}>
                      {doc.category}
                    </span>
                  </td>

                  {/* Size */}
                  <td className="p-3.5 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {formatBytes(doc.fileSize)}
                  </td>

                  {/* Upload Date */}
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>

                  {/* Validity / Expiry */}
                  <td className="p-3.5">
                    {doc.expiryDate ? (
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Permanent</span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="p-3.5 pr-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => onPreview(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownload(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onShare(doc)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
