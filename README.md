# LockerBox — Student Digital Locker 🎓🔒

**LockerBox** is a private, student-first digital locker and secure credential repository designed for undergraduate, graduate, and trade school students. Students can store, organize, verify, and bundle their university documents, certificates, government IDs, and sensitive personal details in one place.

---

## 🌟 Key Features & Innovations

### 1. Per-User Isolated Authentication & Session Security
- **No Auto-Login**: The app opens strictly on the Login page on every first visit and incognito session. No hardcoded or pre-filled user accounts.
- **Empty-by-Default Forms**: Login inputs start completely blank with show/hide password toggle.
- **Failed Login Rate Limiting**: Enforces a temporary 5-minute security lockout after 5 consecutive incorrect password attempts, displaying an active countdown.
- **Email Verification Guard**: Registration requires entering a 6-digit email confirmation code before initial locker activation.
- **Password Strength Meter**: Real-time evaluation of length, uppercase, numbers, and special symbols during registration.
- **30-Minute Inactivity Auto-Logout**: Automatic background session termination and storage purge if no mouse/keyboard activity is detected for 30 minutes.
- **Remember Me Control**: Unchecked by default; controls whether session persists in `localStorage` or `sessionStorage`.
- **Explicit Demo Mode Banner**: The "Demo Login" button opens a sample student account (**Alex Rivera, CalTech B.S. CS & AI**) with a prominent, persistent **"Demo Mode" banner** and 1-click exit. Never runs automatically.
- **Strict Row-Level Isolation**: Documents, personal info vault items, and recycle bin contents are bound strictly to the active `user.id`. Neither user can inspect or access another user's files.

### 2. Live Dashboard & Document Explorer
- **Quick Stats Bar**:
  - Encrypted total file counter.
  - Storage usage gauge with percentage progress bar (e.g. `24.4 MB / 2.0 GB`).
  - Starred/favorites counter with single-click filtering.
  - 30-day document expiration reminder banner (alerts for expiring passes or bonafides).
- **Quick Access Row**:
  - Pinned carousel of high-frequency cards (Student ID, Campus Bus Pass, Health Insurance, Bonafide Certificate) for instant 1-click preview and campus gate checks.
- **Dual View Modes**:
  - **Grid View**: Vibrant glassmorphic cards with category color accents, file type icons, notes, and tags.
  - **List View**: High-density table with tabular alignment and quick actions.
- **Search & Filter Suite**:
  - Live full-text search across document title, filename, category, tags, issuer, and credential ID.
  - Category filters with real-time counters:
    - 🥇 **Certificates** (Gold)
    - 🟦 **College ID** (Blue)
    - 🟩 **Notes** (Green)
    - 🟪 **Projects** (Purple)
    - 🟧 **Marksheets** (Orange)
    - 🌸 **Other** (Pink)
  - Sorting: Date added (newest/oldest), title (A-Z/Z-A), and file size (largest/smallest).

### 3. Drag-and-Drop Upload Center
- Prominent glowing gradient `+ Upload Document` button.
- Drag-and-drop zone and native file picker supporting PDFs, PNGs, JPGs, DOCX, and ZIP archives.
- Automatic file type detection and real-time client-side preview rendering.
- Metadata fields: Title, category, tags, notes, issuing authority, credential ID, validity/expiration date.
- Animated simulated upload progress bar with 25 MB file size limit validation and duplicate file detection.

### 4. High-Fidelity Document Preview Modal
- Full-screen modal inspector supporting image previews, generated cryptographic document seals, and verification certificates.
- Metadata inspector showing file size, MIME type, upload timestamp, validity date, issuing authority, and grades.
- Quick actions: Direct file download, link sharing, starring, and deletion.

### 5. Personal Info Vault with Masked Fields
- Masked sensitive records:
  - Student Roll Number
  - University Registration ID
  - Current CGPA / Percentage
  - Government ID / SSN / Aadhaar
  - PAN / Tax ID
  - Blood Group & Emergency Guardian Contacts
- Single-click **"Reveal"** (`••••••••••••` ↔ text) and **"Copy to Clipboard"** with animated toast confirmation.
- Category filters: Academic, Identity, Contact, Financial, Personal.
- Ability to add, edit, and delete custom fields.

### 6. Security PIN App Lock
- 4-digit PIN keypad to safeguard sensitive government and financial IDs.
- Quick lock button in the top navigation bar.
- Security question recovery flow (e.g., answer high school teacher's name to reset forgotten PIN).

### 7. Internship-Ready Pack (ZIP Bundler)
- Multi-select documents directly from the locker.
- Instant 1-click presets:
  - **Job / Internship Pack**: Certificates + Marksheets + College ID + Capstone.
  - **Scholarship Pack**: Transcripts + Bonafide + ID.
- Real client-side `.zip` bundle generation using `JSZip`, including an automated `README_MANIFEST.txt` indexing all files and credentials.
- Celebration confetti upon successful compilation!

### 8. Time-Limited Secure Share Links
- Generate temporary, revocable sharing links with custom expiration windows:
  - 1 Hour
  - 24 Hours
  - 7 Days
- Optional 4-digit passcode protection.
- Dedicated "Share Links" management dashboard allowing instant link revocation.
- Simulated recipient view for testing what external reviewers or employers see.

### 9. 30-Day Safe Recycle Bin
- Prevents accidental document loss with a soft-delete mechanism.
- 30-day retention countdown on each deleted document.
- One-click "Restore to Locker" and "Delete Forever" actions.
- "Empty Recycle Bin" mass purge option.

### 10. Dark Mode & Visual Styling
- Dark mode toggle with neon-glow accents and dark slate glass cards.
- Google Fonts: **Outfit** (headings) + **Plus Jakarta Sans** (body) + **JetBrains Mono** (tabular numbers and IDs).
- Soft animated background blobs (purple → blue → teal → pink) with frosted glass cards.

---

## 🗄️ Database Schema & Security Architecture

### Relational Schema (PostgreSQL / SQLite Equivalent)

```sql
-- 1. Users Table
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  college VARCHAR(255) NOT NULL,
  major VARCHAR(255) NOT NULL,
  graduation_year VARCHAR(16) NOT NULL DEFAULT '2026',
  pin_hash VARCHAR(128) NOT NULL,
  pin_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  security_question TEXT NOT NULL,
  security_answer_hash VARCHAR(128) NOT NULL,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 2147483648, -- 2 GB
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Documents Table (with Row-Level Isolation)
CREATE TABLE documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(32) NOT NULL CHECK (category IN ('Certificates', 'College ID', 'Notes', 'Projects', 'Marksheets', 'Other')),
  file_type VARCHAR(16) NOT NULL CHECK (file_type IN ('pdf', 'image', 'doc', 'archive', 'code', 'other')),
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  data_url TEXT, -- Base64 storage or object storage URI (S3 / Cloud Storage)
  upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_starred BOOLEAN NOT NULL DEFAULT FALSE,
  is_quick_access BOOLEAN NOT NULL DEFAULT FALSE,
  expiry_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  issuer VARCHAR(255),
  credential_id VARCHAR(128),
  score_or_grade VARCHAR(64),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- Row-Level Security Policy for Documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_documents_isolation ON documents
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- 3. Personal Info Vault Table
CREATE TABLE vault_fields (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(128) NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(32) NOT NULL CHECK (category IN ('Academic', 'Identity', 'Contact', 'Financial', 'Personal')),
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vault_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_vault_isolation ON vault_fields
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));

-- 4. Time-Limited Share Links Table
CREATE TABLE share_links (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id VARCHAR(64) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  passcode VARCHAR(32),
  expires_at TIMESTAMPTZ NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  max_views INTEGER,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_share_links_isolation ON share_links
  FOR ALL
  USING (user_id = current_setting('app.current_user_id', true));
```

---

## 🚀 Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Run TypeScript Verification & Linting**:
   ```bash
   npm run lint
   ```

---

## 🔑 Demo Account Credentials

- **Email**: `alex.rivera@techuniv.edu`
- **Password**: *(Any password in demo mode, or click **"Demo Login"** on the landing screen)*
- **Security PIN**: `1234`
- **Security Answer**: `Vanderbilt`

---

## 🔮 Future Roadmap & Improvements

1. **Biometric WebAuthn Unlock**: Add Touch ID / Face ID fingerprint authentication for device-native rapid locker opening.
2. **Official OCR Text Extraction**: Automatic scanning of uploaded marksheets and degree certificates to auto-populate GPA, issue dates, and roll numbers using on-device Tesseract.js.
3. **University Registrar Webhooks**: Direct verifiable credential verification through W3C Decentralized Identifiers (DID) and Open Badges.
4. **Offline PWA Service Worker**: Full offline caching of high-frequency transit and ID cards so students can show their pass even with zero cell connectivity on the subway.
