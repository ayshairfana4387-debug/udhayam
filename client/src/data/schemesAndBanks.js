export const governmentSchemes = [
  {
    id: 'pmegp',
    name: 'PMEGP (Prime Minister Employment Generation Programme)',
    category: 'Manufacturing & Service Enterprise',
    targetAudience: 'New entrepreneurs, rural & urban self-employment',
    maxLoan: 5000000,
    minLoan: 100000,
    interest: 8.5,
    subsidy: '15% to 35% Govt Subsidy (Margin Money)',
    tag: 'Highest Subsidy',
    description: 'Credit-linked subsidy scheme offering 15% to 35% capital subsidy for establishing micro-enterprises in manufacturing (up to ₹50L) and service sectors (up to ₹20L).',
    docs: [
      'Aadhaar Card & PAN Card',
      'Detailed Project Report (DPR) with machine quotations',
      'Educational Qualification Certificate (8th pass minimum for >₹10L)',
      'Special Category / Community Certificate (if SC/ST/OBC/Women/Minority)',
      'Rural Area Certificate (issued by Gram Panchayat / BDO if applicable)',
      'Udyam Registration & Bank Passbook copy'
    ],
    calcFit: (profile) => {
      let score = 70;
      const amount = Number(profile.loanAmount || 0);
      const isNew = profile.enterpriseStage === 'new' || profile.isNewBusiness === 'yes';
      const sector = (profile.businessType || '').toLowerCase();
      if (isNew) score += 12;
      if (sector.includes('food') || sector.includes('manufact') || sector.includes('micro')) score += 10;
      if (profile.categoryGroup === 'women' || profile.categoryGroup === 'special') score += 6;
      if (amount >= 200000 && amount <= 5000000) score += 6;
      return Math.min(98, Math.max(55, score));
    }
  },
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    category: 'Micro & Small Business / Retail',
    targetAudience: 'Shishu (up to ₹50k), Kishore (₹50k-5L), Tarun (₹5L-10L), Tarun Plus (up to ₹20L)',
    maxLoan: 2000000,
    minLoan: 25000,
    interest: 8.0,
    subsidy: 'Nil (Collateral-Free, Low Processing Fee)',
    tag: 'Collateral Free',
    description: 'Collateral-free institutional credit to micro and small businesses for non-farm income-generating activities such as retail, services, transport, and trading.',
    docs: [
      'Aadhaar Card and Proof of Identity',
      'Bank Account Passbook / 6-month Statement',
      'Proof of Business Address & Udyam Registration',
      'Quotations for machinery, equipment, or goods to be purchased',
      'Proof of Category (SC/ST/OBC) if seeking concessional margins'
    ],
    calcFit: (profile) => {
      let score = 72;
      const amount = Number(profile.loanAmount || 0);
      const sector = (profile.businessType || '').toLowerCase();
      if (amount <= 1000000) score += 14;
      if (sector.includes('retail') || sector.includes('service') || sector.includes('trading')) score += 10;
      if (profile.enterpriseStage === 'existing') score += 5;
      return Math.min(97, Math.max(58, score));
    }
  },
  {
    id: 'standup',
    name: 'Stand-Up India Scheme',
    category: 'Women & SC/ST Entrepreneurs',
    targetAudience: 'Women and SC/ST greenfield ventures',
    maxLoan: 10000000,
    minLoan: 1000000,
    interest: 8.75,
    subsidy: 'Concessional margin money (up to 15% state convergence)',
    tag: 'Women & SC/ST Special',
    description: 'Facilitates bank loans between ₹10 Lakhs and ₹1 Crore to at least one SC/ST and one Woman borrower per bank branch for setting up a greenfield (new) enterprise.',
    docs: [
      'Identity & Address Proof (Aadhaar, Voter ID, PAN)',
      'Caste Certificate (for SC/ST) or Proof of 51%+ shareholding for Women',
      'Comprehensive Project Report & Supplier Quotations',
      'Proof of own contribution / margin money (at least 10%)',
      'Rent agreement or factory / shop lease deed'
    ],
    calcFit: (profile) => {
      let score = 60;
      const amount = Number(profile.loanAmount || 0);
      const isWomenOrSCST = profile.categoryGroup === 'women' || profile.categoryGroup === 'special' || (profile.businessType || '').toLowerCase().includes('women');
      if (isWomenOrSCST) score += 25;
      else score -= 15;
      if (amount >= 1000000) score += 12;
      return Math.min(99, Math.max(40, score));
    }
  },
  {
    id: 'pmfme',
    name: 'PMFME Scheme (Micro Food Processing)',
    category: 'Food Processing & Agro Enterprise',
    targetAudience: 'Individual micro food units, bakeries, spices, pickle, oil mills',
    maxLoan: 3000000,
    minLoan: 50000,
    interest: 7.2,
    subsidy: '35% Credit-linked Capital Subsidy (max ₹10 Lakhs)',
    tag: '35% Food Subsidy',
    description: 'Financial, technical, and business support for micro food processing enterprises. Provides 35% capital subsidy with credit linkage.',
    docs: [
      'Aadhaar, PAN & Passport Photographs',
      'Food business activity proof / FSSAI license or declaration',
      'Udyam Registration Certificate',
      'Machinery supplier quotation & electricity connection proof',
      'Bank passbook showing active transactions'
    ],
    calcFit: (profile) => {
      let score = 65;
      const sector = (profile.businessType || '').toLowerCase();
      const purpose = (profile.loanPurpose || '').toLowerCase();
      if (sector.includes('food') || purpose.includes('food') || purpose.includes('bakery') || sector.includes('agri')) {
        score += 28;
      }
      return Math.min(99, Math.max(45, score));
    }
  },
  {
    id: 'pmsvanidhi',
    name: 'PM SVANidhi (Micro Credit for Vendors)',
    category: 'Street Vendors & Micro-Merchants',
    targetAudience: 'Urban vendors, hawkers, small stall owners',
    maxLoan: 50000,
    minLoan: 10000,
    interest: 7.0,
    subsidy: '7% Interest Subsidy + Cashback on digital transactions',
    tag: 'Quick Micro Credit',
    description: 'Affordable working capital collateral-free loan for urban street vendors. ₹10,000 for 1st term, ₹20,000 for 2nd term, and ₹50,000 for 3rd term on timely repayment.',
    docs: [
      'Aadhaar Card linked to mobile number',
      'Vending Certificate / Identity Card issued by Urban Local Body (ULB)',
      'Bank account passbook front page',
      'Basic KYC information'
    ],
    calcFit: (profile) => {
      const amount = Number(profile.loanAmount || 0);
      let score = 55;
      if (amount <= 50000) score += 35;
      if ((profile.businessType || '').toLowerCase().includes('retail') || (profile.businessType || '').toLowerCase().includes('micro')) score += 8;
      return Math.min(98, Math.max(45, score));
    }
  },
  {
    id: 'cgtmse',
    name: 'CGTMSE Collateral-Free Credit',
    category: 'MSME Manufacturing & Service',
    targetAudience: 'Existing & new small businesses needing higher credit without property mortgage',
    maxLoan: 50000000,
    minLoan: 500000,
    interest: 8.9,
    subsidy: 'Up to 85% Credit Guarantee Cover by Govt of India',
    tag: 'No Property Mortgage',
    description: 'Guarantees credit facilities (both fund and non-fund based) up to ₹5 Crore to MSMEs without requiring collateral security or third-party guarantee.',
    docs: [
      'Udyam Registration Certificate',
      'Audited Financial Statements or 1-2 Year ITR with computation',
      'Bank statements for previous 12 months',
      'Comprehensive business project report & quotation invoices',
      'GST returns (if registered)'
    ],
    calcFit: (profile) => {
      let score = 65;
      const amount = Number(profile.loanAmount || 0);
      if (amount >= 500000) score += 18;
      if (profile.enterpriseStage === 'existing') score += 10;
      return Math.min(96, Math.max(50, score));
    }
  }
];

export const governmentBanks = [
  {
    id: 'sbi-main',
    name: 'State Bank of India (SBI) - SME Lead Branch',
    branchCode: 'SBIN0001234',
    distance: '1.2 km',
    distanceKm: 1.2,
    address: 'Near District Collectorate & Main Market Road, Commercial Complex',
    route: 'Take Main Market Road towards Collectorate circle; branch is on the left opposite Post Office.',
    phone: '+91 94440 12345',
    officer: 'Mr. R. Sundaram (Chief Manager - SME Credit)',
    services: 'PMEGP nodal desk, MUDRA desk, Stand-Up India facilitation, CGTMSE processing',
    timing: '10:00 AM - 4:00 PM (Mon-Sat, 2nd & 4th Sat holiday)',
    mapQuery: 'State Bank of India SME Branch'
  },
  {
    id: 'canara-msme',
    name: 'Canara Bank - MSME Specialized Sulabh Branch',
    branchCode: 'CNRB0002841',
    distance: '2.4 km',
    distanceKm: 2.4,
    address: 'Plot 14, Industrial Estate Road, Near SIDCO Complex',
    route: 'Head along Industrial Estate Road past SIDCO entrance; second building on the right.',
    phone: '+91 98410 67890',
    officer: 'Ms. Priya Narayanan (Senior Loan Officer)',
    services: 'MUDRA Kishore & Tarun, PMEGP subsidy desk, PMFME food processing assistance',
    timing: '10:00 AM - 4:30 PM (Mon-Sat)',
    mapQuery: 'Canara Bank MSME Branch'
  },
  {
    id: 'indian-bank',
    name: 'Indian Bank - Entrepreneur Credit Hub',
    branchCode: 'IDIB000I055',
    distance: '3.1 km',
    distanceKm: 3.1,
    address: 'Gandhi Road, Opposite Taluk Office & Bus Stand',
    route: 'Directly opposite the Taluk Supply Office on the Gandhi Road arterial lane.',
    phone: '+91 97890 34567',
    officer: 'Mr. K. Venkatesh (Assistant General Manager - Credit)',
    services: 'Stand-Up India, PM SVANidhi quick counter, Micro manufacturing loans',
    timing: '10:00 AM - 4:00 PM (Mon-Sat)',
    mapQuery: 'Indian Bank Lead District Branch'
  },
  {
    id: 'bob-credit',
    name: 'Bank of Baroda - Baroda Kisan & SME Point',
    branchCode: 'BARB0ESTATE',
    distance: '4.2 km',
    distanceKm: 4.2,
    address: 'First Floor, Commerce Bhavan, Railway Feeder Road',
    route: 'Take Railway Feeder Road for 400m from junction; branch is in Commerce Bhavan.',
    phone: '+91 96550 89123',
    officer: 'Mr. Amit Sharma (SME Desk)',
    services: 'PMEGP, MUDRA loans, Agro-allied term loans, CGTMSE',
    timing: '10:00 AM - 4:00 PM (Mon-Sat)',
    mapQuery: 'Bank of Baroda SME Branch'
  },
  {
    id: 'pnb-branch',
    name: 'Punjab National Bank (PNB) - MSME Care Branch',
    branchCode: 'PUNB0123400',
    distance: '4.8 km',
    distanceKm: 4.8,
    address: 'Civil Lines Road, Near District Industries Centre (DIC)',
    route: 'Walk 100 meters east from DIC office gate; branch is on the ground floor.',
    phone: '+91 94123 78901',
    officer: 'Ms. S. Kavitha (Branch Manager)',
    services: 'DIC sponsored PMEGP, Stand-Up India, PMFME, Working Capital',
    timing: '10:00 AM - 4:00 PM (Mon-Sat)',
    mapQuery: 'Punjab National Bank Civil Lines'
  }
];

export function getRecommendedSchemes(profile) {
  return governmentSchemes.map((scheme) => ({
    ...scheme,
    fit: scheme.calcFit(profile)
  })).sort((a, b) => b.fit - a.fit);
}
