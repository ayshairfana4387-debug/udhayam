import { useState, useEffect, useRef, useCallback } from 'react';

const langCodeMap = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN'
};

export function useVoice(language = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const targetLang = langCodeMap[language] || 'en-IN';
  const isRecognitionSupported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const isSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // ignore
      }
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback((onResultCallback) => {
    if (!isRecognitionSupported) {
      setVoiceError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      stopListening();
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.lang = targetLang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        const currentText = (finalText || interimText).trim();
        setTranscript(currentText);

        if (finalText && onResultCallback) {
          onResultCallback(finalText.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          setVoiceError(`Voice error (${event.error}). Please try speaking again.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setVoiceError('Could not start microphone. Please check browser permissions.');
      setIsListening(false);
    }
  }, [isRecognitionSupported, targetLang, stopListening]);

  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSynthesisSupported]);

  const speak = useCallback((text) => {
    if (!isSynthesisSupported || !text) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [isSynthesisSupported, targetLang]);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return {
    isListening,
    transcript,
    voiceError,
    isSpeaking,
    isRecognitionSupported,
    isSynthesisSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
}
