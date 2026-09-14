import { translations } from '../translations/index.js';

export default function AdminDashboardPage() {
  const language = localStorage.getItem('udyam-language') || 'en';
  const text = translations[language] || translations.en;

  const stats = [
    { label: text.totalUsers, value: '1,245' },
    { label: text.totalRequests, value: '864' },
    { label: text.successfulRequests, value: '782' },
    { label: text.pending, value: '82' }
  ];

  return (
    <div className="app">
      <div className="app-header">
        <div className="logo-wrap">
          <div className="logo-icon">A</div>
          <div className="logo-title">{text.adminTitle}</div>
        </div>
      </div>

      <div className="admin-grid">
        {stats.map((stat, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <div className="flow-title">{text.serviceStatus}</div>
        <div className="faq-list">
          <div className="faq-item"><strong>{text.employment}</strong><p>140 requests</p></div>
          <div className="faq-item"><strong>{text.crop}</strong><p>202 requests</p></div>
          <div className="faq-item"><strong>{text.finance}</strong><p>67 requests</p></div>
        </div>
      </div>
    </div>
  );
}
