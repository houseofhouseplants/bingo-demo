import { useState, useEffect, useCallback, useRef } from 'react';
import type { SpeechRecognitionState } from '../types';

// Web Speech API type shim
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

const SpeechRecognitionCtor: (new () => SpeechRecognitionInstance) | null =
  (typeof window !== 'undefined' &&
    ((window as unknown as Record<string, unknown>).SpeechRecognition as new () => SpeechRecognitionInstance ||
     (window as unknown as Record<string, unknown>).webkitSpeechRecognition as new () => SpeechRecognitionInstance)) ||
  null;

export function useSpeechRecognition(onFinalResult?: (transcript: string) => void) {
  const [state, setState] = useState<SpeechRecognitionState>({
    isSupported: !!SpeechRecognitionCtor,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const listeningRef = useRef(false);
  const onResultRef = useRef(onFinalResult);
  onResultRef.current = onFinalResult;

  useEffect(() => {
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setState(prev => ({
        ...prev,
        transcript: prev.transcript + final,
        interimTranscript: interim,
      }));
      if (final) onResultRef.current?.(final);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return; // ignore silence
      setState(prev => ({ ...prev, error: event.error, isListening: false }));
      listeningRef.current = false;
    };

    recognition.onend = () => {
      // auto-restart if we're still supposed to be listening
      if (listeningRef.current) {
        try { recognition.start(); } catch { /* already started */ }
      } else {
        setState(prev => ({ ...prev, isListening: false, interimTranscript: '' }));
      }
    };

    recognitionRef.current = recognition;
    return () => { listeningRef.current = false; recognition.stop(); };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    listeningRef.current = true;
    setState(prev => ({ ...prev, isListening: true, transcript: '', interimTranscript: '', error: null }));
    try { recognitionRef.current.start(); } catch { /* already running */ }
  }, []);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    recognitionRef.current?.stop();
    setState(prev => ({ ...prev, isListening: false, interimTranscript: '' }));
  }, []);

  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '', interimTranscript: '' }));
  }, []);

  return { ...state, startListening, stopListening, resetTranscript };
}
