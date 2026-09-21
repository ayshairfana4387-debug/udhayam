import { v4 as uuidv4 } from 'uuid';
import { getAllSchemes, saveUserSchemes } from '../models/userSchemeModel.js';

function calculateEMI(principal, annualRate, months) {
  const P = Number(principal) || 100000;
  const rYear = Number(annualRate) || 8.0;
  const n = Math.max(1, Number(months) || 12);
  const rMonth = rYear / 100 / 12;

  if (rMonth > 0) {
    return Math.round((P * rMonth * Math.pow(1 + rMonth, n)) / (Math.pow(1 + rMonth, n) - 1));
  }
  return Math.round(P / n);
}

export function getUserSchemes(userId) {
  const schemes = getAllSchemes();
  let filtered = schemes;
  if (userId && userId !== 'all') {
    filtered = schemes.filter((s) => s.userId === userId || s.userId === 'rajesh-kumar' || !s.userId);
  }
  // Sort like YouTube history: most recently visited / updated first
  return filtered.sort((a, b) => new Date(b.lastVisitedAt || b.updatedAt || 0) - new Date(a.lastVisitedAt || a.updatedAt || 0));
}

export function getUserSchemeById(id) {
  const schemes = getAllSchemes();
  const scheme = schemes.find((s) => s.id === id);
  if (scheme) {
    // Touch lastVisitedAt on retrieval (like YouTube opening a video)
    scheme.lastVisitedAt = new Date().toISOString();
    saveUserSchemes(schemes);
  }
  return scheme;
}

export function createUserScheme(payload) {
  if (!payload.schemeName) {
    throw new Error('Scheme name is required');
  }

  const schemes = getAllSchemes();
  const now = new Date().toISOString();
  const loanAmount = Number(payload.loanAmount) || 200000;
  const interestRate = Number(payload.interestRate) || 8.0;
  const tenureMonths = Number(payload.tenureMonths) || 24;
  const emi = payload.emi || calculateEMI(loanAmount, interestRate, tenureMonths);
  const currentMonth = Number(payload.currentMonth) || 1;
  const remainingBalance = payload.remainingBalance !== undefined ? Number(payload.remainingBalance) : loanAmount;

  const newScheme = {
    id: payload.id || `journey-${Date.now()}`,
    userId: payload.userId || 'rajesh-kumar',
    applicantName: payload.applicantName || 'Rajesh Kumar',
    district: payload.district || '',
    businessType: payload.businessType || '',
    enterpriseStage: payload.enterpriseStage || 'new',
    schemeId: payload.schemeId || 'custom',
    schemeName: payload.schemeName,
    schemeTag: payload.schemeTag || 'Government Scheme',
    bankId: payload.bankId || 'sbi-main',
    bankName: payload.bankName || 'State Bank of India (SBI)',
    bankDistance: payload.bankDistance || '1.5 km',
    status: payload.status || 'active_repayment',
    loanAmount,
    interestRate,
    tenureMonths,
    currentMonth,
    remainingBalance,
    cumulativePrincipalPaid: Number(payload.cumulativePrincipalPaid) || 0,
    cumulativeInterestPaid: Number(payload.cumulativeInterestPaid) || 0,
    emi,
    lastVisitedAt: now,
    createdAt: now,
    updatedAt: now,
    notes: payload.notes || '',
    notifications: payload.notifications || [
      {
        id: `notif-${Date.now()}`,
        type: 'emi_due',
        title: `Installment ${currentMonth} Due Alert`,
        message: `Dear ${payload.applicantName || 'Entrepreneur'}, Month ${currentMonth} EMI of ₹${emi.toLocaleString('en-IN')} for ${payload.schemeName} is due.`,
        isRead: false,
        createdAt: now
      }
    ]
  };

  schemes.unshift(newScheme);
  saveUserSchemes(schemes);
  return newScheme;
}

export function updateUserScheme(id, payload) {
  const schemes = getAllSchemes();
  const index = schemes.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Scheme journey not found');
  }

  const existing = schemes[index];
  const now = new Date().toISOString();

  // If currentMonth or financial values are updated, recalculate notification if needed
  const updated = {
    ...existing,
    ...payload,
    lastVisitedAt: now,
    updatedAt: now
  };

  // If currentMonth changed, ensure a fresh reminder notification exists
  if (payload.currentMonth && payload.currentMonth !== existing.currentMonth) {
    const remainingTenure = Math.max(0, updated.tenureMonths - updated.currentMonth);
    const notifMsg = `Month ${updated.currentMonth} EMI of ₹${(updated.emi || 0).toLocaleString('en-IN')} is due for ${updated.schemeName}. ${remainingTenure} months remaining on your ${updated.tenureMonths}-month tenure.`;
    
    updated.notifications = [
      {
        id: `notif-${Date.now()}`,
        type: 'emi_due',
        title: `Month ${updated.currentMonth} Payment Due`,
        message: notifMsg,
        isRead: false,
        createdAt: now
      },
      ...(updated.notifications || []).slice(0, 5)
    ];
  }

  schemes[index] = updated;
  saveUserSchemes(schemes);
  return updated;
}

export function recordSchemePayment(id) {
  const schemes = getAllSchemes();
  const scheme = schemes.find((s) => s.id === id);
  if (!scheme) {
    throw new Error('Scheme journey not found');
  }

  const rMonth = (Number(scheme.interestRate) || 8.0) / 100 / 12;
  const currentBal = Number(scheme.remainingBalance) || 0;
  if (currentBal <= 0) {
    scheme.status = 'completed';
    saveUserSchemes(schemes);
    return scheme;
  }

  const interestThisMonth = Math.min(currentBal, Math.round(currentBal * rMonth));
  const emi = Number(scheme.emi) || 0;
  const principalThisMonth = Math.min(currentBal, Math.max(0, emi - interestThisMonth));
  const newBalance = Math.max(0, currentBal - principalThisMonth);

  scheme.remainingBalance = newBalance;
  scheme.cumulativePrincipalPaid = (Number(scheme.cumulativePrincipalPaid) || 0) + principalThisMonth;
  scheme.cumulativeInterestPaid = (Number(scheme.cumulativeInterestPaid) || 0) + interestThisMonth;
  scheme.currentMonth = Math.min(Number(scheme.tenureMonths), (Number(scheme.currentMonth) || 1) + 1);

  if (newBalance <= 0) {
    scheme.status = 'completed';
  }

  const now = new Date().toISOString();
  scheme.updatedAt = now;
  scheme.lastVisitedAt = now;

  // Add notification for the newly upcoming month
  if (scheme.currentMonth <= scheme.tenureMonths && scheme.status !== 'completed') {
    const remainingTenure = scheme.tenureMonths - scheme.currentMonth;
    scheme.notifications = [
      {
        id: `notif-${Date.now()}`,
        type: 'emi_due',
        title: `Month ${scheme.currentMonth} Payment Due`,
        message: `Month ${scheme.currentMonth} EMI of ₹${emi.toLocaleString('en-IN')} is due for ${scheme.schemeName}. ${remainingTenure} months remaining. Outstanding balance: ₹${newBalance.toLocaleString('en-IN')}.`,
        isRead: false,
        createdAt: now
      },
      ...(scheme.notifications || []).slice(0, 5)
    ];
  }

  saveUserSchemes(schemes);
  return scheme;
}

export function deleteUserScheme(id) {
  const schemes = getAllSchemes();
  const index = schemes.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Scheme journey not found');
  }

  const [removed] = schemes.splice(index, 1);
  saveUserSchemes(schemes);
  return removed;
}

export function getActiveNotifications(userId) {
  const schemes = getUserSchemes(userId);
  const activeAlerts = [];

  schemes.forEach((scheme) => {
    // If loan is currently in repayment, provide live notification
    if (scheme.status === 'active_repayment' && scheme.remainingBalance > 0) {
      const remainingMonths = Math.max(0, scheme.tenureMonths - scheme.currentMonth);
      activeAlerts.push({
        id: `active-${scheme.id}-${scheme.currentMonth}`,
        journeyId: scheme.id,
        schemeId: scheme.schemeId,
        schemeName: scheme.schemeName,
        bankName: scheme.bankName,
        currentMonth: scheme.currentMonth,
        tenureMonths: scheme.tenureMonths,
        emi: scheme.emi,
        remainingBalance: scheme.remainingBalance,
        applicantName: scheme.applicantName,
        title: `🔔 ${scheme.schemeName} • Month ${scheme.currentMonth} of ${scheme.tenureMonths} Due`,
        message: `Monthly EMI of ₹${(scheme.emi || 0).toLocaleString('en-IN')} is due for ${scheme.applicantName}. Outstanding principal: ₹${(scheme.remainingBalance || 0).toLocaleString('en-IN')}. (${remainingMonths} installments remaining).`,
        createdAt: scheme.updatedAt || scheme.createdAt
      });
    }

    // Include any custom notifications attached to the scheme
    if (Array.isArray(scheme.notifications)) {
      scheme.notifications.forEach((n) => {
        if (!activeAlerts.some((a) => a.id === n.id)) {
          activeAlerts.push({
            ...n,
            journeyId: scheme.id,
            schemeName: scheme.schemeName
          });
        }
      });
    }
  });

  return activeAlerts;
}
