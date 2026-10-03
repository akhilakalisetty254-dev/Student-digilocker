import React from 'react';
import { Trash2, AlertTriangle, X, RotateCcw } from 'lucide-react';
import { LockerDocument } from '../types';

interface DeleteConfirmModalProps {
  document: LockerDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 shadow-md shadow-rose-500/20">
          <Trash2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
          Move Document to Recycle Bin?
        </h3>
        
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          Are you sure you want to remove <strong className="text-slate-900 dark:text-white">"{document.title}"</strong>?
        </p>

        <div className="my-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2.5">
          <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Don't worry: deleted items are safely stored in your <strong>30-day Recycle Bin</strong> and can be restored at any time before auto-purging.
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
          >
            Move to Recycle Bin
          </button>
        </div>
      </div>
    </div>
  );
};
