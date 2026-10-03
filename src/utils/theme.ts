import { DocumentCategory, FileType } from '../types';

export interface CategoryTheme {
  name: DocumentCategory;
  colorName: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardGlow: string;
  gradient: string;
  iconBg: string;
}

export const CATEGORY_THEMES: Record<DocumentCategory, CategoryTheme> = {
  'Certificates': {
    name: 'Certificates',
    colorName: 'gold',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/50',
    cardGlow: 'hover:shadow-amber-500/10 dark:hover:shadow-amber-500/15',
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
  },
  'College ID': {
    name: 'College ID',
    colorName: 'blue',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800/50',
    cardGlow: 'hover:shadow-blue-500/10 dark:hover:shadow-blue-500/15',
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
  },
  'Notes': {
    name: 'Notes',
    colorName: 'green',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/50',
    cardGlow: 'hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/15',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
  },
  'Projects': {
    name: 'Projects',
    colorName: 'purple',
    badgeBg: 'bg-violet-50 dark:bg-violet-950/40',
    badgeText: 'text-violet-700 dark:text-violet-300',
    badgeBorder: 'border-violet-200 dark:border-violet-800/50',
    cardGlow: 'hover:shadow-violet-500/10 dark:hover:shadow-violet-500/15',
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'
  },
  'Marksheets': {
    name: 'Marksheets',
    colorName: 'orange',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    badgeText: 'text-orange-700 dark:text-orange-300',
    badgeBorder: 'border-orange-200 dark:border-orange-800/50',
    cardGlow: 'hover:shadow-orange-500/10 dark:hover:shadow-orange-500/15',
    gradient: 'from-orange-500 to-amber-600',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'
  },
  'Other': {
    name: 'Other',
    colorName: 'pink',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    badgeText: 'text-pink-700 dark:text-pink-300',
    badgeBorder: 'border-pink-200 dark:border-pink-800/50',
    cardGlow: 'hover:shadow-pink-500/10 dark:hover:shadow-pink-500/15',
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400'
  }
};

export const ALL_CATEGORIES: DocumentCategory[] = [
  'Certificates',
  'College ID',
  'Notes',
  'Projects',
  'Marksheets',
  'Other'
];

export function getFileTypeBadge(fileType: FileType): { label: string; color: string; bg: string } {
  switch (fileType) {
    case 'pdf':
      return { label: 'PDF', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40' };
    case 'image':
      return { label: 'IMG', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' };
    case 'doc':
      return { label: 'DOC', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' };
    case 'archive':
      return { label: 'ZIP', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' };
    case 'code':
      return { label: 'CODE', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' };
    default:
      return { label: 'FILE', color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40' };
  }
}
