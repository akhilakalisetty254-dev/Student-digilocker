import React, { useState } from 'react';
import { 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Sparkles,
  CreditCard,
  GraduationCap,
  Phone,
  Home,
  FileCheck,
  Heart
} from 'lucide-react';
import { VaultField, VaultCategory } from '../types';
import { StorageService } from '../services/storageService';

interface PersonalInfoVaultProps {
  fields: VaultField[];
  onReloadFields: () => void;
  onShowToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => void;
  isPinLocked: boolean;
  onRequestUnlock: () => void;
}

export const PersonalInfoVault: React.FC<PersonalInfoVaultProps> = ({
  fields,
  onReloadFields,
  onShowToast,
  isPinLocked,
  onRequestUnlock
}) => {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'All' | VaultCategory>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New field state
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<VaultCategory>('Academic');
  const [newIsSensitive, setNewIsSensitive] = useState(false);

  const toggleReveal = (id: string, isSensitive: boolean) => {
    if (isSensitive && isPinLocked) {
      onRequestUnlock();
      return;
    }
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyToClipboard = (id: string, value: string, label: string, isSensitive: boolean) => {
    if (isSensitive && isPinLocked) {
      onRequestUnlock();
      return;
    }
    navigator.clipboard.writeText(value);
    setCopiedId(id);
    onShowToast('success', 'Copied to Clipboard', `"${label}" copied securely.`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDeleteField = (id: string, label: string) => {
    if (confirm(`Remove "${label}" from your personal info vault?`)) {
      StorageService.deleteVaultField(id);
      onReloadFields();
      onShowToast('info', 'Field Removed', `"${label}" removed.`);
    }
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newValue.trim()) return;

    StorageService.saveVaultField({
      label: newLabel.trim(),
      value: newValue.trim(),
      category: newCategory,
      isSensitive: newIsSensitive
    });

    onReloadFields();
    onShowToast('success', 'Field Added', `"${newLabel}" stored in Personal Info Vault.`);
    setNewLabel('');
    setNewValue('');
    setShowAddModal(false);
  };

  const filteredFields = fields.filter(f => activeCategory === 'All' || f.category === activeCategory);

  const getCategoryIcon = (category: VaultCategory) => {
    switch (category) {
      case 'Academic':
        return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'Identity':
        return <CreditCard className="w-4 h-4 text-violet-500" />;
      case 'Contact':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'Financial':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'Personal':
        return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              Personal Info Vault
              {isPinLocked ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PIN Locked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> Unlocked
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Securely store Student IDs, Roll numbers, PAN, Aadhaar, and addresses with quick copy & mask features.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isPinLocked && (
            <button
              onClick={onRequestUnlock}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" /> Unlock Sensitive Items
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/25 transition-all cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" /> Add New Detail
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl glass-panel max-w-fit overflow-x-auto">
        {(['All', 'Academic', 'Identity', 'Contact', 'Financial', 'Personal'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vault Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFields.map((field) => {
          const isRevealed = revealedIds.has(field.id);
          const isLockedSensitive = field.isSensitive && isPinLocked;
          const displayValue = isLockedSensitive 
            ? '•••• •••• •••• (PIN Required)'
            : isRevealed 
              ? field.value 
              : '••••••••••••';

          return (
            <div
              key={field.id}
              className="p-4 rounded-2xl glass-card border border-white/70 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getCategoryIcon(field.category)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {field.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {field.isSensitive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Sensitive
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteField(field.id, field.label)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Masked / Revealed Value Box */}
                <div className="mt-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className={`font-mono text-xs sm:text-sm select-all break-all ${
                    isLockedSensitive 
                      ? 'text-amber-600 dark:text-amber-400 italic' 
                      : isRevealed 
                        ? 'text-slate-900 dark:text-slate-100 font-semibold' 
                        : 'text-slate-400 tracking-wider'
                  }`}>
                    {displayValue}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleReveal(field.id, field.isSensitive)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title={isRevealed ? 'Mask field' : 'Reveal field'}
                    >
                      {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(field.id, field.value, field.label, field.isSensitive)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === field.id ? (
                        <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>Category: {field.category}</span>
                <span>Updated: {new Date(field.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-3">
              Add Personal Info Field
            </h3>
            <form onSubmit={handleAddField} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Label *
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Bank Account Number or Hostel Room ID"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field Value / Content *
                </label>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 9841-2091-8821"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VaultCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="Identity">Identity</option>
                  <option value="Contact">Contact</option>
                  <option value="Financial">Financial</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newIsSensitive}
                    onChange={(e) => setNewIsSensitive(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Mark as sensitive (requires PIN to reveal)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
