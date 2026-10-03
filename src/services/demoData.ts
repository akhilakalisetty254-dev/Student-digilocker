import { LockerDocument, UserProfile, VaultField } from '../types';

// Helper to create an SVG Data URL preview for student docs
export function createSvgDocPreview(title: string, subtitle: string, badge: string, color: string, iconType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#grad)" rx="16" />
    <rect x="20" y="20" width="560" height="360" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6,6" rx="12" />
    
    <!-- Header band -->
    <rect x="40" y="40" width="520" height="50" rx="8" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.05))" />
    <circle cx="70" cy="65" r="14" fill="${color}" />
    <text x="70" y="70" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">LB</text>
    <text x="96" y="70" font-family="sans-serif" font-weight="700" font-size="14" fill="#1e293b">LOCKERBOX VERIFIED DOCUMENT</text>
    <rect x="440" y="52" width="105" height="26" rx="13" fill="url(#badgeGrad)" />
    <text x="492" y="69" font-family="sans-serif" font-weight="bold" font-size="11" fill="#ffffff" text-anchor="middle">${badge}</text>

    <!-- Content area -->
    <text x="50" y="145" font-family="sans-serif" font-weight="800" font-size="22" fill="#0f172a">${title.slice(0, 36)}</text>
    <text x="50" y="175" font-family="sans-serif" font-weight="500" font-size="14" fill="#64748b">${subtitle.slice(0, 50)}</text>
    
    <!-- Detail grid lines -->
    <line x1="50" y1="205" x2="550" y2="205" stroke="#e2e8f0" stroke-width="1.5" />
    
    <text x="50" y="240" font-family="sans-serif" font-weight="600" font-size="12" fill="#94a3b8">ISSUING AUTHORITY</text>
    <text x="50" y="265" font-family="sans-serif" font-weight="700" font-size="15" fill="#334155">Stanford Tech Institute • Academic Registrar</text>
    
    <text x="360" y="240" font-family="sans-serif" font-weight="600" font-size="12" fill="#94a3b8">DOCUMENT ID</text>
    <text x="360" y="265" font-family="monospace" font-weight="700" font-size="14" fill="#334155">LB-2026-${Math.floor(Math.random()*89999 + 10000)}</text>
    
    <!-- Footer stamp -->
    <rect x="50" y="300" width="500" height="55" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
    <circle cx="80" cy="327" r="16" fill="${color}" fill-opacity="0.2" />
    <text x="80" y="332" font-family="sans-serif" font-weight="bold" font-size="14" fill="${color}" text-anchor="middle">✓</text>
    <text x="110" y="323" font-family="sans-serif" font-weight="600" font-size="13" fill="#1e293b">Encrypted in Student Vault</text>
    <text x="110" y="341" font-family="sans-serif" font-weight="400" font-size="11" fill="#64748b">Verified on chain • LockerBox 256-bit Secure Storage</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const DEMO_USER: UserProfile = {
  id: 'usr_alex_rivera',
  name: 'Alex Rivera',
  email: 'alex.rivera@techuniv.edu',
  password: 'StudentDemo@2026',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  college: 'California Institute of Technology',
  major: 'B.S. Computer Science & AI',
  graduationYear: '2026',
  pin: '1234',
  pinEnabled: true,
  securityQuestion: "What is your favorite high school teacher's last name?",
  securityAnswer: 'Vanderbilt',
  storageLimitBytes: 2 * 1024 * 1024 * 1024, // 2 GB
  isDemo: true,
  isVerified: true
};

export const INITIAL_DEMO_DOCUMENTS: LockerDocument[] = [
  {
    id: 'doc_cert_aws',
    userId: 'usr_alex_rivera',
    title: 'AWS Certified Cloud Practitioner Certificate',
    category: 'Certificates',
    fileType: 'pdf',
    fileName: 'AWS_Cloud_Practitioner_Alex_Rivera.pdf',
    fileSize: 1420500,
    mimeType: 'application/pdf',
    uploadDate: '2026-02-14T10:30:00.000Z',
    isStarred: true,
    isQuickAccess: true,
    expiryDate: '2029-02-14T23:59:59.000Z',
    tags: ['aws', 'cloud', 'certification', 'internship-pack'],
    notes: 'Validation number: AWS-CP-9812401. Verified through Amazon Web Services Credential Registry.',
    isDeleted: false,
    issuer: 'Amazon Web Services Inc.',
    credentialId: 'AWS-CP-9812401',
    scoreOrGrade: 'Score: 890 / 1000',
    dataUrl: createSvgDocPreview('AWS Certified Cloud Practitioner', 'Validation: AWS-CP-9812401', 'CERTIFIED', '#f59e0b', 'award')
  },
  {
    id: 'doc_id_student',
    userId: 'usr_alex_rivera',
    title: 'CalTech Official Student ID Card (2024-2026)',
    category: 'College ID',
    fileType: 'image',
    fileName: 'Student_ID_Card_Front_Back.png',
    fileSize: 1145000,
    mimeType: 'image/png',
    uploadDate: '2026-01-08T09:15:00.000Z',
    isStarred: true,
    isQuickAccess: true,
    expiryDate: '2026-06-30T23:59:59.000Z',
    tags: ['id-card', 'college', 'campus-entry', 'quick-access'],
    notes: 'Required for campus library, dining hall RFID, and tech lab 24/7 access.',
    isDeleted: false,
    issuer: 'Office of the Registrar',
    credentialId: 'STUDENT-2022-CS-4089',
    dataUrl: createSvgDocPreview('STUDENT IDENTITY CARD', 'CalTech Division of Engineering & Applied Science', 'VALID ID', '#3b82f6', 'id')
  },
  {
    id: 'doc_id_metro',
    userId: 'usr_alex_rivera',
    title: 'Metro & Regional Student Transit Transit Pass',
    category: 'College ID',
    fileType: 'pdf',
    fileName: 'Metro_Transit_Pass_Spring2026.pdf',
    fileSize: 420800,
    mimeType: 'application/pdf',
    uploadDate: '2026-01-10T14:20:00.000Z',
    isStarred: true,
    isQuickAccess: true,
    expiryDate: '2026-10-31T23:59:59.000Z',
    tags: ['transit', 'bus-pass', 'commute', 'expiring-soon'],
    notes: 'Subsidized semester transit card. Valid on metro red line and university shuttle bus routes.',
    isDeleted: false,
    issuer: 'Metro Transit Authority & CalTech',
    credentialId: 'TAP-94301-2026',
    dataUrl: createSvgDocPreview('METRO STUDENT TRANSIT PASS', 'All-Zone Spring 2026 Pass', 'TRANSIT', '#2563eb', 'transit')
  },
  {
    id: 'doc_mark_sem6',
    userId: 'usr_alex_rivera',
    title: 'Semester 6 Official Academic Transcript & Grade Sheet',
    category: 'Marksheets',
    fileType: 'pdf',
    fileName: 'Semester_6_Official_Transcript.pdf',
    fileSize: 780000,
    mimeType: 'application/pdf',
    uploadDate: '2026-03-01T11:45:00.000Z',
    isStarred: true,
    isQuickAccess: false,
    tags: ['transcripts', 'grades', 'internship-pack', 'semester-6'],
    notes: 'Semester GPA: 3.94. Dean’s Honors List. Includes Advanced Algorithms and Operating Systems.',
    isDeleted: false,
    issuer: 'Academic Affairs Council',
    scoreOrGrade: 'GPA: 3.94 / 4.00 (Dean’s List)',
    credentialId: 'TR-SEM6-9921',
    dataUrl: createSvgDocPreview('OFFICIAL TRANSCRIPT - SEM 6', 'GPA: 3.94 • 24 Credit Units Completed', 'GRADE: A', '#f97316', 'grade')
  },
  {
    id: 'doc_mark_sem5',
    userId: 'usr_alex_rivera',
    title: 'Semester 5 Official Grade Sheet',
    category: 'Marksheets',
    fileType: 'pdf',
    fileName: 'Semester_5_Grade_Sheet.pdf',
    fileSize: 640000,
    mimeType: 'application/pdf',
    uploadDate: '2025-10-15T16:00:00.000Z',
    isStarred: false,
    isQuickAccess: false,
    tags: ['transcripts', 'grades', 'semester-5'],
    notes: 'Cumulative GPA: 3.90. Courses in Database Systems and Computer Networks.',
    isDeleted: false,
    issuer: 'Academic Affairs Council',
    scoreOrGrade: 'GPA: 3.90 / 4.00',
    credentialId: 'TR-SEM5-8419',
    dataUrl: createSvgDocPreview('OFFICIAL TRANSCRIPT - SEM 5', 'Cumulative GPA: 3.90', 'GRADE: A', '#ea580c', 'grade')
  },
  {
    id: 'doc_cert_hackathon',
    userId: 'usr_alex_rivera',
    title: 'HackMIT 2025 First Place - AI Hardware Track',
    category: 'Certificates',
    fileType: 'image',
    fileName: 'HackMIT_FirstPlace_Award_Certificate.png',
    fileSize: 2210000,
    mimeType: 'image/png',
    uploadDate: '2025-11-20T18:10:00.000Z',
    isStarred: true,
    isQuickAccess: false,
    tags: ['hackathon', 'award', 'ai', 'internship-pack'],
    notes: 'Built an edge-LLM low latency cache. Awarded $5,000 grant and top honors among 300+ teams.',
    isDeleted: false,
    issuer: 'HackMIT Organizing Committee',
    credentialId: 'HMIT-25-CHAMP',
    scoreOrGrade: '1st Place Winner',
    dataUrl: createSvgDocPreview('HACKMIT 2025 CHAMPION', '1st Place • AI Edge Systems Track', 'WINNER', '#eab308', 'trophy')
  },
  {
    id: 'doc_notes_dist_sys',
    userId: 'usr_alex_rivera',
    title: 'CS 401: Distributed Systems Comprehensive Revision Notes',
    category: 'Notes',
    fileType: 'pdf',
    fileName: 'CS401_Distributed_Systems_Exam_Revision.pdf',
    fileSize: 3450000,
    mimeType: 'application/pdf',
    uploadDate: '2026-02-28T08:00:00.000Z',
    isStarred: false,
    isQuickAccess: false,
    tags: ['cs401', 'distributed-systems', 'raft', 'paxos', 'notes'],
    notes: 'Handwritten and LaTeX diagrams covering Raft consensus, vector clocks, CAP theorem, and distributed locks.',
    isDeleted: false,
    issuer: 'Department of Computer Science',
    dataUrl: createSvgDocPreview('CS 401: DISTRIBUTED SYSTEMS', 'Raft Consensus • CAP Theorem • 2PC', 'LECTURE NOTES', '#10b981', 'book')
  },
  {
    id: 'doc_notes_ml',
    userId: 'usr_alex_rivera',
    title: 'Deep Learning & Transformer Architectures Summary Sheet',
    category: 'Notes',
    fileType: 'pdf',
    fileName: 'Deep_Learning_Transformers_Formulas.pdf',
    fileSize: 980000,
    mimeType: 'application/pdf',
    uploadDate: '2026-01-22T13:30:00.000Z',
    isStarred: true,
    isQuickAccess: false,
    tags: ['ai', 'transformers', 'cheatsheet', 'notes'],
    notes: 'Flash attention equations, KV-cache computation, RoPE embeddings mathematical derivations.',
    isDeleted: false,
    issuer: 'Self-Compiled Study Guide',
    dataUrl: createSvgDocPreview('TRANSFORMER ARCHITECTURES', 'Attention Is All You Need • Formulas & Code', 'CHEATSHEET', '#059669', 'math')
  },
  {
    id: 'doc_proj_capstone',
    userId: 'usr_alex_rivera',
    title: 'Senior Capstone Paper: Sub-millisecond KV-Cache Compression',
    category: 'Projects',
    fileType: 'pdf',
    fileName: 'Senior_Capstone_Research_Paper_Rivera.pdf',
    fileSize: 4250000,
    mimeType: 'application/pdf',
    uploadDate: '2026-03-12T19:00:00.000Z',
    isStarred: true,
    isQuickAccess: false,
    tags: ['capstone', 'research', 'ai', 'internship-pack', 'paper'],
    notes: 'Accepted at Undergraduate Research Symposium. Advised by Prof. Marcus Chen.',
    isDeleted: false,
    issuer: 'AI Systems Laboratory',
    scoreOrGrade: 'Status: Peer Reviewed',
    dataUrl: createSvgDocPreview('SENIOR CAPSTONE RESEARCH', 'Sub-millisecond KV-Cache Compression', 'RESEARCH PAPER', '#8b5cf6', 'project')
  },
  {
    id: 'doc_proj_source',
    userId: 'usr_alex_rivera',
    title: 'Capstone Benchmark Source Code & Reproducibility Suite',
    category: 'Projects',
    fileType: 'archive',
    fileName: 'capstone_benchmark_v2.4.zip',
    fileSize: 6890000,
    mimeType: 'application/zip',
    uploadDate: '2026-03-14T20:10:00.000Z',
    isStarred: false,
    isQuickAccess: false,
    tags: ['code', 'python', 'cuda', 'c++'],
    notes: 'Contains CUDA kernels, PyTorch extension bindings, benchmark scripts, and Dockerfile.',
    isDeleted: false,
    issuer: 'GitHub: alex-rivera/kv-cache-compress',
    dataUrl: createSvgDocPreview('CAPSTONE CODE REPOSITORY', 'CUDA 12.4 • C++ • PyTorch Extensions', 'SOURCE ARCHIVE', '#7c3aed', 'code')
  },
  {
    id: 'doc_other_bonafide',
    userId: 'usr_alex_rivera',
    title: 'Bonafide Student Certificate for Passport & Visa',
    category: 'Other',
    fileType: 'pdf',
    fileName: 'Bonafide_Certificate_Official_Seal.pdf',
    fileSize: 312000,
    mimeType: 'application/pdf',
    uploadDate: '2026-02-05T12:00:00.000Z',
    isStarred: true,
    isQuickAccess: true,
    expiryDate: '2026-11-15T23:59:59.000Z',
    tags: ['bonafide', 'embassy', 'passport', 'official', 'expiring-soon'],
    notes: 'Signed and embossed by Dean of Student Affairs. Valid for international academic visa renewals.',
    isDeleted: false,
    issuer: 'Dean of Student Affairs',
    credentialId: 'BONA-2026-0418',
    dataUrl: createSvgDocPreview('BONAFIDE STUDENT CERTIFICATE', 'Dean of Student Affairs • Official Seal', 'OFFICIAL SEAL', '#ec4899', 'stamp')
  },
  {
    id: 'doc_other_health',
    userId: 'usr_alex_rivera',
    title: 'Campus Health & Medical Insurance Card',
    category: 'Other',
    fileType: 'image',
    fileName: 'Health_Insurance_Card_2026.png',
    fileSize: 840000,
    mimeType: 'image/png',
    uploadDate: '2026-01-02T10:00:00.000Z',
    isStarred: false,
    isQuickAccess: true,
    expiryDate: '2026-12-31T23:59:59.000Z',
    tags: ['medical', 'health-insurance', 'emergency', 'quick-access'],
    notes: 'Policy #MED-CAL-99210. 24/7 Nurse Advice Line: +1 (800) 555-0199.',
    isDeleted: false,
    issuer: 'Aetna Student Health Network',
    credentialId: 'POL-99210-ALEX',
    dataUrl: createSvgDocPreview('STUDENT HEALTH INSURANCE', 'Policy: MED-CAL-99210 • Group: 4401', 'INSURANCE CARD', '#f43f5e', 'medical')
  },
  {
    id: 'doc_deleted_old_syllabus',
    userId: 'usr_alex_rivera',
    title: 'Outdated Math 201 Linear Algebra Syllabus 2024',
    category: 'Notes',
    fileType: 'pdf',
    fileName: 'Math201_Archived_Syllabus.pdf',
    fileSize: 450000,
    mimeType: 'application/pdf',
    uploadDate: '2024-09-01T10:00:00.000Z',
    isStarred: false,
    isQuickAccess: false,
    tags: ['archived', 'math'],
    notes: 'Old syllabus moved to recycle bin.',
    isDeleted: true,
    deletedAt: '2026-03-28T14:00:00.000Z',
    dataUrl: createSvgDocPreview('MATH 201 ARCHIVED SYLLABUS', 'Fall 2024 • Archived', 'DELETED', '#94a3b8', 'trash')
  }
];

export const INITIAL_DEMO_VAULT: VaultField[] = [
  {
    id: 'v_roll',
    userId: 'usr_alex_rivera',
    label: 'Student Roll Number',
    value: '2022-CS-4089',
    category: 'Academic',
    isSensitive: false,
    updatedAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'v_univ_id',
    userId: 'usr_alex_rivera',
    label: 'University Permanent Registration ID',
    value: 'UNIV-9843-0219-CT',
    category: 'Academic',
    isSensitive: false,
    updatedAt: '2026-01-10T12:00:00.000Z'
  },
  {
    id: 'v_cgpa',
    userId: 'usr_alex_rivera',
    label: 'Current Cumulative GPA (CGPA)',
    value: '3.92 / 4.00 (Summa Cum Laude Track)',
    category: 'Academic',
    isSensitive: false,
    updatedAt: '2026-03-02T09:30:00.000Z'
  },
  {
    id: 'v_email',
    userId: 'usr_alex_rivera',
    label: 'Official Student Email',
    value: 'alex.rivera@techuniv.edu',
    category: 'Contact',
    isSensitive: false,
    updatedAt: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'v_phone',
    userId: 'usr_alex_rivera',
    label: 'Primary Mobile Number',
    value: '+1 (555) 389-7201',
    category: 'Contact',
    isSensitive: false,
    updatedAt: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'v_address',
    userId: 'usr_alex_rivera',
    label: 'Permanent Residential Address',
    value: '742 Evergreen Terrace, Apt 4B, Palo Alto, CA 94301',
    category: 'Contact',
    isSensitive: false,
    updatedAt: '2026-01-12T14:15:00.000Z'
  },
  {
    id: 'v_gov_id',
    userId: 'usr_alex_rivera',
    label: 'National Identity / SSN / Aadhaar',
    value: '482-91-6819',
    category: 'Identity',
    isSensitive: true,
    updatedAt: '2026-01-15T11:00:00.000Z'
  },
  {
    id: 'v_pan_tax',
    userId: 'usr_alex_rivera',
    label: 'PAN / Tax Identification Number',
    value: 'ABCDE1234F',
    category: 'Financial',
    isSensitive: true,
    updatedAt: '2026-01-15T11:00:00.000Z'
  },
  {
    id: 'v_blood',
    userId: 'usr_alex_rivera',
    label: 'Blood Group',
    value: 'O+ Positive',
    category: 'Personal',
    isSensitive: false,
    updatedAt: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'v_emergency',
    userId: 'usr_alex_rivera',
    label: 'Emergency Contact (Guardian)',
    value: 'Elena Rivera (Mother) • +1 (555) 389-9944',
    category: 'Contact',
    isSensitive: false,
    updatedAt: '2026-01-05T08:00:00.000Z'
  }
];
