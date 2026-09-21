import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Volume2, VolumeX, CheckCircle, ArrowRight, FileText, Wallet, ShieldCheck, Sparkles, Building2, PhoneCall, Clock } from 'lucide-react';
import { translations, availableLanguages, defaultLanguage } from '../translations/index.js';
import { useVoice } from '../services/useVoice.js';
import NotificationCenter from '../components/NotificationCenter.jsx';

export default function HomePage() {
  const savedLanguage = localStorage.getItem('udyam-language') || defaultLanguage;
  const initialLanguage = translations[savedLanguage] ? savedLanguage : defaultLanguage;
  const [language, setLanguage] = useState(initialLanguage);
  const text = translations[language] || translations.en;

  const voice = useVoice(language);

  useEffect(() => {
    localStorage.setItem('udyam-language', language);
  }, [language]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newText = translations[newLang] || translations.en;
    if (voice.isSpeaking) {
      voice.stopSpeaking();
    }
    voice.speak(`${newText.appName}. ${newText.homeTitle}`);
  };

  const speakWelcome = () => {
    if (voice.isSpeaking) {
      voice.stopSpeaking();
    } else {
      voice.speak(`${text.appName}. ${text.homeTitle}. ${text.homeSubtitle}`);
    }
  };

  return (
    <div className="app modern-theme">
      {/* App Header */}
      <header className="app-header">
        <div className="logo-wrap">
          <div className="logo-icon pulse-soft">
            <Landmark size={28} />
          </div>
          <div>
            <h1 className="logo-title">{text.appName}</h1>
            <p className="logo-tagline">{text.tagline || 'Government Loan & Subsidy Portal'}</p>
          </div>
        </div>

        <div className="header-controls">
          <NotificationCenter text={text} voice={voice} />

          <Link to="/history" className="header-history-link" title="My Enrolled Schemes & Loan History">
            <Clock size={18} />
            <span className="history-link-text">{text.mySchemes || 'My Schemes'}</span>
          </Link>

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
            onClick={speakWelcome}
            aria-label={text.listen}
            title={text.listen}
          >
            {voice.isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero modern-hero">
        <div className="hero-badge">
          <Sparkles size={16} />
          <span>Atmanirbhar Bharat • MSME Government Credit</span>
        </div>
        <h2 className="hero-title">{text.homeTitle}</h2>
        <p className="hero-subtitle">{text.homeSubtitle}</p>

        {/* 3 Step Interactive Workflow Overview Cards */}
        <div className="workflow-overview-grid">
          <div className="workflow-card step-1-accent">
            <div className="workflow-step-num">1</div>
            <div className="workflow-icon"><Building2 size={24} /></div>
            <h3 className="workflow-title">{text.step1Short || 'Scheme & Bank'}</h3>
            <p className="workflow-desc">
              Answer questionnaire & discover schemes (PMEGP, MUDRA, Stand-Up) with fit % & nearest government bank route.
            </p>
          </div>

          <div className="workflow-card step-2-accent">
            <div className="workflow-step-num">2</div>
            <div className="workflow-icon"><FileText size={24} /></div>
            <h3 className="workflow-title">{text.step2Short || 'Docs & Form Guide'}</h3>
            <p className="workflow-desc">
              Prepare necessary documents & use interactive guidance for bank form questions (Passbook A/C, IFSC, Project Cost).
            </p>
          </div>

          <div className="workflow-card step-3-accent">
            <div className="workflow-step-num">3</div>
            <div className="workflow-icon"><Wallet size={24} /></div>
            <h3 className="workflow-title">{text.step3Short || 'Sanction & Repayment'}</h3>
            <p className="workflow-desc">
              Sanction check, instant EMI calculation & continuous monthly reducing balance tracking with notification reminders.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hero-actions-row">
          <Link to="/flow" className="primary-action-link">
            <button className="primary-button hero-cta">
              <span>{text.startFlow || 'Start Loan Eligibility Check'}</span>
              <ArrowRight size={20} />
            </button>
          </Link>
          <Link to="/history" className="secondary-action-link">
            <button className="secondary-button history-cta-btn">
              <Clock size={18} />
              <span>{text.mySchemes || 'My Schemes & Loan History'}</span>
            </button>
          </Link>
          <Link to="/flow?step=2" className="tertiary-action-link">
            <button className="tertiary-button form-guide-btn">
              <FileText size={18} />
              <span>{text.viewGuide || 'Bank Form Guide'}</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Key Guarantees / Trust Badges */}
      <section className="trust-strip">
        <div className="trust-item">
          <ShieldCheck size={18} className="trust-icon" />
          <span>Direct Govt Schemes (PMEGP, MUDRA, Stand-Up)</span>
        </div>
        <div className="trust-item">
          <CheckCircle size={18} className="trust-icon" />
          <span>Voice Recognition in 6 Languages</span>
        </div>
        <div className="trust-item">
          <Landmark size={18} className="trust-icon" />
          <span>Public Sector Bank Locator with Directions</span>
        </div>
      </section>

      {/* Footer / Quick Nav */}
      <footer className="home-footer">
        <div className="footer-links">
          <Link to="/help" className="footer-link">{text.help}</Link>
          <span className="footer-dot">•</span>
          <Link to="/admin" className="footer-link">{text.adminTitle || 'Dashboard'}</Link>
        </div>
        <p className="footer-copy">© 2026 Udyam Sahayak • Digital Public Infrastructure for Entrepreneurs</p>
      </footer>
    </div>
  );
}
