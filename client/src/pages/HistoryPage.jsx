import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Landmark,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Wallet,
  Calendar,
  Building2,
  Trash2,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowLeft,
  Bell
} from 'lucide-react';
import { getUserSchemes, recordSchemePayment, deleteUserScheme } from '../services/api.js';
import { translations, availableLanguages, defaultLanguage } from '../translations/index.js';
import { useVoice } from '../services/useVoice.js';
import NotificationCenter from '../components/NotificationCenter.jsx';

export default function HistoryPage() {
  const navigate = useNavigate();
  const savedLanguage = localStorage.getItem('udyam-language') || defaultLanguage;
  const [language, setLanguage] = useState(translations[savedLanguage] ? savedLanguage : defaultLanguage);
  const text = translations[language] || translations.en;
  const voice = useVoice(language);

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [actionMessage, setActionMessage] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getUserSchemes('rajesh-kumar');
      if (res.success && Array.isArray(res.schemes)) {
        setSchemes(res.schemes);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('udyam-language', newLang);
  };

  const handleRecordPayment = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await recordSchemePayment(id);
      if (res.success) {
        setActionMessage(`Payment recorded successfully! Advanced to Month ${res.scheme.currentMonth}.`);
        setTimeout(() => setActionMessage(''), 4000);
        voice.speak(`Payment recorded. Now at Month ${res.scheme.currentMonth} of ${res.scheme.tenureMonths}.`);
        loadHistory();
      }
    } catch (err) {
      alert(err.message || 'Failed to record payment');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this scheme from your history?')) return;
    try {
      await deleteUserScheme(id);
      setActionMessage('Scheme journey removed.');
      setTimeout(() => setActionMessage(''), 3000);
      loadHistory();
    } catch (err) {
      alert(err.message || 'Failed to remove');
    }
  };

  const handleResume = (id) => {
    navigate(`/flow?step=3&journeyId=${id}`);
  };

  const filteredSchemes = schemes.filter((s) => {
    if (filter === 'active') return s.status === 'active_repayment' && s.remainingBalance > 0;
    if (filter === 'completed') return s.status === 'completed' || s.remainingBalance <= 0;
    return true;
  });

  const totalActiveLoans = schemes.filter((s) => s.status === 'active_repayment' && s.remainingBalance > 0).length;
  const totalOutstanding = schemes.reduce(
    (acc, s) => acc + (s.status === 'active_repayment' ? Number(s.remainingBalance || 0) : 0),
    0
  );
  const nextMonthEMI = schemes.reduce(
    (acc, s) => acc + (s.status === 'active_repayment' && s.remainingBalance > 0 ? Number(s.emi || 0) : 0),
    0
  );

  return (
    <div className="app modern-theme history-page">
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
          <NotificationCenter text={text} voice={voice} />

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
              voice.isSpeaking
                ? voice.stopSpeaking()
                : voice.speak(
                    `${text.mySchemesTitle || 'My Schemes and Loan History'}. You have ${totalActiveLoans} active loans with total outstanding balance of rupees ${totalOutstanding}.`
                  )
            }
            title={text.listen}
          >
            {voice.isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="history-container">
        {/* Navigation Breadcrumb / Back */}
        <div className="history-top-bar">
          <Link to="/" className="back-link-btn">
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>

          <Link to="/flow" className="explore-new-btn">
            <PlusCircle size={18} />
            <span>{text.exploreAnotherLoan || '+ Explore & Apply for Another Loan / Scheme'}</span>
          </Link>
        </div>

        {/* Page Hero & Overview Stats */}
        <div className="history-hero-card">
          <div className="history-hero-header">
            <div className="history-badge">
              <Clock size={16} className="gold" />
              <span>{text.journeyHistory || 'Citizen Service History • Like YouTube Watch History'}</span>
            </div>
            <h2 className="history-title">{text.mySchemesTitle || 'My Enrolled Schemes & Loan History'}</h2>
            <p className="history-subtitle">
              {text.historySubtitle ||
                'Track all schemes you have travelled with. Keep your ongoing 24-month loan running with timely notifications while searching or applying for other schemes.'}
            </p>
          </div>

          {/* Aggregate Stats */}
          <div className="history-stats-grid">
            <div className="stat-box active-stat">
              <span className="stat-label">Active Enrolled Loans</span>
              <span className="stat-value">{totalActiveLoans}</span>
              <span className="stat-sub">Ongoing Repayments</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Total Outstanding Balance</span>
              <span className="stat-value font-red">₹{totalOutstanding.toLocaleString('en-IN')}</span>
              <span className="stat-sub">Across All Active Schemes</span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Next Monthly EMI Due</span>
              <span className="stat-value font-emerald">₹{nextMonthEMI.toLocaleString('en-IN')}</span>
              <span className="stat-sub">Installment Reminders Active</span>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {actionMessage && (
          <div className="action-toast-banner animate-fade-in">
            <CheckCircle2 size={20} className="text-emerald" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="history-filter-bar">
          <div className="filter-group">
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Journeys ({schemes.length})
            </button>
            <button
              className={`filter-pill ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active Repayments ({totalActiveLoans})
            </button>
            <button
              className={`filter-pill ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Fully Repaid ({schemes.length - totalActiveLoans})
            </button>
          </div>

          <button className="refresh-btn" onClick={loadHistory} title="Refresh History">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Schemes List (YouTube-style Feed) */}
        {loading ? (
          <div className="history-loading">
            <div className="pulse-dot"></div>
            <span>Loading your scheme history from backend...</span>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="history-empty-box card">
            <Clock size={40} className="text-muted" />
            <h3>No Scheme Journeys Found</h3>
            <p>You haven’t enrolled in or saved any government schemes yet.</p>
            <Link to="/flow">
              <button className="primary-button">
                <PlusCircle size={18} />
                <span>Start Exploring Government Schemes</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="history-grid">
            {filteredSchemes.map((scheme) => {
              const tenure = Number(scheme.tenureMonths) || 24;
              const currentMonth = Number(scheme.currentMonth) || 1;
              const progressPct = Math.min(100, Math.round((currentMonth / tenure) * 100));
              const isDue = scheme.status === 'active_repayment' && scheme.remainingBalance > 0;
              const remainingInstallments = Math.max(0, tenure - currentMonth);

              return (
                <div key={scheme.id} className="history-card card hover-elevate">
                  {/* Card Header & Status */}
                  <div className="history-card-header">
                    <div className="scheme-tag-wrap">
                      <span className="scheme-tag-pill">{scheme.schemeTag || 'Govt Scheme'}</span>
                      {isDue && (
                        <span className="status-pill due-pill pulse-soft">
                          <Bell size={12} />
                          <span>Repayment Active: Month {currentMonth} of {tenure}</span>
                        </span>
                      )}
                      {!isDue && scheme.status === 'completed' && (
                        <span className="status-pill completed-pill">
                          <CheckCircle2 size={12} />
                          <span>Fully Repaid 🎉</span>
                        </span>
                      )}
                    </div>

                    <button
                      className="delete-icon-btn"
                      onClick={(e) => handleDelete(scheme.id, e)}
                      title="Remove from history"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Scheme Title & Bank Branch */}
                  <h3 className="history-scheme-name">{scheme.schemeName}</h3>
                  <div className="history-bank-info">
                    <Building2 size={15} />
                    <span>
                      {scheme.bankName} • <strong>{scheme.bankDistance || 'Nearby Branch'}</strong>
                    </span>
                  </div>

                  {/* Repayment Progress (YouTube Video Progress Style) */}
                  <div className="history-progress-wrap">
                    <div className="history-progress-labels">
                      <span>
                        Tenure Progress: <strong>Month {currentMonth} of {tenure}</strong>
                      </span>
                      <span>
                        <strong>{progressPct}% Completed</strong> ({remainingInstallments} months remaining)
                      </span>
                    </div>
                    <div className="history-progress-track">
                      <div
                        className="history-progress-fill"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: progressPct >= 100 ? '#10b981' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="history-metrics-grid">
                    <div className="h-metric">
                      <span className="h-label">Sanctioned Loan</span>
                      <span className="h-val">₹{Number(scheme.loanAmount || 0).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="h-metric">
                      <span className="h-label">Remaining Balance</span>
                      <span className="h-val font-red">
                        ₹{Number(scheme.remainingBalance || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="h-metric">
                      <span className="h-label">Monthly EMI</span>
                      <span className="h-val font-emerald">
                        ₹{Number(scheme.emi || 0).toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <div className="h-metric">
                      <span className="h-label">Interest Rate</span>
                      <span className="h-val">{scheme.interestRate || 8.0}% p.a.</span>
                    </div>
                  </div>

                  {/* Active Notification Banner if Month EMI is Due */}
                  {isDue && (
                    <div className="history-alert-strip">
                      <AlertCircle size={16} className="text-amber" />
                      <span>
                        Month {currentMonth} installment of ₹{(scheme.emi || 0).toLocaleString('en-IN')} is due.
                        Ensure timely credit to maintain score.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="history-card-actions">
                    <button
                      className="primary-button resume-loan-btn"
                      onClick={() => handleResume(scheme.id)}
                    >
                      <span>{text.resumeJourney || 'Resume / Manage Repayment'}</span>
                      <ArrowRight size={16} />
                    </button>

                    {isDue && (
                      <button
                        className="secondary-button pay-emi-btn"
                        onClick={(e) => handleRecordPayment(scheme.id, e)}
                        title="Record payment for this month"
                      >
                        <Wallet size={16} />
                        <span>Pay Month {currentMonth} EMI</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
