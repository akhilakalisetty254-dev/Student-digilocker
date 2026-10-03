import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Grid, 
  List, 
  ArrowUpDown, 
  Filter, 
  FolderPlus, 
  Sparkles, 
  Star, 
  Clock, 
  Archive, 
  X,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

import { 
  LockerDocument, 
  UserProfile, 
  VaultField, 
  ShareLink, 
  DocumentCategory, 
  ViewMode, 
  SortOption,
  ToastMessage 
} from './types';
import { StorageService } from './services/storageService';
import { ALL_CATEGORIES, CATEGORY_THEMES } from './utils/theme';

import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { QuickAccessRow } from './components/QuickAccessRow';
import { DocumentCard } from './components/DocumentCard';
import { DocumentList } from './components/DocumentList';
import { UploadModal } from './components/UploadModal';
import { PreviewModal } from './components/PreviewModal';
import { PersonalInfoVault } from './components/PersonalInfoVault';
import { InternshipPackModal } from './components/InternshipPackModal';
import { ShareModal } from './components/ShareModal';
import { ShareLinksView } from './components/ShareLinksView';
import { RecycleBinView } from './components/RecycleBinView';
import { SettingsView } from './components/SettingsView';
import { AppLockModal } from './components/AppLockModal';
import { LoginPage } from './components/LoginPage';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  // --- AUTH & USER STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isPinLocked, setIsPinLocked] = useState<boolean>(false);
  const [showAppLockModal, setShowAppLockModal] = useState<boolean>(false);

  // --- NAVIGATION TAB ---
  const [currentTab, setCurrentTab] = useState<'documents' | 'vault' | 'bin' | 'pack' | 'shares' | 'settings'>('documents');

  // --- THEME ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('lockerbox_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- DATA ---
  const [documents, setDocuments] = useState<LockerDocument[]>([]);
  const [vaultFields, setVaultFields] = useState<VaultField[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);

  // --- FILTERS & SEARCH ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStarredOnly, setFilterStarredOnly] = useState(false);
  const [filterExpiringOnly, setFilterExpiringOnly] = useState(false);

  // --- MULTI-SELECT PACK MODE ---
  const [isPackSelectionMode, setIsPackSelectionMode] = useState(false);
  const [selectedPackDocIds, setSelectedPackDocIds] = useState<Set<string>>(new Set());

  // --- MODALS ---
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<LockerDocument | null>(null);
  const [shareDoc, setShareDoc] = useState<LockerDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<LockerDocument | null>(null);
  const [packModalOpen, setPackModalOpen] = useState(false);

  // --- TOASTS ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    StorageService.initialize();
    const user = StorageService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lockerbox_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lockerbox_theme', 'light');
    }
  }, [isDarkMode]);

  // Load user data whenever currentUser changes
  const reloadData = () => {
    if (!currentUser) return;
    setDocuments(StorageService.getDocuments(true)); // load active + deleted
    setVaultFields(StorageService.getVaultFields());
    setShareLinks(StorageService.getShareLinks());
  };

  useEffect(() => {
    if (currentUser) {
      reloadData();
    }
  }, [currentUser]);

  // --- 30-MINUTE INACTIVITY AUTO-LOGOUT ---
  useEffect(() => {
    if (!currentUser) return;

    const handleUserActivity = () => {
      StorageService.recordActivity();
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Periodic check every 20 seconds
    const interval = setInterval(() => {
      const activeUser = StorageService.getCurrentUser();
      if (!activeUser) {
        // Inactivity threshold reached or session expired
        setCurrentUser(null);
        setDocuments([]);
        setVaultFields([]);
        setShareLinks([]);
        setCurrentTab('documents');
        addToast('warning', 'Session Expired', 'You were automatically logged out after 30 minutes of inactivity to protect your documents.');
      }
    }, 20000);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleUserActivity));
      clearInterval(interval);
    };
  }, [currentUser]);

  // --- AUTH GUARD & ROUTE SYNCHRONIZATION ---
  const syncRouteWithState = (user: UserProfile | null) => {
    const hash = window.location.hash.replace('#/', '').replace('#', '').split('?')[0];
    if (!user) {
      // Unauthenticated: any route attempt redirects to /login
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
      return;
    }

    // Authenticated user: map hash to tab or default to dashboard
    if (hash === 'login' || !hash) {
      window.location.hash = '#/dashboard';
      setCurrentTab('documents');
    } else if (hash === 'dashboard') {
      setCurrentTab('documents');
    } else if (hash === 'upload') {
      setCurrentTab('documents');
      setUploadModalOpen(true);
    } else if (hash === 'vault') {
      setCurrentTab('vault');
    } else if (hash === 'settings') {
      setCurrentTab('settings');
    } else if (hash === 'pack') {
      setCurrentTab('pack');
      setPackModalOpen(true);
    } else if (hash === 'shares') {
      setCurrentTab('shares');
    } else if (hash === 'bin') {
      setCurrentTab('bin');
    }
  };

  useEffect(() => {
    syncRouteWithState(currentUser);

    const handleHashChange = () => {
      const activeUser = StorageService.getCurrentUser();
      const hash = window.location.hash.replace('#/', '').replace('#', '').split('?')[0];
      if (!activeUser) {
        if (window.location.hash !== '#/login') {
          window.location.hash = '#/login';
        }
        setCurrentUser(null);
        return;
      }

      if (hash === 'dashboard') {
        setCurrentTab('documents');
      } else if (hash === 'upload') {
        setCurrentTab('documents');
        setUploadModalOpen(true);
      } else if (hash === 'vault') {
        setCurrentTab('vault');
      } else if (hash === 'settings') {
        setCurrentTab('settings');
      } else if (hash === 'pack') {
        setCurrentTab('pack');
        setPackModalOpen(true);
      } else if (hash === 'shares') {
        setCurrentTab('shares');
      } else if (hash === 'bin') {
        setCurrentTab('bin');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  // --- HANDLERS ---
  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setDocuments([]);
    setVaultFields([]);
    setShareLinks([]);
    setIsPinLocked(false);
    setCurrentTab('documents');
    window.location.hash = '#/login';
    addToast('info', 'Signed Out', 'You have been safely signed out. All session tokens cleared.');
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsPinLocked(user.pinEnabled);
    setCurrentTab('documents');
    window.location.hash = '#/dashboard'; // Always redirect to Dashboard on login
  };

  const handleSelectTab = (tab: 'documents' | 'vault' | 'bin' | 'pack' | 'shares' | 'settings') => {
    setCurrentTab(tab);
    if (tab === 'documents') window.location.hash = '#/dashboard';
    else if (tab === 'vault') window.location.hash = '#/vault';
    else if (tab === 'settings') window.location.hash = '#/settings';
    else if (tab === 'pack') {
      window.location.hash = '#/pack';
      setPackModalOpen(true);
    } else if (tab === 'shares') window.location.hash = '#/shares';
    else if (tab === 'bin') window.location.hash = '#/bin';
  };

  const handleToggleStar = (doc: LockerDocument) => {
    StorageService.toggleStarDocument(doc.id);
    reloadData();
    addToast('info', doc.isStarred ? 'Removed from Starred' : 'Starred Document', doc.title);
  };

  const handleToggleQuickAccess = (doc: LockerDocument) => {
    StorageService.toggleQuickAccess(doc.id);
    reloadData();
    addToast('info', doc.isQuickAccess ? 'Removed from Quick Access' : 'Added to Quick Access', doc.title);
  };

  const handleStartDelete = (doc: LockerDocument) => {
    setDocToDelete(doc);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    StorageService.moveToRecycleBin(docToDelete.id);
    reloadData();
    addToast('warning', 'Moved to Recycle Bin', `"${docToDelete.title}" can be restored for 30 days.`);
    setDocToDelete(null);
    if (previewDoc?.id === docToDelete.id) {
      setPreviewDoc(null);
    }
  };

  const handleDownloadDocument = (doc: LockerDocument) => {
    if (doc.dataUrl) {
      const link = document.createElement('a');
      link.href = doc.dataUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('success', 'Download Started', doc.fileName);
    } else {
      // Create synthetic text file download
      const blob = new Blob([`LockerBox Verified Document:\nTitle: ${doc.title}\nCategory: ${doc.category}\nFile: ${doc.fileName}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('success', 'Download Started', doc.fileName);
    }
  };

  const handleToggleSelectPackDoc = (doc: LockerDocument) => {
    setSelectedPackDocIds(prev => {
      const next = new Set(prev);
      if (next.has(doc.id)) next.delete(doc.id);
      else next.add(doc.id);
      return next;
    });
  };

  // --- FILTERED DOCUMENTS COMPUTATION ---
  const activeDocuments = useMemo(() => {
    return documents.filter(d => !d.isDeleted);
  }, [documents]);

  const binDocuments = useMemo(() => {
    return documents.filter(d => d.isDeleted);
  }, [documents]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: activeDocuments.length };
    ALL_CATEGORIES.forEach(c => { counts[c] = 0; });
    activeDocuments.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [activeDocuments]);

  // Filtered & sorted docs
  const filteredDocuments = useMemo(() => {
    return activeDocuments.filter(doc => {
      // Category filter
      if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
        return false;
      }
      // Starred filter
      if (filterStarredOnly && !doc.isStarred) {
        return false;
      }
      // Expiring filter (within 30 days)
      if (filterExpiringOnly) {
        if (!doc.expiryDate) return false;
        const exp = new Date(doc.expiryDate).getTime();
        const now = Date.now();
        const in30Days = now + 30 * 24 * 60 * 60 * 1000;
        if (exp < now || exp > in30Days) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = doc.title.toLowerCase().includes(query);
        const inFileName = doc.fileName.toLowerCase().includes(query);
        const inCategory = doc.category.toLowerCase().includes(query);
        const inTags = doc.tags?.some(t => t.toLowerCase().includes(query));
        const inNotes = doc.notes?.toLowerCase().includes(query);
        const inIssuer = doc.issuer?.toLowerCase().includes(query);
        const inId = doc.credentialId?.toLowerCase().includes(query);
        if (!inTitle && !inFileName && !inCategory && !inTags && !inNotes && !inIssuer && !inId) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'name-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'size-desc') {
        return (b.fileSize || 0) - (a.fileSize || 0);
      }
      if (sortBy === 'size-asc') {
        return (a.fileSize || 0) - (b.fileSize || 0);
      }
      return 0;
    });
  }, [activeDocuments, selectedCategory, filterStarredOnly, filterExpiringOnly, searchQuery, sortBy]);

  // If user is not logged in, show full-screen LoginPage
  if (!currentUser) {
    return (
      <>
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onShowToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Background Soft Animated Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-pink-500/10 blur-[130px] pointer-events-none animate-float-slow -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-teal-500/15 via-blue-500/10 to-indigo-500/15 blur-[140px] pointer-events-none animate-float-reverse -z-10" />
      <div className="fixed top-[40%] right-[30%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-pink-500/10 via-amber-500/10 to-violet-500/10 blur-[120px] pointer-events-none animate-pulse-subtle -z-10" />

      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenAppLock={() => setShowAppLockModal(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onLogout={handleLogout}
        binCount={binDocuments.length}
      />

      {/* Visible Demo Mode Banner (Required by Authentication & Session Rules) */}
      {currentUser.isDemo && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-inner border-b border-amber-500/40">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-black/25 text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
                Demo Mode
              </span>
              <span>
                You are viewing a sample student account (<strong className="font-bold">Alex Rivera • CalTech</strong>) with pre-filled mock data. Real student accounts are strictly isolated.
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-lg bg-black/20 hover:bg-black/35 text-white font-bold transition-colors text-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              Exit Demo Mode & Sign In
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: DOCUMENTS (Default Dashboard) */}
        {currentTab === 'documents' && (
          <div className="space-y-6">
            {/* Quick Stats Gauge Bar */}
            <StatsBar
              onFilterExpiring={() => setFilterExpiringOnly(prev => !prev)}
              onFilterStarred={() => setFilterStarredOnly(prev => !prev)}
              isFilterExpiringActive={filterExpiringOnly}
              isFilterStarredActive={filterStarredOnly}
            />

            {/* Quick Access Row */}
            <QuickAccessRow
              documents={activeDocuments}
              onPreview={(doc) => setPreviewDoc(doc)}
              onDownload={handleDownloadDocument}
            />

            {/* Search & Filter Controls */}
            <div className="p-4 sm:p-5 rounded-3xl glass-card border border-white/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by file name, category, credential ID, or tag..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Right controls: Sort + View switch + Pack mode */}
                <div className="flex items-center gap-2 self-end md:self-auto flex-wrap sm:flex-nowrap">
                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="name-desc">Name (Z-A)</option>
                      <option value="size-desc">Largest Size</option>
                      <option value="size-asc">Smallest Size</option>
                    </select>
                  </div>

                  {/* View Mode (Grid vs List) */}
                  <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Multi-Select Internship Pack Mode Toggle */}
                  <button
                    onClick={() => {
                      if (!isPackSelectionMode) {
                        setIsPackSelectionMode(true);
                      } else {
                        setPackModalOpen(true);
                      }
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isPackSelectionMode
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    {isPackSelectionMode ? `Pack Mode (${selectedPackDocIds.size})` : 'Internship Pack'}
                  </button>

                  {isPackSelectionMode && (
                    <button
                      onClick={() => {
                        setIsPackSelectionMode(false);
                        setSelectedPackDocIds(new Set());
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Exit Selection Mode"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Tabs with live counts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === 'All'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>All Documents</span>
                  <span className="text-[10px] font-mono opacity-70">({categoryCounts['All'] || 0})</span>
                </button>

                {ALL_CATEGORIES.map((cat) => {
                  const theme = CATEGORY_THEMES[cat];
                  const isSelected = selectedCategory === cat;
                  const count = categoryCounts[cat] || 0;

                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} ring-2 ring-indigo-500/20 shadow-xs`
                          : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document Listing: Grid vs List */}
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-20 rounded-3xl glass-card border border-dashed border-slate-300 dark:border-slate-800 p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto mb-4 flex items-center justify-center">
                  <FolderPlus className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-800 dark:text-slate-200">
                  {searchQuery || selectedCategory !== 'All' ? 'No Matching Documents Found' : 'Your LockerBox is Empty'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search keywords, clearing filters, or switching categories.'
                    : 'Securely upload your degree certificates, college IDs, transcripts, or project zip files.'}
                </p>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all cursor-pointer"
                >
                  + Upload First Document
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onPreview={(d) => setPreviewDoc(d)}
                    onDownload={handleDownloadDocument}
                    onShare={(d) => setShareDoc(d)}
                    onDelete={handleStartDelete}
                    onToggleStar={handleToggleStar}
                    onToggleQuickAccess={handleToggleQuickAccess}
                    isPackSelectionMode={isPackSelectionMode}
                    isSelectedForPack={selectedPackDocIds.has(doc.id)}
                    onToggleSelectPack={handleToggleSelectPackDoc}
                  />
                ))}
              </div>
            ) : (
              <DocumentList
                documents={filteredDocuments}
                onPreview={(d) => setPreviewDoc(d)}
                onDownload={handleDownloadDocument}
                onShare={(d) => setShareDoc(d)}
                onDelete={handleStartDelete}
                onToggleStar={handleToggleStar}
                onToggleQuickAccess={handleToggleQuickAccess}
                isPackSelectionMode={isPackSelectionMode}
                selectedDocIds={selectedPackDocIds}
                onToggleSelectPack={handleToggleSelectPackDoc}
              />
            )}
          </div>
        )}

        {/* TAB 2: PERSONAL INFO VAULT */}
        {currentTab === 'vault' && (
          <PersonalInfoVault
            fields={vaultFields}
            onReloadFields={reloadData}
            onShowToast={addToast}
            isPinLocked={isPinLocked}
            onRequestUnlock={() => setShowAppLockModal(true)}
          />
        )}

        {/* TAB 3: RECYCLE BIN */}
        {currentTab === 'bin' && (
          <RecycleBinView
            documents={documents}
            onReload={reloadData}
            onShowToast={addToast}
          />
        )}

        {/* TAB 4: ACTIVE SHARE LINKS */}
        {currentTab === 'shares' && (
          <ShareLinksView
            shareLinks={shareLinks}
            onReload={reloadData}
            onShowToast={addToast}
          />
        )}

        {/* TAB 5: SETTINGS & SECURITY */}
        {currentTab === 'settings' && (
          <SettingsView
            currentUser={currentUser}
            documents={documents}
            onUpdateUser={(updated) => {
              setCurrentUser(prev => prev ? { ...prev, ...updated } : null);
            }}
            onLogout={handleLogout}
            onShowToast={addToast}
          />
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Upload Document Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={(newDoc) => {
          reloadData();
        }}
        onShowToast={addToast}
      />

      {/* Document Detailed Preview Modal */}
      <PreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownloadDocument}
        onShare={(doc) => {
          setPreviewDoc(null);
          setShareDoc(doc);
        }}
        onDelete={(doc) => {
          handleStartDelete(doc);
        }}
        onToggleStar={handleToggleStar}
      />

      {/* Time-Limited Share Link Modal */}
      <ShareModal
        document={shareDoc}
        isOpen={!!shareDoc}
        onClose={() => setShareDoc(null)}
        onShowToast={addToast}
      />

      {/* Internship Pack ZIP Builder Modal */}
      <InternshipPackModal
        isOpen={packModalOpen}
        onClose={() => setPackModalOpen(false)}
        documents={activeDocuments}
        onShowToast={addToast}
      />

      {/* App Lock PIN Modal */}
      <AppLockModal
        isOpen={showAppLockModal}
        onClose={() => setShowAppLockModal(false)}
        onSuccessUnlock={() => {
          setIsPinLocked(false);
          setShowAppLockModal(false);
        }}
        currentUser={currentUser}
        onShowToast={addToast}
      />

      {/* Safe Deletion Confirmation Modal */}
      <DeleteConfirmModal
        document={docToDelete}
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Toasts Feedback Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
