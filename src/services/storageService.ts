import { 
  LockerDocument, 
  UserProfile, 
  VaultField, 
  ShareLink, 
  DocumentCategory,
  FileType,
  UserSession
} from '../types';
import { DEMO_USER, INITIAL_DEMO_DOCUMENTS, INITIAL_DEMO_VAULT } from './demoData';

const SESSION_STORAGE_KEY = 'lockerbox_active_session';
const LOCAL_SESSION_KEY = 'lockerbox_saved_session';
const FAILED_ATTEMPTS_KEY = 'lockerbox_failed_logins';
const USERS_INDEX_KEY = 'lockerbox_users_list';
const DOCS_PREFIX = 'lockerbox_docs_';
const VAULT_PREFIX = 'lockerbox_vault_';
const SHARES_PREFIX = 'lockerbox_shares_';

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 5 * 60 * 1000; // 5 minutes lockout

// Helper to determine file type from extension/mime
export function detectFileType(fileName: string, mimeType?: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['pdf'].includes(ext) || mimeType?.includes('pdf')) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp'].includes(ext) || mimeType?.startsWith('image/')) return 'image';
  if (['doc', 'docx', 'odt', 'rtf', 'txt', 'md'].includes(ext) || mimeType?.includes('word') || mimeType?.includes('text')) return 'doc';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mimeType?.includes('zip') || mimeType?.includes('compressed')) return 'archive';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'sql'].includes(ext)) return 'code';
  return 'other';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const StorageService = {
  // --- AUTH & USER CATALOG (Strictly No Auto-Login) ---
  initialize(): void {
    try {
      const usersRaw = localStorage.getItem(USERS_INDEX_KEY);
      let users: UserProfile[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      const demoExists = users.some(u => u.id === DEMO_USER.id);
      if (!demoExists) {
        users.push(DEMO_USER);
        localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
        
        // Seed demo docs if not present for when user chooses Demo Login
        if (!localStorage.getItem(DOCS_PREFIX + DEMO_USER.id)) {
          localStorage.setItem(DOCS_PREFIX + DEMO_USER.id, JSON.stringify(INITIAL_DEMO_DOCUMENTS));
        }
        // Seed demo vault if not present
        if (!localStorage.getItem(VAULT_PREFIX + DEMO_USER.id)) {
          localStorage.setItem(VAULT_PREFIX + DEMO_USER.id, JSON.stringify(INITIAL_DEMO_VAULT));
        }
      }

      // Clean up any legacy auto-login keys from earlier drafts
      localStorage.removeItem('lockerbox_current_user_id');

      // Check current session validity (if any exists)
      const session = this.getActiveSession();
      if (!session) {
        // No valid session, ensure session storage is clean
        this.logout();
      }
    } catch (e) {
      console.error('StorageService init error:', e);
    }
  },

  getActiveSession(): UserSession | null {
    try {
      // Check session storage first (for normal sessions), then localStorage (for Remember Me)
      const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(LOCAL_SESSION_KEY);
      if (!rawSession) return null;

      const session: UserSession = JSON.parse(rawSession);
      const now = Date.now();

      // Enforce 30-minute inactivity auto-logout
      if (now - session.lastActivity > INACTIVITY_TIMEOUT_MS) {
        this.logout();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  recordActivity(): void {
    try {
      const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (rawSession) {
        const session: UserSession = JSON.parse(rawSession);
        session.lastActivity = Date.now();
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        return;
      }

      const rawLocal = localStorage.getItem(LOCAL_SESSION_KEY);
      if (rawLocal) {
        const session: UserSession = JSON.parse(rawLocal);
        session.lastActivity = Date.now();
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
      }
    } catch (e) {
      console.error('Failed to update activity timestamp', e);
    }
  },

  getCurrentUser(): UserProfile | null {
    try {
      const session = this.getActiveSession();
      if (!session) return null;

      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const user = users.find(u => u.id === session.userId);
      if (!user) {
        this.logout();
        return null;
      }

      return {
        ...user,
        isDemo: session.isDemo
      };
    } catch {
      return null;
    }
  },

  // Rate Limiting on Failed Logins
  checkRateLimit(email: string): { isLocked: boolean; remainingSeconds: number; attempts: number } {
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      const attemptsMap: Record<string, { count: number; lastFailed: number }> = raw ? JSON.parse(raw) : {};
      const key = email.toLowerCase().trim();
      const record = attemptsMap[key];

      if (!record) return { isLocked: false, remainingSeconds: 0, attempts: 0 };

      const timePassed = Date.now() - record.lastFailed;
      if (record.count >= MAX_FAILED_ATTEMPTS) {
        if (timePassed < LOCKOUT_TIME_MS) {
          const remainingSeconds = Math.ceil((LOCKOUT_TIME_MS - timePassed) / 1000);
          return { isLocked: true, remainingSeconds, attempts: record.count };
        } else {
          // Lockout expired, reset attempts
          delete attemptsMap[key];
          localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptsMap));
          return { isLocked: false, remainingSeconds: 0, attempts: 0 };
        }
      }

      return { isLocked: false, remainingSeconds: 0, attempts: record.count };
    } catch {
      return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    }
  },

  recordFailedAttempt(email: string): number {
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      const attemptsMap: Record<string, { count: number; lastFailed: number }> = raw ? JSON.parse(raw) : {};
      const key = email.toLowerCase().trim();
      const count = (attemptsMap[key]?.count || 0) + 1;
      attemptsMap[key] = { count, lastFailed: Date.now() };
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptsMap));
      return count;
    } catch {
      return 1;
    }
  },

  clearFailedAttempts(email: string): void {
    try {
      const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
      if (!raw) return;
      const attemptsMap: Record<string, { count: number; lastFailed: number }> = JSON.parse(raw);
      delete attemptsMap[email.toLowerCase().trim()];
      localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(attemptsMap));
    } catch (e) {
      console.error(e);
    }
  },

  // Explicit Demo Login (Only executed on button click)
  loginDemoUser(): UserProfile {
    this.initialize();
    const session: UserSession = {
      token: 'sess_demo_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      userId: DEMO_USER.id,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      rememberMe: false,
      isDemo: true
    };

    // Demo session is stored in sessionStorage only
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem(LOCAL_SESSION_KEY);

    return {
      ...DEMO_USER,
      isDemo: true
    };
  },

  loginWithEmail(
    email: string, 
    passwordAttempt: string, 
    rememberMe = false
  ): { 
    success: boolean; 
    user?: UserProfile; 
    message?: string;
    isUnverified?: boolean;
    verificationCode?: string;
  } {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !passwordAttempt) {
      return { success: false, message: 'Please enter both your email address and password.' };
    }

    // Rate Limit Check
    const rateStatus = this.checkRateLimit(cleanEmail);
    if (rateStatus.isLocked) {
      return { 
        success: false, 
        message: `Too many failed attempts. Security lockout active for ${rateStatus.remainingSeconds} more seconds.` 
      };
    }

    try {
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const user = users.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        const attempts = this.recordFailedAttempt(cleanEmail);
        const remaining = MAX_FAILED_ATTEMPTS - attempts;
        return { 
          success: false, 
          message: remaining > 0 
            ? `No account found with this email. (${remaining} attempts remaining before temporary lockout)`
            : `Too many failed attempts. Account locked for 5 minutes.`
        };
      }

      // Check Password
      const isDemoAccount = user.id === DEMO_USER.id;
      const expectedPassword = user.password || (isDemoAccount ? 'StudentDemo@2026' : '');

      if (expectedPassword && passwordAttempt !== expectedPassword && !isDemoAccount) {
        const attempts = this.recordFailedAttempt(cleanEmail);
        const remaining = MAX_FAILED_ATTEMPTS - attempts;
        return { 
          success: false, 
          message: remaining > 0 
            ? `Incorrect password. (${remaining} attempts remaining before temporary lockout)`
            : `Too many failed attempts. Account locked for 5 minutes.`
        };
      }

      // Check Email Verification
      if (user.isVerified === false) {
        return { 
          success: false, 
          isUnverified: true,
          verificationCode: user.verificationCode,
          message: 'Please verify your university email before logging in.' 
        };
      }

      // Login Successful: Clear failed attempts
      this.clearFailedAttempts(cleanEmail);

      const session: UserSession = {
        token: 'sess_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
        userId: user.id,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        rememberMe,
        isDemo: !!user.isDemo
      };

      if (rememberMe) {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }

      return { 
        success: true, 
        user: { ...user, isDemo: !!user.isDemo } 
      };
    } catch (e) {
      return { success: false, message: 'Authentication error. Please try again.' };
    }
  },

  registerUser(details: { 
    name: string; 
    email: string; 
    password: string;
    college: string; 
    major: string; 
    pin?: string;
  }): { 
    success: boolean; 
    user?: UserProfile; 
    verificationCode?: string;
    message?: string;
  } {
    try {
      const cleanEmail = details.email.toLowerCase().trim();
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      
      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: 'An account with this email address already exists.' };
      }

      if (details.password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters long.' };
      }

      // Generate a 6-digit numeric verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser: UserProfile = {
        id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        name: details.name.trim(),
        email: cleanEmail,
        password: details.password,
        college: details.college.trim() || 'University Student',
        major: details.major.trim() || 'General Studies',
        graduationYear: '2026',
        pin: details.pin || '1234',
        pinEnabled: true,
        securityQuestion: "What is your primary school's name?",
        securityAnswer: 'Elementary',
        storageLimitBytes: 2 * 1024 * 1024 * 1024, // 2 GB
        isDemo: false,
        isVerified: false,
        verificationCode
      };

      users.push(newUser);
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));

      // Starter documents for this unique user
      const starterDoc: LockerDocument = {
        id: 'doc_welcome_' + Date.now(),
        userId: newUser.id,
        title: 'Welcome to Your LockerBox Student Vault',
        category: 'Other',
        fileType: 'pdf',
        fileName: 'LockerBox_Welcome_Guide.pdf',
        fileSize: 185000,
        mimeType: 'application/pdf',
        uploadDate: new Date().toISOString(),
        isStarred: true,
        isQuickAccess: true,
        tags: ['guide', 'welcome'],
        notes: `Welcome, ${newUser.name}! Your private encrypted locker is ready. Only you have access to your uploaded files.`,
        isDeleted: false
      };
      localStorage.setItem(DOCS_PREFIX + newUser.id, JSON.stringify([starterDoc]));

      // Starter vault items for this unique user
      const starterVault: VaultField[] = [
        {
          id: 'v_' + Date.now() + '_1',
          userId: newUser.id,
          label: 'Student Registration / Roll ID',
          value: 'STU-' + Math.floor(100000 + Math.random() * 900000),
          category: 'Academic',
          isSensitive: false,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'v_' + Date.now() + '_2',
          userId: newUser.id,
          label: 'Primary Campus Email',
          value: newUser.email,
          category: 'Contact',
          isSensitive: false,
          updatedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(VAULT_PREFIX + newUser.id, JSON.stringify(starterVault));

      return { 
        success: true, 
        user: newUser, 
        verificationCode 
      };
    } catch (e) {
      return { success: false, message: 'Registration failed. Please check inputs.' };
    }
  },

  verifyEmailCode(email: string, enteredCode: string): { success: boolean; message?: string } {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
      }

      const user = users[userIndex];
      if (user.verificationCode !== enteredCode.trim()) {
        return { success: false, message: 'Invalid verification code. Please check and try again.' };
      }

      user.isVerified = true;
      user.verificationCode = undefined;
      users[userIndex] = user;
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));

      return { success: true };
    } catch {
      return { success: false, message: 'Verification error.' };
    }
  },

  resendVerificationCode(email: string): { success: boolean; code?: string; message?: string } {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      if (userIndex === -1) {
        return { success: false, message: 'User not found.' };
      }

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      users[userIndex].verificationCode = newCode;
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));

      return { success: true, code: newCode };
    } catch {
      return { success: false, message: 'Failed to resend code.' };
    }
  },

  // Password Recovery Flow
  getSecurityQuestionForEmail(email: string): { success: boolean; question?: string; message?: string } {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const user = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return { success: false, message: 'No registered student account matches this email.' };
      }
      return { success: true, question: user.securityQuestion };
    } catch {
      return { success: false, message: 'Error retrieving security details.' };
    }
  },

  resetPasswordWithSecurityAnswer(
    email: string, 
    answer: string, 
    newPassword: string
  ): { success: boolean; message?: string } {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      if (userIndex === -1) {
        return { success: false, message: 'Account not found.' };
      }

      const user = users[userIndex];
      if (user.securityAnswer.toLowerCase().trim() !== answer.toLowerCase().trim()) {
        return { success: false, message: 'Incorrect security answer.' };
      }

      if (newPassword.length < 8) {
        return { success: false, message: 'New password must be at least 8 characters.' };
      }

      user.password = newPassword;
      users[userIndex] = user;
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));

      // Reset any lockout for this email
      this.clearFailedAttempts(cleanEmail);

      return { success: true };
    } catch {
      return { success: false, message: 'Password reset failed.' };
    }
  },

  // Logout clears session token and active state
  logout(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem('lockerbox_current_user_id');
  },

  updateUserProfile(updated: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const users: UserProfile[] = JSON.parse(localStorage.getItem(USERS_INDEX_KEY) || '[]');
    const index = users.findIndex(u => u.id === current.id);
    if (index === -1) return null;
    const merged = { ...users[index], ...updated };
    users[index] = merged;
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users));
    return merged;
  },

  // --- DOCUMENTS (Per-User Scoped) ---
  getDocuments(includeDeleted = false): LockerDocument[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];
      // strictly return this user's docs
      return docs.filter(d => d.userId === user.id && (includeDeleted ? true : !d.isDeleted));
    } catch {
      return [];
    }
  },

  getRecycleBinDocuments(): LockerDocument[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];
      return docs.filter(d => d.userId === user.id && d.isDeleted);
    } catch {
      return [];
    }
  },

  checkDuplicateFileName(fileName: string, excludeId?: string): boolean {
    const activeDocs = this.getDocuments(false);
    return activeDocs.some(d => d.fileName.toLowerCase() === fileName.toLowerCase() && d.id !== excludeId);
  },

  saveDocument(docData: Omit<LockerDocument, 'id' | 'userId' | 'uploadDate' | 'isDeleted'>): { success: boolean; doc?: LockerDocument; message?: string } {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'You must be logged in to save documents.' };

    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];

      // Check storage quota
      const currentUsed = docs.reduce((acc, d) => (!d.isDeleted ? acc + (d.fileSize || 0) : acc), 0);
      if (currentUsed + docData.fileSize > user.storageLimitBytes) {
        return { success: false, message: 'Storage limit exceeded (2 GB capacity). Delete older files to free space.' };
      }

      const newDoc: LockerDocument = {
        ...docData,
        id: 'doc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        uploadDate: new Date().toISOString(),
        isDeleted: false
      };

      docs.unshift(newDoc);
      localStorage.setItem(DOCS_PREFIX + user.id, JSON.stringify(docs));
      return { success: true, doc: newDoc };
    } catch (e) {
      return { success: false, message: 'Failed to save document. Storage may be full.' };
    }
  },

  updateDocument(id: string, updates: Partial<LockerDocument>): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];
      const index = docs.findIndex(d => d.id === id && d.userId === user.id);
      if (index === -1) return false;

      docs[index] = { ...docs[index], ...updates };
      localStorage.setItem(DOCS_PREFIX + user.id, JSON.stringify(docs));
      return true;
    } catch {
      return false;
    }
  },

  toggleStarDocument(id: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const docs = this.getDocuments(true);
    const doc = docs.find(d => d.id === id);
    if (!doc) return false;
    return this.updateDocument(id, { isStarred: !doc.isStarred });
  },

  toggleQuickAccess(id: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const docs = this.getDocuments(true);
    const doc = docs.find(d => d.id === id);
    if (!doc) return false;
    return this.updateDocument(id, { isQuickAccess: !doc.isQuickAccess });
  },

  moveToRecycleBin(id: string): boolean {
    return this.updateDocument(id, { 
      isDeleted: true, 
      deletedAt: new Date().toISOString(),
      isQuickAccess: false 
    });
  },

  restoreFromRecycleBin(id: string): boolean {
    return this.updateDocument(id, { 
      isDeleted: false, 
      deletedAt: undefined 
    });
  },

  permanentlyDeleteDocument(id: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];
      const filtered = docs.filter(d => !(d.id === id && d.userId === user.id));
      localStorage.setItem(DOCS_PREFIX + user.id, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  emptyRecycleBin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const raw = localStorage.getItem(DOCS_PREFIX + user.id);
      const docs: LockerDocument[] = raw ? JSON.parse(raw) : [];
      const kept = docs.filter(d => !d.isDeleted || d.userId !== user.id);
      localStorage.setItem(DOCS_PREFIX + user.id, JSON.stringify(kept));
      return true;
    } catch {
      return false;
    }
  },

  // --- STATS ---
  getStorageStats() {
    const user = this.getCurrentUser();
    const docs = this.getDocuments(false);
    const totalFiles = docs.length;
    const totalBytes = docs.reduce((acc, d) => acc + (d.fileSize || 0), 0);
    const limitBytes = user?.storageLimitBytes || (2 * 1024 * 1024 * 1024);
    const percentage = Math.min(100, Math.round((totalBytes / limitBytes) * 100));
    
    // Expiring soon (within 30 days)
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSoonDocs = docs.filter(d => {
      if (!d.expiryDate) return false;
      const exp = new Date(d.expiryDate);
      return exp >= now && exp <= in30Days;
    });

    const expiredDocs = docs.filter(d => {
      if (!d.expiryDate) return false;
      return new Date(d.expiryDate) < now;
    });

    const starredCount = docs.filter(d => d.isStarred).length;

    return {
      totalFiles,
      totalBytes,
      formattedUsed: formatBytes(totalBytes),
      formattedLimit: formatBytes(limitBytes),
      percentage,
      starredCount,
      expiringSoonCount: expiringSoonDocs.length,
      expiringSoonDocs,
      expiredCount: expiredDocs.length
    };
  },

  // --- PERSONAL INFO VAULT (Per-User Scoped) ---
  getVaultFields(): VaultField[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    try {
      const raw = localStorage.getItem(VAULT_PREFIX + user.id);
      const fields: VaultField[] = raw ? JSON.parse(raw) : [];
      return fields.filter(f => f.userId === user.id);
    } catch {
      return [];
    }
  },

  saveVaultField(fieldData: Omit<VaultField, 'id' | 'userId' | 'updatedAt'>): VaultField | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    try {
      const raw = localStorage.getItem(VAULT_PREFIX + user.id);
      const fields: VaultField[] = raw ? JSON.parse(raw) : [];
      const newField: VaultField = {
        ...fieldData,
        id: 'v_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        updatedAt: new Date().toISOString()
      };
      fields.push(newField);
      localStorage.setItem(VAULT_PREFIX + user.id, JSON.stringify(fields));
      return newField;
    } catch {
      return null;
    }
  },

  updateVaultField(id: string, updates: Partial<VaultField>): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const raw = localStorage.getItem(VAULT_PREFIX + user.id);
      const fields: VaultField[] = raw ? JSON.parse(raw) : [];
      const idx = fields.findIndex(f => f.id === id && f.userId === user.id);
      if (idx === -1) return false;
      fields[idx] = { ...fields[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(VAULT_PREFIX + user.id, JSON.stringify(fields));
      return true;
    } catch {
      return false;
    }
  },

  deleteVaultField(id: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const raw = localStorage.getItem(VAULT_PREFIX + user.id);
      const fields: VaultField[] = raw ? JSON.parse(raw) : [];
      const filtered = fields.filter(f => !(f.id === id && f.userId === user.id));
      localStorage.setItem(VAULT_PREFIX + user.id, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  // --- TIME-LIMITED SHARE LINKS ---
  getShareLinks(): ShareLink[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    try {
      const raw = localStorage.getItem(SHARES_PREFIX + user.id);
      const links: ShareLink[] = raw ? JSON.parse(raw) : [];
      return links.filter(l => l.userId === user.id);
    } catch {
      return [];
    }
  },

  createShareLink(docId: string, hoursValid: number, passcode?: string): ShareLink | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const doc = this.getDocuments().find(d => d.id === docId);
    if (!doc) return null;

    try {
      const links = this.getShareLinks();
      const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000).toISOString();
      const newLink: ShareLink = {
        id: 'sh_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        documentId: doc.id,
        documentTitle: doc.title,
        category: doc.category,
        passcode: passcode?.trim() || undefined,
        expiresAt,
        viewCount: 0,
        isRevoked: false,
        createdAt: new Date().toISOString()
      };
      links.unshift(newLink);
      localStorage.setItem(SHARES_PREFIX + user.id, JSON.stringify(links));
      return newLink;
    } catch {
      return null;
    }
  },

  revokeShareLink(shareId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    try {
      const links = this.getShareLinks();
      const link = links.find(l => l.id === shareId);
      if (!link) return false;
      link.isRevoked = true;
      localStorage.setItem(SHARES_PREFIX + user.id, JSON.stringify(links));
      return true;
    } catch {
      return false;
    }
  },

  // --- SECURITY PIN CHECK & RECOVERY ---
  verifyPin(pinAttempt: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.pin === pinAttempt;
  },

  resetPinWithSecurityAnswer(answerAttempt: string, newPin: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.securityAnswer.toLowerCase().trim() === answerAttempt.toLowerCase().trim()) {
      this.updateUserProfile({ pin: newPin });
      return true;
    }
    return false;
  }
};
