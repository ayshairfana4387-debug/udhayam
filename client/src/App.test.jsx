import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { translations } from './translations/index.js';
import { getRecommendedSchemes, governmentBanks } from './data/schemesAndBanks.js';
import { bankFormGuide } from './data/bankFormGuide.js';

describe('App Navigation, 6 Languages & 3-Step Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders home page at root route in English', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.en.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.en.appName)).toBeTruthy();
  });

  it('renders in Tamil when language set to ta', () => {
    localStorage.setItem('udyam-language', 'ta');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.ta.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.ta.appName)).toBeTruthy();
  });

  it('renders in Hindi when language set to hi', () => {
    localStorage.setItem('udyam-language', 'hi');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.hi.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.hi.appName)).toBeTruthy();
  });

  it('renders in Telugu when language set to te', () => {
    localStorage.setItem('udyam-language', 'te');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.te.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.te.appName)).toBeTruthy();
  });

  it('renders in Kannada when language set to kn', () => {
    localStorage.setItem('udyam-language', 'kn');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.kn.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.kn.appName)).toBeTruthy();
  });

  it('renders in Malayalam when language set to ml', () => {
    localStorage.setItem('udyam-language', 'ml');
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.ml.homeTitle)).toBeTruthy();
    expect(screen.getByText(translations.ml.appName)).toBeTruthy();
  });

  it('renders Step 1 (UserFlowPage) with questionnaire, schemes and bank branches', () => {
    render(
      <MemoryRouter initialEntries={['/flow']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.en.step1Title)).toBeTruthy();
    expect(screen.getByText(translations.en.nearestBankTitle)).toBeTruthy();
    expect(screen.getByText(translations.en.proceedToStep2)).toBeTruthy();
  });

  it('renders Step 2 & 3 (ResultPage) with document checklist, form guide, and sanction tracker', () => {
    render(
      <MemoryRouter initialEntries={['/result']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.en.step2Title)).toBeTruthy();
    expect(screen.getByText(translations.en.bankFormAssistantTitle)).toBeTruthy();
    expect(screen.getByText(translations.en.proceedToStep3)).toBeTruthy();
  });

  it('calculates government scheme fit scores accurately', () => {
    const profileFood = {
      loanAmount: '300000',
      businessType: 'Food Processing & Bakery',
      enterpriseStage: 'new',
      categoryGroup: 'special',
      loanPurpose: 'Food processing flour unit'
    };

    const schemes = getRecommendedSchemes(profileFood);
    expect(schemes.length).toBeGreaterThan(3);
    const topScheme = schemes[0];
    expect(topScheme.fit).toBeGreaterThanOrEqual(70);
  });

  it('contains comprehensive bank form guidance with visual tips', () => {
    const accountGuide = bankFormGuide.find((g) => g.id === 'account-number');
    expect(accountGuide).toBeDefined();
    expect(accountGuide.answer.toLowerCase()).toContain('passbook');
    expect(accountGuide.answer.toLowerCase()).toContain('cheque');

    const ifscGuide = bankFormGuide.find((g) => g.id === 'ifsc-code');
    expect(ifscGuide).toBeDefined();
    expect(ifscGuide.answer).toContain('IFSC');
  });

  it('renders My Schemes & Loan History page at /history route', () => {
    render(
      <MemoryRouter initialEntries={['/history']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText(translations.en.mySchemesTitle)).toBeTruthy();
    expect(screen.getByText(translations.en.exploreAnotherLoan)).toBeTruthy();
  });
});

