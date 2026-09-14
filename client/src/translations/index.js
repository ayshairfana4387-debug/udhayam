import en from './en.js';
import hi from './hi.js';
import ta from './ta.js';
import ml from './ml.js';
import te from './te.js';
import kn from './kn.js';

export const translations = { en, hi, ta, ml, te, kn };

export const defaultLanguage = 'en';

export const availableLanguages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' }
];
