import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertCircle, ArrowRight, Volume2, Calendar, CheckCircle } from 'lucide-react';
import { getNotifications } from '../services/api.js';

export default function NotificationCenter({ text = {}, voice = null }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await getNotifications('rajesh-kumar');
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      // Graceful fallback: local offline alerts
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenLoan = (journeyId) => {
    setIsOpen(false);
    if (journeyId) {
      navigate(`/flow?step=3&journeyId=${journeyId}`);
    } else {
      navigate('/history');
    }
  };

  const handleSpeakAlert = (alertText, e) => {
    e.stopPropagation();
    if (voice) {
      voice.speak(alertText);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="notification-center-wrap" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Loan Repayment Notifications & Reminders"
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown-panel animate-slide-down">
          <div className="notif-dropdown-header">
            <div className="notif-header-title">
              <Bell size={18} className="gold" />
              <span>{text.loanNotifications || 'Loan & Repayment Reminders'}</span>
            </div>
            <span className="notif-count-pill">{unreadCount} Active</span>
          </div>

          <div className="notif-dropdown-list">
            {notifications.length === 0 ? (
              <div className="notif-empty-state">
                <CheckCircle size={32} className="text-emerald" />
                <p>All loan installments and schemes are up to date! No pending alerts.</p>
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  className="notif-item-card"
                  onClick={() => handleOpenLoan(notif.journeyId)}
                >
                  <div className="notif-item-top">
                    <div className="notif-item-badge">
                      <AlertCircle size={14} />
                      <span>{notif.schemeName || 'Active Loan'}</span>
                    </div>
                    {voice && (
                      <button
                        className="notif-speak-btn"
                        onClick={(e) => handleSpeakAlert(`${notif.title}. ${notif.message}`, e)}
                        title="Listen alert"
                      >
                        <Volume2 size={15} />
                      </button>
                    )}
                  </div>

                  <h5 className="notif-item-title">{notif.title}</h5>
                  <p className="notif-item-msg">{notif.message}</p>

                  <div className="notif-item-footer">
                    <span className="notif-item-meta">
                      <Calendar size={13} />
                      Installment Due
                    </span>
                    <span className="notif-action-link">
                      Manage Repayment <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notif-dropdown-footer">
            <button
              className="notif-view-all-btn"
              onClick={() => {
                setIsOpen(false);
                navigate('/history');
              }}
            >
              <span>{text.viewAllSchemes || 'View All My Schemes & History'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
