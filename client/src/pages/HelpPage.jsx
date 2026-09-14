import { Link } from 'react-router-dom';
import { translations } from '../translations/index.js';

export default function HelpPage() {
  const language = localStorage.getItem('udyam-language') || 'en';
  const text = translations[language] || translations.en;

  const faqs = [
    { q: text.helpFaqs.q1, a: text.helpFaqs.a1 },
    { q: text.helpFaqs.q2, a: text.helpFaqs.a2 },
    { q: text.helpFaqs.q3, a: text.helpFaqs.a3 }
  ];

  return (
    <div className="app">
      <div className="app-header">
        <div className="logo-wrap">
          <div className="logo-icon">?</div>
          <div className="logo-title">{text.helpTitle}</div>
        </div>
      </div>

      <div className="help-card">
        <div className="flow-title">{text.commonQuestions}</div>
        <div className="faq-list">
          {faqs.map((faq, i) => (
            <div className="faq-item" key={i}>
              <strong>{faq.q}</strong>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="home-actions">
          <Link to="/flow">
            <button className="primary-button">{text.askForHelp}</button>
          </Link>
          <a href="tel:+18000000000">
            <button className="secondary-button">{text.callSupport}</button>
          </a>
        </div>
      </div>
    </div>
  );
}
