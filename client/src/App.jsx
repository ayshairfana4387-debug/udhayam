import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import UserFlowPage from './pages/UserFlowPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flow" element={<UserFlowPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Routes>
    </div>
  );
}
