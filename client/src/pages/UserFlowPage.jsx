import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Landmark,
  Briefcase,
  MapPin,
  Phone,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Navigation,
  Check,
  Building,
  UserCheck,
  FileText,
  Wallet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bell,
  RefreshCw,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { governmentSchemes, governmentBanks, getRecommendedSchemes } from '../data/schemesAndBanks.js';
import { translations, availableLanguages, defaultLanguage } from '../translations/index.js';
import { useVoice } from '../services/useVoice.js';
import StepIndicator from '../components/StepIndicator.jsx';
import FormGuideModal from '../components/FormGuideModal.jsx';
import { createRequest } from '../services/api.js';

export default function UserFlowPage({ initialStep = 1 }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active step: 1 (Scheme & Bank), 2 (Docs & Form Guide), 3 (Sanction & Repayment)
  const stepFromQuery = Number(searchParams.get('step'));
  const [currentStep, setCurrentStep] = useState(
    stepFromQuery >= 1 && stepFromQuery <= 3 ? stepFromQuery : initialStep
  );

  const savedLanguage = localStorage.getItem('udyam-language') || defaultLanguage;
  const [language, setLanguage] = useState(translations[savedLanguage] ? savedLanguage : defaultLanguage);
  const text = translations[language] || translations.en;

  const voice = useVoice(language);

  // Sync step changes with URL search params
  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    setSearchParams({ step: String(stepNumber) }, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 1: Questionnaire state
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('udyam-answers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      applicantName: 'Rajesh Kumar',
      district: 'Coimbatore',
      businessType: 'Food Processing & Bakery',
      enterpriseStage: 'new',
      categoryGroup: 'general',
      loanAmount: '250000',
      monthlyIncome: '45000',
      loanPurpose: 'Purchase automatic flour mixing machinery and packaging equipment'
    };
  });

  useEffect(() => {
    localStorage.setItem('udyam-answers', JSON.stringify(answers));
  }, [answers]);

  const [activeVoiceField, setActiveVoiceField] = useState(null);
  const [selectedSchemeId, setSelectedSchemeId] = useState('pmfme');
  const [selectedBankId, setSelectedBankId] = useState('sbi-main');
  const [error, setError] = useState('');

  // Dynamically compute scheme recommendations based on user answers
  const recommendedSchemes = useMemo(() => {
    return getRecommendedSchemes(answers);
  }, [answers]);

  const selectedScheme = useMemo(() => {
    return (
      recommendedSchemes.find((s) => s.id === selectedSchemeId) ||
      recommendedSchemes[0] ||
      governmentSchemes[0]
    );
  }, [recommendedSchemes, selectedSchemeId]);

  const selectedBank = useMemo(() => {
    return governmentBanks.find((b) => b.id === selectedBankId) || governmentBanks[0];
  }, [selectedBankId]);

  // Step 2: Document checklist state
  const defaultDocKeys = selectedScheme.docs || [
    'Aadhaar Card & PAN Card',
    'Bank Account Passbook / 6-month Statement',
    'Udyam Registration Certificate',
    'Detailed Project Report (DPR) with machine quotations',
    'Proof of Business Address / Rent agreement'
  ];

  const [checkedDocs, setCheckedDocs] = useState(() => {
    const initial = {};
    defaultDocKeys.forEach((doc, idx) => {
      if (idx < 3) initial[doc] = true;
    });
    return initial;
  });

  const toggleDoc = (doc) => {
    setCheckedDocs((prev) => ({ ...prev, [doc]: !prev[doc] }));
  };

  const readyDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const totalDocsCount = defaultDocKeys.length;
  const docsProgressPercent = Math.round((readyDocsCount / (totalDocsCount || 1)) * 100);

  // Step 3: Sanction status state
  const [sanctionStatus, setSanctionStatus] = useState('yes');
  const [sanctionAmount, setSanctionAmount] = useState(Number(answers.loanAmount) || 200000);
  const [sanctionInterest, setSanctionInterest] = useState(selectedScheme.interest || 8.0);
  const [repaymentMonths, setRepaymentMonths] = useState(24);

  // Step 3: Continuous monthly repayment ledger simulation state
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const [remainingPrincipalBalance, setRemainingPrincipalBalance] = useState(Number(answers.loanAmount) || 200000);
  const [cumulativePrincipalPaid, setCumulativePrincipalPaid] = useState(0);
  const [cumulativeInterestPaid, setCumulativeInterestPaid] = useState(0);
  const [notificationAlert, setNotificationAlert] = useState(null);

  // Sync loan amount whenever sanctionAmount changes
  useEffect(() => {
    setRemainingPrincipalBalance(sanctionAmount);
    setCumulativePrincipalPaid(0);
    setCumulativeInterestPaid(0);
    setCurrentMonthIndex(1);
  }, [sanctionAmount]);

  // Standard Monthly EMI calculation
  const calculations = useMemo(() => {
    const P = Number(sanctionAmount) || 100000;
    const rYear = Number(sanctionInterest) || 8.0;
    const n = Math.max(1, Number(repaymentMonths) || 12);
    const rMonth = rYear / 100 / 12;

    let emi = 0;
    if (rMonth > 0) {
      emi = Math.round((P * rMonth * Math.pow(1 + rMonth, n)) / (Math.pow(1 + rMonth, n) - 1));
    } else {
      emi = Math.round(P / n);
    }

    const totalRepay = emi * n;
    const totalInt = Math.max(0, totalRepay - P);
    const month1Interest = Math.round(P * rMonth);
    const month1Principal = Math.max(0, emi - month1Interest);

    return {
      emi,
      totalRepay,
      totalInt,
      month1Interest,
      month1Principal
    };
  }, [sanctionAmount, sanctionInterest, repaymentMonths]);

  // Record a monthly EMI payment (reducing balance calculation)
  const handleRecordMonthlyPayment = () => {
    if (remainingPrincipalBalance <= 0) return;

    const rMonth = (Number(sanctionInterest) || 8.0) / 100 / 12;
    const interestThisMonth = Math.min(
      remainingPrincipalBalance,
      Math.round(remainingPrincipalBalance * rMonth)
    );
    const principalThisMonth = Math.min(
      remainingPrincipalBalance,
      Math.max(0, calculations.emi - interestThisMonth)
    );
    const newBalance = Math.max(0, remainingPrincipalBalance - principalThisMonth);

    setRemainingPrincipalBalance(newBalance);
    setCumulativePrincipalPaid((prev) => prev + principalThisMonth);
    setCumulativeInterestPaid((prev) => prev + interestThisMonth);
    setCurrentMonthIndex((prev) => Math.min(prev + 1, Number(repaymentMonths)));

    voice.speak(
      `Month ${currentMonthIndex} payment of rupees ${calculations.emi} recorded. Reduced remaining loan balance is rupees ${newBalance}.`
    );
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setRemainingPrincipalBalance(sanctionAmount);
    setCumulativePrincipalPaid(0);
    setCumulativeInterestPaid(0);
    setCurrentMonthIndex(1);
    setNotificationAlert(null);
  };

  // Simulate monthly reminder notification
  const handleSimulateNotification = () => {
    const alertMsg = (text.notificationMessage || 'Dear Entrepreneur, your monthly EMI of ₹{emi} is due. Remaining outstanding loan will reduce to ₹{remaining}.')
      .replace('{emi}', calculations.emi.toLocaleString('en-IN'))
      .replace('{remaining}', Math.max(0, remainingPrincipalBalance - calculations.month1Principal).toLocaleString('en-IN'));

    setNotificationAlert(alertMsg);

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(text.notificationBannerTitle || 'Udyam Sahayak Loan Reminder', {
          body: alertMsg
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(text.notificationBannerTitle || 'Udyam Sahayak Loan Reminder', {
              body: alertMsg
            });
          }
        });
      }
    }

    voice.speak(`${text.notificationBannerTitle || 'Loan payment notification'}. ${alertMsg}`);
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('udyam-language', newLang);
    const newText = translations[newLang] || translations.en;
    if (voice.isSpeaking) voice.stopSpeaking();
    voice.speak(
      currentStep === 1
        ? `${newText.step1Title}`
        : currentStep === 2
        ? `${newText.step2Title}`
        : `${newText.step3Title}`
    );
  };

  const handleVoiceForField = (fieldName) => {
    if (voice.isListening && activeVoiceField === fieldName) {
      voice.stopListening();
      setActiveVoiceField(null);
      return;
    }

    setActiveVoiceField(fieldName);
    voice.startListening((transcript) => {
      const clean = transcript.trim();
      if (!clean) return;

      if (fieldName === 'loanAmount' || fieldName === 'monthlyIncome') {
        const numbers = clean.replace(/[^0-9]/g, '');
        if (numbers) {
          setAnswers((prev) => ({ ...prev, [fieldName]: numbers }));
        }
      } else {
        setAnswers((prev) => ({ ...prev, [fieldName]: clean }));
      }
      setActiveVoiceField(null);
    });
  };

  const setLoanPreset = (amount) => {
    setAnswers((prev) => ({ ...prev, loanAmount: String(amount) }));
  };

  const speakSection = (message) => {
    if (voice.isSpeaking) {
      voice.stopSpeaking();
    } else {
      voice.speak(message);
    }
  };

  // Immediate, seamless transition to Step 2!
  const handleProceedToStep2 = () => {
    if (!answers.applicantName.trim()) {
      setError('Please provide the applicant name.');
      return;
    }

    setError('');
    // Non-blocking background save to API
    try {
      const payload = {
        userId: 'entrepreneur-' + Date.now().toString().slice(-4),
        category: selectedScheme.category,
        input: `${answers.applicantName} | ${answers.businessType} | ₹${answers.loanAmount} | ${answers.district}`,
        result: `${selectedScheme.name} (${selectedScheme.fit}% fit) | Bank: ${selectedBank.name}`,
        language,
        status: 'pending'
      };
      createRequest(payload).catch(() => {});
    } catch (e) {}

    // Advance immediately to Step 2
    goToStep(2);
  };

  const loanRepaidPercentage = useMemo(() => {
    const total = Number(sanctionAmount) || 1;
    const repaid = cumulativePrincipalPaid;
    return Math.min(100, Math.round((repaid / total) * 100));
  }, [sanctionAmount, cumulativePrincipalPaid]);

  return (
    <div className="app modern-theme flow-page">
      {/* App Header */}
      <header className="app-header">
        <Link to="/" className="logo-wrap">
          <div className="logo-icon">
            <Landmark size={26} />
          </div>
          <div>
            <h1 className="logo-title">{text.appName}</h1>
            <p className="logo-tagline">{text.tagline || 'Government Loan Portal'}</p>
          </div>
        </Link>

        <div className="header-controls">
          <div className="language-selector-wrap">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={text.language}
              className="language-dropdown"
            >
              {availableLanguages.map((lang) => (
                <option value={lang.code} key={lang.code}>
                  {lang.native} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          <button
            className={`speaker-button ${voice.isSpeaking ? 'active-speaking' : ''}`}
            onClick={() =>
              speakSection(
                currentStep === 1
                  ? `${text.step1Title}. ${text.step1Desc}`
                  : currentStep === 2
                  ? `${text.step2Title}. ${text.step2Desc}`
                  : `${text.step3Title}. ${text.step3Desc}`
              )
            }
            title={text.listen}
          >
            {voice.isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* Interactive Step Indicator Header (Steps 1, 2, and 3) */}
      <StepIndicator
        currentStep={currentStep}
        onSelectStep={(s) => goToStep(s)}
        text={text}
      />

      {voice.isListening && (
        <div className="voice-listening-banner">
          <div className="pulse-dot"></div>
          <span>
            {text.voiceListening || 'Listening in'} ({availableLanguages.find((l) => l.code === language)?.native})... Speak now!
          </span>
          {voice.transcript && <div className="transcript-live">"{voice.transcript}"</div>}
        </div>
      )}

      {error && <div className="error-box">⚠️ {error}</div>}

      {/* ========================================================================= */}
      {/* STEP 1: Entrepreneur Profile, Schemes Matching & Bank Locator             */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="step-content-block">
          <div className="page-intro-row">
            <div>
              <h2 className="flow-page-heading">{text.step1Title}</h2>
              <p className="flow-page-subtext">{text.step1Desc}</p>
            </div>
          </div>

          <div className="flow-main-layout">
            {/* Left Column: Entrepreneur Questionnaire Form */}
            <section className="card form-card">
              <div className="card-header-flex">
                <div className="card-title-group">
                  <UserCheck size={20} className="card-accent-icon" />
                  <h3 className="card-title">{text.applicantName} & Business Profile</h3>
                </div>
                <button
                  className="mini-speak-btn"
                  onClick={() =>
                    speakSection('Please enter or speak your business name, district, sector, and loan amount needed.')
                  }
                  title={text.listen}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="form-fields-grid">
                {/* Applicant Name */}
                <div className="form-group">
                  <label className="form-label">{text.applicantName}</label>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      value={answers.applicantName}
                      onChange={(e) => setAnswers({ ...answers, applicantName: e.target.value })}
                      placeholder={text.applicantNamePlaceholder || 'e.g., Rajesh Kumar'}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className={`field-mic-btn ${activeVoiceField === 'applicantName' && voice.isListening ? 'active-mic' : ''}`}
                      onClick={() => handleVoiceForField('applicantName')}
                      title={text.voiceMicTooltip}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                {/* District */}
                <div className="form-group">
                  <label className="form-label">{text.district}</label>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      value={answers.district}
                      onChange={(e) => setAnswers({ ...answers, district: e.target.value })}
                      placeholder={text.districtPlaceholder || 'e.g., Coimbatore'}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className={`field-mic-btn ${activeVoiceField === 'district' && voice.isListening ? 'active-mic' : ''}`}
                      onClick={() => handleVoiceForField('district')}
                      title={text.voiceMicTooltip}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                {/* Business Sector */}
                <div className="form-group">
                  <label className="form-label">{text.businessType}</label>
                  <select
                    value={answers.businessType}
                    onChange={(e) => setAnswers({ ...answers, businessType: e.target.value })}
                    className="form-select"
                  >
                    <option value="Retail Shop & Trading">{text.businessTypeOptionRetail || 'Retail Shop & Trading'}</option>
                    <option value="Food Processing & Bakery">{text.businessTypeOptionFood || 'Food Processing & Bakery'}</option>
                    <option value="Micro Manufacturing & Engineering">{text.businessTypeOptionMicro || 'Micro Manufacturing & Engineering'}</option>
                    <option value="Agri-Allied & Rural Business">{text.businessTypeOptionAgri || 'Agri-Allied & Rural Business'}</option>
                    <option value="Women-Led Enterprise">{text.businessTypeOptionWomen || 'Women-Led Enterprise'}</option>
                  </select>
                </div>

                {/* Enterprise Stage */}
                <div className="form-group">
                  <label className="form-label">{text.enterpriseStage || 'Enterprise Stage'}</label>
                  <div className="radio-pill-group">
                    <button
                      type="button"
                      className={`radio-pill ${answers.enterpriseStage === 'new' ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, enterpriseStage: 'new' })}
                    >
                      {text.stageNew || 'New Business'}
                    </button>
                    <button
                      type="button"
                      className={`radio-pill ${answers.enterpriseStage === 'existing' ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, enterpriseStage: 'existing' })}
                    >
                      {text.stageExisting || 'Existing Expansion'}
                    </button>
                  </div>
                </div>

                {/* Category / Group */}
                <div className="form-group">
                  <label className="form-label">{text.categoryGroup || 'Category Group'}</label>
                  <div className="radio-pill-group">
                    <button
                      type="button"
                      className={`radio-pill ${answers.categoryGroup === 'general' ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, categoryGroup: 'general' })}
                    >
                      {text.categoryGeneral || 'General'}
                    </button>
                    <button
                      type="button"
                      className={`radio-pill ${answers.categoryGroup === 'special' ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, categoryGroup: 'special' })}
                    >
                      {text.categorySpecial || 'Special (Women/SC/ST/OBC)'}
                    </button>
                  </div>
                </div>

                {/* Loan Amount Needed */}
                <div className="form-group full-width">
                  <div className="label-with-presets">
                    <label className="form-label">{text.loanAmount}</label>
                    <div className="amount-chips">
                      {[50000, 200000, 500000, 1000000, 2500000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className="amount-preset-btn"
                          onClick={() => setLoanPreset(amt)}
                        >
                          ₹{(amt / 100000).toFixed(amt >= 100000 ? 1 : 2)}L
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="input-with-voice">
                    <input
                      type="number"
                      value={answers.loanAmount}
                      onChange={(e) => setAnswers({ ...answers, loanAmount: e.target.value })}
                      placeholder="e.g., 250000"
                      className="form-input currency-input"
                    />
                    <button
                      type="button"
                      className={`field-mic-btn ${activeVoiceField === 'loanAmount' && voice.isListening ? 'active-mic' : ''}`}
                      onClick={() => handleVoiceForField('loanAmount')}
                      title={text.voiceMicTooltip}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                {/* Monthly Income */}
                <div className="form-group">
                  <label className="form-label">{text.monthlyIncome}</label>
                  <div className="input-with-voice">
                    <input
                      type="number"
                      value={answers.monthlyIncome}
                      onChange={(e) => setAnswers({ ...answers, monthlyIncome: e.target.value })}
                      placeholder="e.g., 45000"
                      className="form-input"
                    />
                    <button
                      type="button"
                      className={`field-mic-btn ${activeVoiceField === 'monthlyIncome' && voice.isListening ? 'active-mic' : ''}`}
                      onClick={() => handleVoiceForField('monthlyIncome')}
                      title={text.voiceMicTooltip}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>

                {/* Loan Purpose */}
                <div className="form-group full-width">
                  <label className="form-label">{text.loanPurpose}</label>
                  <div className="input-with-voice">
                    <input
                      type="text"
                      value={answers.loanPurpose}
                      onChange={(e) => setAnswers({ ...answers, loanPurpose: e.target.value })}
                      placeholder={text.loanPurposePlaceholder || 'e.g., Purchase machinery and stock'}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className={`field-mic-btn ${activeVoiceField === 'loanPurpose' && voice.isListening ? 'active-mic' : ''}`}
                      onClick={() => handleVoiceForField('loanPurpose')}
                      title={text.voiceMicTooltip}
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Right Column: Matching Government Schemes */}
            <section className="card schemes-card">
              <div className="card-header-flex">
                <div className="card-title-group">
                  <Award size={20} className="card-accent-icon gold" />
                  <h3 className="card-title">{text.matchingSchemes || 'Matching Government Schemes'}</h3>
                </div>
                <button
                  className="mini-speak-btn"
                  onClick={() =>
                    speakSection(
                      `Top matching scheme is ${selectedScheme.name} with ${selectedScheme.fit} percent fit. It offers ${selectedScheme.subsidy}.`
                    )
                  }
                  title={text.listen}
                >
                  <Volume2 size={16} />
                </button>
              </div>

              <div className="scheme-cards-list">
                {recommendedSchemes.map((scheme, idx) => {
                  const isSelected = selectedScheme.id === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      className={`scheme-card-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedSchemeId(scheme.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="scheme-item-top">
                        <div className="scheme-name-wrap">
                          <span className="scheme-rank">#{idx + 1}</span>
                          <h4 className="scheme-name">{scheme.name}</h4>
                        </div>
                        <div
                          className="scheme-fit-badge"
                          style={{ backgroundColor: scheme.fit >= 85 ? '#059669' : '#0284c7' }}
                        >
                          <Sparkles size={13} />
                          <span>
                            {scheme.fit}% {text.fitScore || 'Fit'}
                          </span>
                        </div>
                      </div>

                      <p className="scheme-description">{scheme.description}</p>

                      <div className="scheme-badges-row">
                        <span className="scheme-pill subsidy-pill">🏷 {scheme.subsidy}</span>
                        <span className="scheme-pill">
                          💰 {text.maxLoanCap || 'Max'}: ₹{(scheme.maxLoan / 100000).toFixed(0)} Lakhs
                        </span>
                        <span className="scheme-pill">
                          📉 {text.interestRateAnnual || 'Interest'}: ~{scheme.interest}% p.a.
                        </span>
                      </div>

                      <div className="scheme-card-footer">
                        {isSelected ? (
                          <span className="selected-tag">
                            <Check size={14} /> {text.selectedSchemeBadge || 'Selected for Application'}
                          </span>
                        ) : (
                          <span className="select-prompt">
                            {text.selectThisScheme || 'Click to select this scheme'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Nearest Government Bank Branch with Route & Contact */}
          <section className="card bank-locator-card">
            <div className="card-header-flex">
              <div className="card-title-group">
                <Landmark size={22} className="card-accent-icon" />
                <div>
                  <h3 className="card-title">
                    {text.nearestBankTitle || 'Nearest Government Bank Branch & Route'}
                  </h3>
                  <p className="card-subtitle">
                    {text.nearestBankSubtitle ||
                      'Visit the designated MSME desk officer with your scheme reference.'}
                  </p>
                </div>
              </div>
              <button
                className="mini-speak-btn"
                onClick={() =>
                  speakSection(
                    `Nearest government bank is ${selectedBank.name}, ${selectedBank.distance} away at ${selectedBank.address}. Route: ${selectedBank.route}.`
                  )
                }
                title={text.listen}
              >
                <Volume2 size={16} />
              </button>
            </div>

            <div className="banks-grid">
              {governmentBanks.map((bank) => {
                const isSelected = selectedBank.id === bank.id;
                return (
                  <div
                    key={bank.id}
                    className={`bank-card-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedBankId(bank.id)}
                  >
                    <div className="bank-card-head">
                      <div className="bank-name-badge">
                        <Building size={16} />
                        <h4 className="bank-name">{bank.name}</h4>
                      </div>
                      <span className="bank-distance-chip">📍 {bank.distance}</span>
                    </div>

                    <div className="bank-info-row">
                      <span className="info-label">{text.routeDirections || 'Route'}:</span>
                      <p className="info-value">{bank.route}</p>
                    </div>

                    <div className="bank-info-row">
                      <span className="info-label">{text.loanOfficer || 'Loan Desk'}:</span>
                      <p className="info-value font-medium">{bank.officer}</p>
                    </div>

                    <div className="bank-info-row">
                      <span className="info-label">{text.contactPhone || 'Contact'}:</span>
                      <a href={`tel:${bank.phone}`} className="phone-link">
                        <Phone size={14} /> {bank.phone}
                      </a>
                    </div>

                    <div className="bank-actions-row">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + answers.district)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="map-nav-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation size={14} /> {text.openMap || 'Google Maps Route'}
                      </a>
                      {isSelected && (
                        <span className="bank-selected-pill">
                          <Check size={14} /> Selected Bank
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Action to Proceed to Step 2 */}
          <div className="step-nav-footer">
            <div></div>
            <button
              className="primary-button proceed-cta-btn"
              onClick={handleProceedToStep2}
              id="proceed-to-step-2-btn"
            >
              <span>{text.proceedToStep2 || 'Proceed to Step 2: Documents & Form Guide'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Documents Checklist & Interactive Bank Form Assistant             */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="step-content-block">
          <div className="selected-scheme-banner">
            <div className="scheme-banner-left">
              <span className="scheme-banner-tag">Matched Scheme</span>
              <h3 className="scheme-banner-name">{selectedScheme.name}</h3>
              <span className="scheme-banner-bank">
                🏛 Designated Branch: <strong>{selectedBank.name}</strong> ({selectedBank.distance})
              </span>
            </div>
            <div className="scheme-banner-fit">
              <span className="fit-number">{selectedScheme.fit || 95}%</span>
              <span className="fit-text">{text.fitScore || 'Fit Match'}</span>
            </div>
          </div>

          <div className="page-intro-row">
            <div>
              <h2 className="flow-page-heading">{text.step2Title}</h2>
              <p className="flow-page-subtext">{text.step2Desc}</p>
            </div>
            <button className="secondary-button switch-step-btn" onClick={() => goToStep(3)}>
              <span>{text.step3Short || 'Go to Loan Sanction'}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Document Checklist Section */}
          <section className="card doc-checklist-card">
            <div className="card-header-flex">
              <div className="card-title-group">
                <FileText size={22} className="card-accent-icon" />
                <div>
                  <h3 className="card-title">
                    {text.docsSectionTitle || 'Common & Scheme-Specific Necessary Documents'}
                  </h3>
                  <p className="card-subtitle">
                    {text.docsSubtitle || 'Keep these documents ready before visiting the bank branch.'}
                  </p>
                </div>
              </div>
              <div className="doc-progress-badge">
                <span className="doc-progress-text">
                  {readyDocsCount} of {totalDocsCount} {text.docReadyCount || 'Ready'} ({docsProgressPercent}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="doc-progress-bar-track">
              <div
                className="doc-progress-bar-fill"
                style={{
                  width: `${docsProgressPercent}%`,
                  backgroundColor: docsProgressPercent === 100 ? '#10b981' : '#0284c7'
                }}
              />
            </div>

            {/* Checklist Items */}
            <div className="doc-checklist-grid">
              {defaultDocKeys.map((doc, idx) => {
                const isChecked = Boolean(checkedDocs[doc]);
                return (
                  <div
                    key={idx}
                    className={`doc-check-item ${isChecked ? 'checked' : ''}`}
                    onClick={() => toggleDoc(doc)}
                    role="checkbox"
                    aria-checked={isChecked}
                    tabIndex={0}
                  >
                    <div className="custom-checkbox">
                      {isChecked && <Check size={14} className="check-icon" />}
                    </div>
                    <span className="doc-item-name">{doc}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive Bank Form Filling Guide */}
          <section className="card bank-form-guide-card">
            <FormGuideModal text={text} voice={voice} currentLanguage={language} />
          </section>

          {/* Action to proceed to Step 3 */}
          <div className="step-nav-footer">
            <button className="secondary-button" onClick={() => goToStep(1)}>
              <ArrowLeft size={18} />
              <span>Back to Step 1: Scheme</span>
            </button>
            <button className="primary-button proceed-cta-btn" onClick={() => goToStep(3)}>
              <span>{text.proceedToStep3 || 'Proceed to Step 3: Loan Sanction Check'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Loan Sanction Check & Monthly Repayment Tracker                   */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="step-content-block">
          <div className="selected-scheme-banner">
            <div className="scheme-banner-left">
              <span className="scheme-banner-tag">Matched Scheme</span>
              <h3 className="scheme-banner-name">{selectedScheme.name}</h3>
              <span className="scheme-banner-bank">
                🏛 Designated Branch: <strong>{selectedBank.name}</strong> ({selectedBank.distance})
              </span>
            </div>
            <div className="scheme-banner-fit">
              <span className="fit-number">{selectedScheme.fit || 95}%</span>
              <span className="fit-text">{text.fitScore || 'Fit Match'}</span>
            </div>
          </div>

          <div className="page-intro-row">
            <div>
              <h2 className="flow-page-heading">{text.step3Title}</h2>
              <p className="flow-page-subtext">{text.step3Desc}</p>
            </div>
            <button className="secondary-button switch-step-btn" onClick={() => goToStep(2)}>
              <ArrowLeft size={16} />
              <span>{text.step2Short || 'Back to Documents'}</span>
            </button>
          </div>

          {/* Sanction Question Card */}
          <section className="card sanction-question-card">
            <div className="sanction-question-header">
              <HelpCircle size={24} className="card-accent-icon gold" />
              <h3 className="sanction-main-question">
                {text.sanctionQuestionTitle || 'Did your loan get sanctioned by the bank?'}
              </h3>
            </div>

            <div className="sanction-toggle-row">
              <button
                className={`sanction-choice-btn yes-choice ${sanctionStatus === 'yes' ? 'selected' : ''}`}
                onClick={() => setSanctionStatus('yes')}
              >
                <CheckCircle2 size={20} />
                <span>{text.sanctionYes || 'Yes, My Loan Got Sanctioned! 🎉'}</span>
              </button>
              <button
                className={`sanction-choice-btn no-choice ${sanctionStatus === 'no' ? 'selected' : ''}`}
                onClick={() => setSanctionStatus('no')}
              >
                <AlertCircle size={20} />
                <span>{text.sanctionNo || 'No, Not Sanctioned / In Review ⏳'}</span>
              </button>
            </div>

            {/* IF NO SANCTION: Guide user to try again or pick alternative scheme */}
            {sanctionStatus === 'no' && (
              <div className="no-sanction-panel">
                <div className="no-sanction-header">
                  <AlertCircle size={22} className="warning-icon" />
                  <h4>{text.noSanctionHeading || 'Don’t Lose Heart! We Are Here to Guide You.'}</h4>
                </div>
                <p className="no-sanction-desc">
                  {text.noSanctionDesc ||
                    'Many entrepreneurs face initial loan hold-ups due to minor document mismatches, CIBIL verification, or branch target limits.'}
                </p>

                <div className="reasons-box">
                  <h5 className="reasons-title">{text.reasonsTitle || 'Common Reasons & Quick Fixes:'}</h5>
                  <ul className="reasons-list">
                    <li>✓ {text.reason1 || 'Incomplete Quotation: Ensure supplier quotation has GSTIN and validity dates.'}</li>
                    <li>✓ {text.reason2 || 'Low CIBIL or Missing Guarantor: Explore MUDRA or CGTMSE collateral-free schemes.'}</li>
                    <li>✓ {text.reason3 || 'Project Report Detail: Clearly state your revenue and debt-servicing capacity.'}</li>
                  </ul>
                </div>

                <div className="no-sanction-actions">
                  <button className="primary-button" onClick={() => goToStep(1)}>
                    <RefreshCw size={18} />
                    <span>{text.switchSchemeAction || 'Choose Alternative Government Scheme'}</span>
                  </button>
                  <button className="secondary-button" onClick={() => goToStep(2)}>
                    <FileText size={18} />
                    <span>{text.tryAgainAction || 'Review Documents & Form Guide'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* IF YES SANCTION: Inputs for amount, interest, tenure & dynamic calculations */}
            {sanctionStatus === 'yes' && (
              <div className="yes-sanction-panel">
                <h4 className="sanction-section-title">
                  <Sparkles size={18} className="gold" />
                  {text.sanctionFormTitle || 'Enter Your Sanctioned Loan Details'}
                </h4>

                <div className="sanction-inputs-grid">
                  <div className="form-group">
                    <label className="form-label">{text.sanctionAmountLabel || 'Sanctioned Loan Amount (₹)'}</label>
                    <input
                      type="number"
                      value={sanctionAmount}
                      onChange={(e) => setSanctionAmount(Number(e.target.value))}
                      className="form-input currency-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{text.sanctionInterestLabel || 'Annual Interest Rate (%)'}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={sanctionInterest}
                      onChange={(e) => setSanctionInterest(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{text.repaymentMonthsLabel || 'Repayment Tenure (Months)'}</label>
                    <input
                      type="number"
                      value={repaymentMonths}
                      onChange={(e) => setRepaymentMonths(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Instant Financial Calculation Cards */}
                <div className="financial-summary-grid">
                  <div className="fin-card primary-fin">
                    <span className="fin-label">{text.monthlyPayment || 'Monthly EMI Payment'}</span>
                    <span className="fin-value">₹{calculations.emi.toLocaleString('en-IN')}</span>
                    <span className="fin-sub">per month for {repaymentMonths} months</span>
                  </div>

                  <div className="fin-card">
                    <span className="fin-label">{text.totalInterest || 'Total Interest Payable'}</span>
                    <span className="fin-value">₹{calculations.totalInt.toLocaleString('en-IN')}</span>
                    <span className="fin-sub">over total tenure</span>
                  </div>

                  <div className="fin-card">
                    <span className="fin-label">{text.totalRepayment || 'Total Amount Payable'}</span>
                    <span className="fin-value">₹{calculations.totalRepay.toLocaleString('en-IN')}</span>
                    <span className="fin-sub">Principal + Total Interest</span>
                  </div>

                  <div className="fin-card">
                    <span className="fin-label">{text.firstMonthPrincipal || '1st Month Principal Share'}</span>
                    <span className="fin-value font-emerald">₹{calculations.month1Principal.toLocaleString('en-IN')}</span>
                    <span className="fin-sub">Interest share: ₹{calculations.month1Interest.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* In-app Notification Alert Banner (if triggered) */}
                {notificationAlert && (
                  <div className="notification-toast-banner">
                    <div className="toast-icon-wrap">
                      <Bell size={20} className="bell-ring" />
                    </div>
                    <div className="toast-content">
                      <div className="toast-title">{text.notificationBannerTitle || 'Monthly Loan Payment Notification'}</div>
                      <p className="toast-body">{notificationAlert}</p>
                    </div>
                    <button
                      className="toast-close-btn"
                      onClick={() => setNotificationAlert(null)}
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Continuous Monthly Repayment Tracker Ledger */}
                <div className="repayment-tracker-card">
                  <div className="tracker-head">
                    <div className="tracker-title-group">
                      <Calendar size={20} className="card-accent-icon" />
                      <h4 className="tracker-title">
                        {text.trackerTitle || 'Monthly Loan Repayment Ledger & Notification Tracker'}
                      </h4>
                    </div>
                    <div className="tracker-month-badge">
                      <span>
                        {text.currentMonth || 'Installment'}: Month {currentMonthIndex} of {repaymentMonths}
                      </span>
                    </div>
                  </div>

                  {/* Loan Repayment Progress Bar */}
                  <div className="loan-progress-section">
                    <div className="loan-progress-labels">
                      <span>{text.loanRepaidProgress || 'Loan Repaid Progress'}</span>
                      <span>
                        <strong>{loanRepaidPercentage}% Repaid</strong>
                      </span>
                    </div>
                    <div className="loan-progress-track">
                      <div className="loan-progress-fill" style={{ width: `${loanRepaidPercentage}%` }} />
                    </div>
                  </div>

                  {/* Dynamic Ledger Balances */}
                  <div className="ledger-balance-grid">
                    <div className="ledger-card balance-card">
                      <span className="ledger-label">{text.remainingPrincipal || 'Remaining Principal Balance'}</span>
                      <span className="ledger-value font-red">₹{remainingPrincipalBalance.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="ledger-card">
                      <span className="ledger-label">{text.principalPaid || 'Principal Paid'}</span>
                      <span className="ledger-value font-emerald">₹{cumulativePrincipalPaid.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="ledger-card">
                      <span className="ledger-label">{text.interestPaid || 'Interest Paid'}</span>
                      <span className="ledger-value font-amber">₹{cumulativeInterestPaid.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="ledger-card">
                      <span className="ledger-label">{text.totalPaidSoFar || 'Total Paid So Far'}</span>
                      <span className="ledger-value font-blue">
                        ₹{(cumulativePrincipalPaid + cumulativeInterestPaid).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Action Controls */}
                  <div className="ledger-actions-row">
                    <button
                      className="primary-button record-emi-btn"
                      onClick={handleRecordMonthlyPayment}
                      disabled={remainingPrincipalBalance <= 0}
                    >
                      <Check size={18} />
                      <span>
                        {remainingPrincipalBalance <= 0
                          ? '🎉 Loan Fully Repaid!'
                          : `${text.recordPaymentButton || 'Record Monthly EMI Payment (₹'}${calculations.emi.toLocaleString('en-IN')})`}
                      </span>
                    </button>

                    <button
                      className="secondary-button notification-trigger-btn"
                      onClick={handleSimulateNotification}
                      title="Test monthly reminder notification"
                    >
                      <Bell size={18} />
                      <span>{text.simulateNotificationBtn || 'Simulate Next Month Reminder Notification'}</span>
                    </button>

                    <button
                      className="tertiary-button reset-btn"
                      onClick={handleResetSimulation}
                      title={text.resetSimulation || 'Reset Simulation'}
                    >
                      <RotateCcw size={16} />
                      <span>{text.resetSimulation || 'Reset'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Navigation Footer */}
          <div className="step-nav-footer">
            <button className="secondary-button" onClick={() => goToStep(2)}>
              <ArrowLeft size={18} />
              <span>Back to Step 2: Documents & Form Guide</span>
            </button>
            <Link to="/">
              <button className="primary-button">
                <span>Finish / Back to Home</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
