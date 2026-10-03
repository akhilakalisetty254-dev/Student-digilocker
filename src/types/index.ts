export type DocumentCategory = 
  | 'Certificates'
  | 'College ID'
  | 'Notes'
  | 'Projects'
  | 'Marksheets'
  | 'Other';

export type FileType = 'pdf' | 'image' | 'doc' | 'archive' | 'code' | 'other';

export interface LockerDocument {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  fileType: FileType;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  dataUrl?: string; // base64 or inline data
  uploadDate: string; // ISO string
  isStarred: boolean;
  isQuickAccess: boolean;
  expiryDate?: string; // ISO string for certificates/passes
  tags: string[];
  notes?: string;
  isDeleted: boolean;
  deletedAt?: string; // ISO string
  previewText?: string;
  credentialId?: string;
  issuer?: string;
  scoreOrGrade?: string;
}

export type VaultCategory = 'Academic' | 'Identity' | 'Contact' | 'Financial' | 'Personal';

export interface VaultField {
  id: string;
  userId: string;
  label: string;
  value: string;
  category: VaultCategory;
  isSensitive: boolean;
  updatedAt: string;
}

export interface ShareLink {
  id: string;
  userId: string;
  documentId: string;
  documentTitle: string;
  category: DocumentCategory;
  passcode?: string;
  expiresAt: string; // ISO
  viewCount: number;
  maxViews?: number;
  isRevoked: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  college: string;
  major: string;
  graduationYear: string;
  pin: string; // e.g. "1234"
  pinEnabled: boolean;
  securityQuestion: string;
  securityAnswer: string;
  storageLimitBytes: number; // e.g. 2 GB
  isDemo?: boolean;
  isVerified?: boolean;
  verificationCode?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: number;
  lastActivity: number;
  rememberMe: boolean;
  isDemo: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
