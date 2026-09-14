import { useState, useMemo } from 'react';
import { Search, Mic, MicOff, Volume2, VolumeX, HelpCircle, FileSpreadsheet, CreditCard, Landmark, CheckSquare, Sparkles } from 'lucide-react';
import { bankFormGuide } from '../data/bankFormGuide.js';

export default function FormGuideModal({ text, voice, currentLanguage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(bankFormGuide[0]);

  const categories = ['All', 'Bank Details', 'Business & Project', 'Identity & Registration', 'Loan & Financials'];

  const filteredItems = useMemo(() => {
    return bankFormGuide.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCat;
      const matchText =
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term) ||
        item.keywords.some((k) => k.toLowerCase().includes(term)) ||
        item.locationTip.toLowerCase().includes(term);
      return matchCat && matchText;
    });
  }, [searchTerm, activeCategory]);

  const handleVoiceSearch = () => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening((transcript) => {
        setSearchTerm(transcript);
      });
    }
  };

  const speakAnswer = (item) => {
    const speechText = `${item.question}. ${item.answer} ${item.locationTip ? 'Where to look: ' + item.locationTip : ''}`;
    voice.speak(speechText);
  };

  return (
    <div className="bank-guide-wrapper">
      <div className="guide-header">
        <div className="guide-header-text">
          <h3 className="guide-title">
            <HelpCircle size={22} className="accent-icon" />
            {text.bankFormAssistantTitle || 'Bank Form Filling Smart Assistant'}
          </h3>
          <p className="guide-subtitle">
            {text.bankFormSubtitle || 'Confused about questions in the bank loan form? Select a field or speak your doubt.'}
          </p>
        </div>
      </div>

      <div className="guide-controls">
        <div className="guide-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={text.searchGuidePlaceholder || 'Search form field (e.g. Account Number, IFSC, Project Cost)...'}
            className="guide-search-input"
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Clear search">
              ×
            </button>
          )}
          <button
            className={`guide-mic-btn ${voice.isListening ? 'listening' : ''}`}
            onClick={handleVoiceSearch}
            title={voice.isListening ? text.voiceStop : text.speakQuestion}
            aria-label="Voice Search"
          >
            {voice.isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        <div className="category-pill-row">
          {categories.map((cat) => {
            const label =
              cat === 'All'
                ? text.filterAll || 'All'
                : cat === 'Bank Details'
                ? text.filterBank || 'Bank Details'
                : cat === 'Business & Project'
                ? text.filterProject || 'Business & Project'
                : cat === 'Identity & Registration'
                ? text.filterIdentity || 'Identity & Registration'
                : text.filterFinancials || 'Loan & Financials';
            return (
              <button
                key={cat}
                className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'Bank Details' && <Landmark size={14} />}
                {cat === 'Business & Project' && <FileSpreadsheet size={14} />}
                {cat === 'Identity & Registration' && <CheckSquare size={14} />}
                {cat === 'Loan & Financials' && <CreditCard size={14} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="guide-layout">
        {/* Left column: List of questions */}
        <div className="guide-list-col">
          {filteredItems.length === 0 ? (
            <div className="guide-empty-state">
              <p>No matching guide found for "{searchTerm}".</p>
              <button className="secondary-button" onClick={() => setSearchTerm('')}>
                Show All Questions
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  className={`guide-item-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="guide-item-tag">{item.category}</div>
                  <div className="guide-item-question">{item.question}</div>
                  <div className="guide-item-preview">{item.locationTip}</div>
                </button>
              );
            })
          )}
        </div>

        {/* Right column: Selected question details & visual guide */}
        {selectedItem && (
          <div className="guide-detail-card">
            <div className="guide-detail-head">
              <div className="guide-detail-tag">{selectedItem.category}</div>
              <button
                className="speak-answer-btn"
                onClick={() => (voice.isSpeaking ? voice.stopSpeaking() : speakAnswer(selectedItem))}
                title={voice.isSpeaking ? text.stopAudio : text.speakAnswer}
              >
                {voice.isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{voice.isSpeaking ? text.stopAudio || 'Stop' : text.speakAnswer || 'Listen Answer'}</span>
              </button>
            </div>

            <h4 className="guide-detail-question">{selectedItem.question}</h4>

            <div className="guide-answer-box">
              <p className="guide-answer-text">{selectedItem.answer}</p>
            </div>

            {/* Visual Location Callout */}
            <div className="visual-callout-card">
              <div className="visual-callout-head">
                <Sparkles size={16} className="sparkle-icon" />
                <span>{text.whereToFind || 'Where to find this in your documents:'}</span>
              </div>
              <div className="visual-callout-body">
                <div className="visual-source-badge">
                  📍 {selectedItem.locationTip}
                </div>
                {selectedItem.exampleValue && (
                  <div className="example-value-box">
                    <span className="example-label">{text.exampleLabel || 'Example / Format:'}</span>
                    <code className="example-code">{selectedItem.exampleValue}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
