import React, { useState } from 'react';
import { 
  X, 
  Archive, 
  Check, 
  Download, 
  Sparkles, 
  FileText, 
  CheckSquare, 
  Square,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { LockerDocument } from '../types';
import { formatBytes } from '../services/storageService';
import { CATEGORY_THEMES } from '../utils/theme';

interface InternshipPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: LockerDocument[];
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
}

export const InternshipPackModal: React.FC<InternshipPackModalProps> = ({
  isOpen,
  onClose,
  documents,
  onShowToast
}) => {
  const activeDocs = documents.filter(d => !d.isDeleted);
  
  // Default selected: documents with 'internship-pack' tag or starred documents
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    activeDocs.forEach(d => {
      if (d.tags?.includes('internship-pack') || d.category === 'Certificates' || d.category === 'Marksheets') {
        initial.add(d.id);
      }
    });
    return initial;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [packName, setPackName] = useState('Alex_Rivera_Internship_Bundle');

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(activeDocs.map(d => d.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const applyPreset = (preset: 'internship' | 'scholarship' | 'all') => {
    if (preset === 'all') {
      selectAll();
      return;
    }
    const next = new Set<string>();
    if (preset === 'internship') {
      activeDocs.forEach(d => {
        if (d.category === 'Certificates' || d.category === 'Marksheets' || d.category === 'College ID' || d.tags?.includes('internship-pack')) {
          next.add(d.id);
        }
      });
      setPackName('Student_Internship_Pack_2026');
    } else if (preset === 'scholarship') {
      activeDocs.forEach(d => {
        if (d.category === 'Marksheets' || d.title.toLowerCase().includes('bonafide') || d.category === 'College ID') {
          next.add(d.id);
        }
      });
      setPackName('Scholarship_Verification_Bundle');
    }
    setSelectedIds(next);
  };

  const selectedDocs = activeDocs.filter(d => selectedIds.has(d.id));
  const totalSizeBytes = selectedDocs.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  const handleDownloadZip = async () => {
    if (selectedDocs.length === 0) {
      onShowToast('warning', 'No Documents Selected', 'Please check at least one document to include in your pack.');
      return;
    }

    try {
      setIsGenerating(true);
      const zip = new JSZip();

      // Add a manifest text file
      let manifestContent = `====================================================\n`;
      manifestContent += `  LOCKERBOX STUDENT INTERNSHIP PACK\n`;
      manifestContent += `  Generated on: ${new Date().toLocaleString()}\n`;
      manifestContent += `  Total Documents: ${selectedDocs.length}\n`;
      manifestContent += `====================================================\n\n`;

      manifestContent += `INCLUDED DOCUMENTS:\n`;
      selectedDocs.forEach((d, i) => {
        manifestContent += `${i + 1}. [${d.category}] ${d.title}\n`;
        manifestContent += `   File: ${d.fileName} (${formatBytes(d.fileSize)})\n`;
        if (d.credentialId) manifestContent += `   Credential ID: ${d.credentialId}\n`;
        if (d.issuer) manifestContent += `   Issuer: ${d.issuer}\n`;
        if (d.notes) manifestContent += `   Notes: ${d.notes}\n`;
        manifestContent += `\n`;
      });

      manifestContent += `\nVerified by LockerBox Student Vault.\n`;
      zip.file("README_MANIFEST.txt", manifestContent);

      // Add actual document files
      for (const doc of selectedDocs) {
        if (doc.dataUrl && doc.dataUrl.startsWith('data:')) {
          // Parse base64 or SVG
          const parts = doc.dataUrl.split(',');
          if (doc.dataUrl.startsWith('data:image/svg+xml')) {
            zip.file(`${doc.fileName}.svg`, decodeURIComponent(parts[1]));
          } else {
            // base64
            zip.file(doc.fileName, parts[1], { base64: true });
          }
        } else {
          // Generate a representative verified text summary file
          zip.file(`${doc.fileName}.txt`, `LockerBox Verified Document:\nTitle: ${doc.title}\nCategory: ${doc.category}\nFile: ${doc.fileName}`);
        }
      }

      // Generate the ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${packName.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // Launch joyful confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      onShowToast('success', 'Internship Pack Ready!', `Downloaded ${selectedDocs.length} documents as a compressed ZIP.`);
      setIsGenerating(false);
      onClose();
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      onShowToast('error', 'ZIP Generation Failed', 'Could not compile documents. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-violet-50/50 via-indigo-50/30 to-pink-50/20 dark:from-violet-950/20 dark:to-pink-950/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20">
              <Archive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                Internship-Ready Pack Builder
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select credentials, transcripts, and ID cards to bundle into a single employer-ready ZIP.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Bundle Name & Presets */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ZIP Archive Name
              </label>
              <input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick Presets */}
            <div className="shrink-0 flex items-center gap-1.5 self-end">
              <button
                onClick={() => applyPreset('internship')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Briefcase className="w-3 h-3" /> Job / Internship Preset
              </button>
              <button
                onClick={() => applyPreset('scholarship')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                <GraduationCap className="w-3 h-3" /> Scholarship Preset
              </button>
            </div>
          </div>

          {/* Quick Selection Bar */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Select All ({activeDocs.length})
              </button>
              <span className="text-slate-300">·</span>
              <button
                onClick={deselectAll}
                className="text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
            <div className="font-mono text-slate-600 dark:text-slate-300">
              Selected: <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedDocs.length}</span> files ({formatBytes(totalSizeBytes)})
            </div>
          </div>

          {/* Document Checklist */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {activeDocs.map((doc) => {
              const isSelected = selectedIds.has(doc.id);
              const theme = CATEGORY_THEMES[doc.category] || CATEGORY_THEMES['Other'];

              return (
                <div
                  key={doc.id}
                  onClick={() => toggleSelect(doc.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${theme.badgeBg} ${theme.badgeText}`}>
                          {doc.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {doc.title}
                        </h4>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {doc.fileName} · {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>

                  {doc.tags?.includes('internship-pack') && (
                    <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Recommended
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-xs text-slate-500">
            Generates compliant ZIP with <code className="text-indigo-600 font-mono">README_MANIFEST.txt</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadZip}
              disabled={isGenerating || selectedDocs.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isGenerating ? 'Compiling ZIP...' : `Download ZIP (${selectedDocs.length} Files)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
