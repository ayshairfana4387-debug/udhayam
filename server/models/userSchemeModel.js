// In-memory store — seeded with demo data.
// Vercel serverless functions have a READ-ONLY filesystem,
// so fs.writeFileSync is replaced with pure in-memory state.

const SEED_DATA = [
  {
    id: 'journey-1790003509763',
    userId: 'rajesh-kumar',
    applicantName: 'Rajesh Kumar',
    district: 'Coimbatore',
    businessType: 'Food Processing & Bakery',
    enterpriseStage: 'new',
    schemeId: 'pmfme',
    schemeName: 'PMFME Scheme (Micro Food Processing)',
    schemeTag: '35% Food Subsidy',
    bankId: 'sbi-main',
    bankName: 'State Bank of India (SBI) - SME Lead Branch',
    bankDistance: '1.2 km',
    status: 'active_repayment',
    loanAmount: 300000,
    interestRate: 7.2,
    tenureMonths: 24,
    currentMonth: 2,
    remainingBalance: 288341,
    cumulativePrincipalPaid: 11659,
    cumulativeInterestPaid: 1800,
    emi: 13459,
    lastVisitedAt: '2026-09-21T15:12:22.153Z',
    createdAt: '2026-09-21T15:11:49.767Z',
    updatedAt: '2026-09-21T15:12:22.153Z',
    notes: '',
    notifications: [
      {
        id: 'notif-1790003542153',
        type: 'emi_due',
        title: 'Month 2 Payment Due',
        message: 'Month 2 EMI of ₹13,459 is due for PMFME Scheme (Micro Food Processing). 22 months remaining. Outstanding balance: ₹2,88,341.',
        isRead: false,
        createdAt: '2026-09-21T15:12:22.153Z'
      },
      {
        id: 'notif-1790003509767',
        type: 'emi_due',
        title: 'Installment 1 Due Alert',
        message: 'Dear Rajesh Kumar, Month 1 EMI of ₹13,459 for PMFME Scheme (Micro Food Processing) is due.',
        isRead: false,
        createdAt: '2026-09-21T15:11:49.767Z'
      }
    ]
  }
];

// In-memory store — lives for the lifetime of the serverless function instance
let userSchemes = JSON.parse(JSON.stringify(SEED_DATA));

export function loadUserSchemes() {
  return userSchemes;
}

// No-op write: data is kept in memory only (Vercel FS is read-only)
export function saveUserSchemes(data) {
  userSchemes = data;
  return true;
}

export function getAllSchemes() {
  return userSchemes;
}
