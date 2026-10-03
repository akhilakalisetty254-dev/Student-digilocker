import React from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { LockerDocument } from '../types';
import { StorageService, formatBytes } from '../services/storageService';
import { CATEGORY_THEMES } from '../utils/theme';

interface RecycleBinViewProps {
  documents: LockerDocument[];
  onReload: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const RecycleBinView: React.FC<RecycleBinViewProps> = ({
  documents,
  onReload,
  onShowToast
}) => {
  const binDocs = documents.filter(d => d.isDeleted);

  const calculateDaysLeft = (deletedAt?: string) => {
    if (!deletedAt) return 30;
    const deletedTime = new Date(deletedAt).getTime();
    const expiryTime = deletedTime + 30 * 24 * 60 * 60 * 1000;
    const diff = expiryTime - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  const handleRestore = (doc: LockerDocument) => {
    StorageService.restoreFromRecycleBin(doc.id);
    onReload();
    onShowToast('success', 'Document Restored', `"${doc.title}" has been restored to your active locker.`);
  };

  const handlePermanentDelete = (doc: LockerDocument) => {
    if (confirm(`Permanently delete "${doc.title}"? This cannot be undone.`)) {
      StorageService.permanentlyDeleteDocument(doc.id);
      onReload();
      onShowToast('info', 'Permanently Deleted', `"${doc.title}" was removed forever.`);
    }
  };

  const handleEmptyBin = () => {
    if (confirm(`Are you sure you want to empty the Recycle Bin? All ${binDocs.length} deleted items will be lost forever.`)) {
      StorageService.emptyRecycleBin();
      onReload();
      onShowToast('info', 'Recycle Bin Emptied');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
            <Trash2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              Recycle Bin ({binDocs.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Deleted documents are safely kept here for 30 days before permanent purging.
            </p>
          </div>
        </div>

        {binDocs.length > 0 && (
          <button
            onClick={handleEmptyBin}
            className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Empty Recycle Bin
          </button>
        )}
      </div>

      {/* Bin List */}
      {binDocs.length === 0 ? (
        <div className="text-center py-16 rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Recycle Bin is Empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No deleted documents. Whenever you delete a file, it will stay here for 30 days so you can recover it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {binDocs.map((doc) => {
            const daysLeft = calculateDaysLeft(doc.deletedAt);
            const theme = CATEGORY_THEMES[doc.category] || CATEGORY_THEMES['Other'];

            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl glass-card border border-white/70 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                      {doc.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      {daysLeft} days until auto-purge
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 truncate mt-0.5">
                    {doc.fileName} · {formatBytes(doc.fileSize)}
                  </p>
                  {doc.deletedAt && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Deleted on {new Date(doc.deletedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleRestore(doc)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore to Locker
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(doc)}
                    className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
