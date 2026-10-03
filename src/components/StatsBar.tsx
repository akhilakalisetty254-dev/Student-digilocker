import React from 'react';
import { HardDrive, Star, AlertCircle, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface StatsBarProps {
  onFilterExpiring: () => void;
  onFilterStarred: () => void;
  isFilterExpiringActive: boolean;
  isFilterStarredActive: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  onFilterExpiring,
  onFilterStarred,
  isFilterExpiringActive,
  isFilterStarredActive
}) => {
  const stats = StorageService.getStorageStats();

  return (
    <div className="w-full mb-6">
      {/* Expiry Alert Banner if any expiring soon */}
      {stats.expiringSoonCount > 0 && (
        <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                Document Expiry Reminder: {stats.expiringSoonCount} item{stats.expiringSoonCount > 1 ? 's' : ''} expiring within 30 days!
              </p>
              <p className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400">
                Includes transit cards, insurance, and bonafide certificates that may require renewal.
              </p>
            </div>
          </div>
          <button
            onClick={onFilterExpiring}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isFilterExpiringActive
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50'
            }`}
          >
            {isFilterExpiringActive ? 'Clear Filter' : 'View Expiring Items'}
          </button>
        </div>
      )}

      {/* Grid of 4 quick stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Documents */}
        <div className="glass-card p-4 rounded-2xl border border-white/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Files</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {stats.totalFiles}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Encrypted student assets
            </p>
          </div>
        </div>

        {/* Storage Used */}
        <div className="glass-card p-4 rounded-2xl border border-white/60 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Storage Used</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
                {stats.formattedUsed}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {stats.formattedLimit}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(stats.percentage, 4)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Starred / Quick Favorites */}
        <button
          onClick={onFilterStarred}
          className={`glass-card p-4 rounded-2xl border text-left transition-all ${
            isFilterStarredActive 
              ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/50 dark:bg-amber-950/20' 
              : 'border-white/60 dark:border-slate-800/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Starred / Key Docs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {stats.starredCount}
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
              {isFilterStarredActive ? 'Click to show all' : 'Click to filter starred'}
            </p>
          </div>
        </button>

        {/* Expiring Reminders */}
        <button
          onClick={onFilterExpiring}
          className={`glass-card p-4 rounded-2xl border text-left transition-all ${
            isFilterExpiringActive 
              ? 'border-orange-400 ring-2 ring-orange-400/20 bg-orange-50/50 dark:bg-orange-950/20' 
              : 'border-white/60 dark:border-slate-800/80 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expiring Items</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white tabular-nums">
              {stats.expiringSoonCount}
            </div>
            <p className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5 font-medium">
              {stats.expiringSoonCount > 0 ? 'Action required soon' : 'All active & healthy'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
